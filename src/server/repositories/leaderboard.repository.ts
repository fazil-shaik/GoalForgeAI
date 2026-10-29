import { getDb } from "@/db";
import { users, goals, userMedals, userStreaks, taskEvents } from "@/db/schema";
import { eq, desc, sql, and } from "drizzle-orm";

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  image: string | null;
  category: string;
  totalGoalsCompleted: number;
  hardGoalsCompleted: number;
  currentStreak: number;
  medalsCount: number;
  recentMedals: Array<{
    key: string;
    title: string;
    tier: string;
  }>;
  forgeScore: number;
  isCurrentUser: boolean;
}

export class LeaderboardRepository {
  /**
   * Fetch live, dynamic leaderboard of GoalForge users from Neon DB
   */
  static async getLeaderboard(
    currentUserId: string | null,
    sortBy: "goals" | "hard_goals" | "streak" | "medals" = "goals"
  ): Promise<LeaderboardEntry[]> {
    const db = getDb();
    if (!db) return [];

    // 1. Fetch all users
    const allUsers = await db.select().from(users);

    // 2. Fetch all completed goals
    const completedGoals = await db
      .select({
        id: goals.id,
        userId: goals.userId,
        feasibilityRisk: goals.feasibilityRisk,
      })
      .from(goals)
      .where(eq(goals.status, "completed"));

    // 3. Fetch all medals
    const allMedals = await db
      .select({
        id: userMedals.id,
        userId: userMedals.userId,
        medalKey: userMedals.medalKey,
        title: userMedals.title,
        tier: userMedals.tier,
      })
      .from(userMedals)
      .orderBy(desc(userMedals.unlockedAt));

    // 4. Fetch all streaks
    const allStreaks = await db.select().from(userStreaks);

    // Map streak by userId
    const streakMap = new Map<string, number>();
    allStreaks.forEach((s) => streakMap.set(s.userId, s.currentStreak || 0));

    // Map completed goals by userId
    const goalsMap = new Map<string, { total: number; hard: number }>();
    completedGoals.forEach((g) => {
      const cur = goalsMap.get(g.userId) || { total: 0, hard: 0 };
      cur.total += 1;
      if (g.feasibilityRisk === "high_risk") {
        cur.hard += 1;
      }
      goalsMap.set(g.userId, cur);
    });

    // Map medals by userId
    const medalsMap = new Map<string, Array<{ key: string; title: string; tier: string }>>();
    allMedals.forEach((m) => {
      const list = medalsMap.get(m.userId) || [];
      list.push({ key: m.medalKey, title: m.title, tier: m.tier });
      medalsMap.set(m.userId, list);
    });

    // 5. Aggregate entries
    const entries: LeaderboardEntry[] = allUsers.map((u) => {
      const gStats = goalsMap.get(u.id) || { total: 0, hard: 0 };
      const streak = streakMap.get(u.id) || 0;
      const userMedalList = medalsMap.get(u.id) || [];
      const medalsCount = userMedalList.length;

      // Calculate Forge XP Score
      const forgeScore =
        gStats.total * 300 +
        gStats.hard * 500 +
        medalsCount * 150 +
        streak * 40;

      const category = (u.preferences as any)?.primaryCategory || "Personal Growth & Skills";

      return {
        rank: 0,
        userId: u.id,
        name: u.name || "GoalForge Challenger",
        image: u.image || null,
        category,
        totalGoalsCompleted: gStats.total,
        hardGoalsCompleted: gStats.hard,
        currentStreak: streak,
        medalsCount,
        recentMedals: userMedalList.slice(0, 3),
        forgeScore,
        isCurrentUser: Boolean(currentUserId && u.id === currentUserId),
      };
    });

    // 6. Sort according to criteria
    entries.sort((a, b) => {
      if (sortBy === "hard_goals") {
        if (b.hardGoalsCompleted !== a.hardGoalsCompleted) {
          return b.hardGoalsCompleted - a.hardGoalsCompleted;
        }
        return b.totalGoalsCompleted - a.totalGoalsCompleted;
      } else if (sortBy === "streak") {
        if (b.currentStreak !== a.currentStreak) {
          return b.currentStreak - a.currentStreak;
        }
        return b.totalGoalsCompleted - a.totalGoalsCompleted;
      } else if (sortBy === "medals") {
        if (b.medalsCount !== a.medalsCount) {
          return b.medalsCount - a.medalsCount;
        }
        return b.forgeScore - a.forgeScore;
      } else {
        // Default: "goals" (Who completed more goals using GoalForge)
        if (b.totalGoalsCompleted !== a.totalGoalsCompleted) {
          return b.totalGoalsCompleted - a.totalGoalsCompleted;
        }
        if (b.hardGoalsCompleted !== a.hardGoalsCompleted) {
          return b.hardGoalsCompleted - a.hardGoalsCompleted;
        }
        return b.forgeScore - a.forgeScore;
      }
    });

    // Assign rank positions (1-based)
    entries.forEach((e, index) => {
      e.rank = index + 1;
    });

    return entries;
  }
}
