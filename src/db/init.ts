import { neon } from "@neondatabase/serverless";

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

let initPromise: Promise<boolean> | null = null;

export async function ensureDatabaseInitialized(): Promise<boolean> {
  if (!initPromise) {
    initPromise = initDatabase().catch((err) => {
      initPromise = null;
      console.error("[DB Init] Initialization error:", err);
      return false;
    });
  }
  return initPromise;
}

export async function initDatabase() {
  const sql = getSql();
  if (!sql) {
    console.warn("[DB Init] No DATABASE_URL found.");
    return false;
  }

  try {
    console.log("[DB Init] Ensuring all GoalForge PRD tables exist in Neon PostgreSQL...");

    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT,
        email TEXT NOT NULL UNIQUE,
        email_verified TIMESTAMP,
        image TEXT,
        bio TEXT,
        is_public BOOLEAN DEFAULT true,
        timezone TEXT DEFAULT 'UTC',
        preferences JSONB DEFAULT '{"availableMinutesPerDay": 45, "coachingStyle": "compassionate", "primaryCategory": "Software Engineering & Cloud", "isPublic": true}'::jsonb,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;

    // Ensure columns exist on already created tables
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;`;

    await sql`
      CREATE TABLE IF NOT EXISTS accounts (
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        provider TEXT NOT NULL,
        provider_account_id TEXT NOT NULL,
        refresh_token TEXT,
        access_token TEXT,
        expires_at INTEGER,
        token_type TEXT,
        scope TEXT,
        id_token TEXT,
        session_state TEXT,
        PRIMARY KEY (provider, provider_account_id)
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        session_token TEXT PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires TIMESTAMP NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS verification_tokens (
        identifier TEXT NOT NULL,
        token TEXT NOT NULL,
        expires TIMESTAMP NOT NULL,
        PRIMARY KEY (identifier, token)
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS goals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        outcome TEXT NOT NULL,
        category TEXT NOT NULL,
        baseline TEXT,
        target_metric TEXT,
        target_value TEXT,
        target_date TEXT NOT NULL,
        status TEXT DEFAULT 'active' NOT NULL,
        feasibility_risk TEXT DEFAULT 'moderate_risk' NOT NULL,
        active_plan_version INTEGER DEFAULT 1 NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS plan_versions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
        version_number INTEGER NOT NULL,
        status TEXT DEFAULT 'approved' NOT NULL,
        summary TEXT,
        created_by TEXT DEFAULT 'user' NOT NULL,
        prompt_version TEXT DEFAULT 'v1.0',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS milestones (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
        plan_version_id UUID REFERENCES plan_versions(id) ON DELETE SET NULL,
        title TEXT NOT NULL,
        description TEXT,
        due_date TEXT NOT NULL,
        status TEXT DEFAULT 'pending' NOT NULL,
        completion_criteria_json JSONB DEFAULT '[]'::jsonb,
        "order" INTEGER DEFAULT 1 NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
        milestone_id UUID NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
        plan_version_id UUID REFERENCES plan_versions(id) ON DELETE SET NULL,
        title TEXT NOT NULL,
        description TEXT,
        estimate_minutes INTEGER DEFAULT 30 NOT NULL,
        actual_minutes INTEGER,
        due_at TEXT NOT NULL,
        priority TEXT DEFAULT 'normal' NOT NULL,
        status TEXT DEFAULT 'todo' NOT NULL,
        completion_criteria TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS task_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        event_type TEXT NOT NULL,
        metadata_json JSONB DEFAULT '{}'::jsonb,
        occurred_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS plan_proposals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
        base_version_id UUID REFERENCES plan_versions(id) ON DELETE SET NULL,
        proposed_diff_json JSONB NOT NULL,
        reason TEXT NOT NULL,
        status TEXT DEFAULT 'pending' NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS coach_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
        sender TEXT NOT NULL,
        text TEXT NOT NULL,
        recommended_next_action TEXT,
        reason TEXT,
        timestamp TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS user_streaks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        current_streak INTEGER DEFAULT 0 NOT NULL,
        longest_streak INTEGER DEFAULT 0 NOT NULL,
        last_activity_date TEXT,
        total_tasks_completed INTEGER DEFAULT 0 NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS user_medals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,
        medal_key TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        tier TEXT DEFAULT 'gold' NOT NULL,
        icon_type TEXT DEFAULT 'trophy' NOT NULL,
        metadata_json JSONB DEFAULT '{}'::jsonb,
        unlocked_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;

    // Ensure community leaderboard cohort exists in Neon DB
    await seedCommunityLeaderboard(sql);

    console.log("✅ [DB Init] All PRD tables successfully verified & active in Neon PostgreSQL!");
    return true;
  } catch (err) {
    console.error("❌ [DB Init] Error verifying tables in database:", err);
    return false;
  }
}

/**
 * Seed realistic community leaderboard performers into Neon PostgreSQL
 * so users can compete against active GoalForge masters dynamically.
 */
async function seedCommunityLeaderboard(sql: any) {
  try {
    const existingUsers = await sql`SELECT count(*)::int as count FROM users`;
    if (existingUsers[0]?.count >= 4) {
      return; // Already populated
    }

    console.log("[DB Init] Seeding community leaderboard champions in Neon DB...");

    const cohort = [
      {
        name: "Elena Rostova",
        email: "elena.rostova@cloudforge.io",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        category: "Cloud Architecture & High-Scale Systems",
        completedGoals: 7,
        hardGoals: 5,
        streak: 21,
        medals: [
          { key: "titan_conqueror", title: "Titan Goal Conqueror", desc: "Completed 5 High-Risk Complex Engineering Goals", tier: "platinum" },
          { key: "iron_streak", title: "Iron Discipline Medal", desc: "Maintained a 21-day execution streak", tier: "diamond" },
          { key: "summit_master", title: "Summit Master", desc: "Reached the apex of 6 ambitious roadmaps", tier: "gold" },
        ]
      },
      {
        name: "Marcus Chen",
        email: "marcus.chen@ai-nexus.dev",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        category: "Machine Learning & Distributed LLMs",
        completedGoals: 6,
        hardGoals: 4,
        streak: 15,
        medals: [
          { key: "titan_conqueror", title: "Titan Goal Conqueror", desc: "Finished High-Risk Transformer Scaling Goal", tier: "platinum" },
          { key: "phoenix_resurgence", title: "Phoenix Resurgence", desc: "Recovered from 4 overdue sprint blockers", tier: "gold" },
        ]
      },
      {
        name: "Sarah Jenkins",
        email: "sarah.j@endurance-iron.org",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
        category: "Ultra-Marathon & Peak Biohacking",
        completedGoals: 5,
        hardGoals: 3,
        streak: 34,
        medals: [
          { key: "iron_streak", title: "Iron Discipline Medal", desc: "30+ consecutive days of morning roadwork", tier: "diamond" },
          { key: "centurion", title: "Centurion Finisher", desc: "Completed 50+ grueling physical preparation tasks", tier: "gold" },
        ]
      },
      {
        name: "Alex Rivera",
        email: "alex.rivera@microforge.co",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
        category: "Fullstack SaaS & Micro-Ventures",
        completedGoals: 4,
        hardGoals: 2,
        streak: 9,
        medals: [
          { key: "first_blood", title: "First Blood Medal", desc: "First production SaaS launch in 30 days", tier: "silver" },
          { key: "summit_master", title: "Summit Master", desc: "Completed MVP to First 100 Paying Users roadmap", tier: "gold" },
        ]
      }
    ];

    for (const champion of cohort) {
      const inserted = await sql`
        INSERT INTO users (name, email, image, preferences)
        VALUES (
          ${champion.name},
          ${champion.email},
          ${champion.image},
          ${JSON.stringify({ primaryCategory: champion.category, coachingStyle: "analytical", availableMinutesPerDay: 60 })}::jsonb
        )
        ON CONFLICT (email) DO NOTHING
        RETURNING id;
      `;

      let champUserId = inserted[0]?.id;
      if (!champUserId) {
        const found = await sql`SELECT id FROM users WHERE email = ${champion.email} LIMIT 1`;
        champUserId = found[0]?.id;
      }
      if (!champUserId) continue;

      // Seed user streak
      await sql`
        INSERT INTO user_streaks (user_id, current_streak, longest_streak, total_tasks_completed, last_activity_date)
        VALUES (${champUserId}, ${champion.streak}, ${champion.streak + 5}, ${champion.completedGoals * 8}, CURRENT_DATE::text)
        ON CONFLICT (user_id) DO NOTHING;
      `;

      // Seed completed goals if empty for this user
      const existingGoals = await sql`SELECT count(*)::int as count FROM goals WHERE user_id = ${champUserId}`;
      if (existingGoals[0]?.count === 0) {
        for (let i = 0; i < champion.completedGoals; i++) {
          const isHard = i < champion.hardGoals;
          await sql`
            INSERT INTO goals (user_id, title, outcome, category, target_date, status, feasibility_risk)
            VALUES (
              ${champUserId},
              ${`${champion.category.split("&")[0].trim()} Milestone Challenge #${i + 1}`},
              ${`Successfully achieve outcome for tier ${i + 1}`},
              ${champion.category},
              '2026-10-15',
              'completed',
              ${isHard ? "high_risk" : "moderate_risk"}
            );
          `;
        }
      }

      // Seed medals if empty for this user
      const existingMedals = await sql`SELECT count(*)::int as count FROM user_medals WHERE user_id = ${champUserId}`;
      if (existingMedals[0]?.count === 0) {
        for (const m of champion.medals) {
          await sql`
            INSERT INTO user_medals (user_id, medal_key, title, description, tier, icon_type)
            VALUES (${champUserId}, ${m.key}, ${m.title}, ${m.desc}, ${m.tier}, 'trophy');
          `;
        }
      }
    }

    console.log("✅ [DB Init] Community leaderboard champions successfully seeded!");
  } catch (err) {
    console.warn("[DB Init] Notice seeding community users (non-fatal):", err);
  }
}
