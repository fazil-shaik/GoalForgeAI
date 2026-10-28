import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL || "");

export async function initDatabase() {
  if (!process.env.DATABASE_URL) {
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
        timezone TEXT DEFAULT 'UTC',
        preferences JSONB DEFAULT '{"availableMinutesPerDay": 45, "coachingStyle": "compassionate", "primaryCategory": "Software Engineering & Cloud"}'::jsonb,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `;

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

    console.log("✅ [DB Init] All PRD tables successfully verified & active in Neon PostgreSQL!");
    return true;
  } catch (err) {
    console.error("❌ [DB Init] Error verifying tables in database:", err);
    return false;
  }
}
