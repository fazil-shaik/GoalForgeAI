import { getDb } from "@/db";
import { userStreaks, taskEvents, users } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  isActiveToday: boolean;
  isStreakAtRisk: boolean;
  activeDaysThisWeek: string[]; // ['2026-10-25', '2026-10-26', ...]
  totalTasksCompleted: number;
  lastActivityDate: string | null;
}

export class StreakRepository {
  /**
   * Fetch current streak status for a user, calculating dynamically from task_events
   * and synchronizing with the user_streaks table in Neon PostgreSQL.
   */
  static async getStreakForUser(userId: string): Promise<StreakInfo> {
    const db = getDb();
    const todayStr = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    if (!db) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        isActiveToday: false,
        isStreakAtRisk: false,
        activeDaysThisWeek: [],
        totalTasksCompleted: 0,
        lastActivityDate: null,
      };
    }

    // 1. Fetch completed task events for this user
    const completedEvents = await db
      .select({ occurredAt: taskEvents.occurredAt })
      .from(taskEvents)
      .where(and(eq(taskEvents.userId, userId), eq(taskEvents.eventType, "completed")))
      .orderBy(desc(taskEvents.occurredAt));

    const totalTasksCompleted = completedEvents.length;

    // 2. Extract distinct YYYY-MM-DD dates in descending order
    const dateSet = new Set<string>();
    completedEvents.forEach((ev) => {
      const d = ev.occurredAt.toISOString().split("T")[0];
      dateSet.add(d);
    });
    const uniqueDatesDesc = Array.from(dateSet).sort().reverse();

    // 3. Compute Streak
    let currentStreak = 0;
    let longestStreak = 0;
    let isActiveToday = false;
    let isStreakAtRisk = false;

    if (uniqueDatesDesc.length > 0) {
      const mostRecent = uniqueDatesDesc[0];
      isActiveToday = mostRecent === todayStr;
      const isYesterday = mostRecent === yesterdayStr;

      if (isActiveToday || isYesterday) {
        let expectedDate = new Date(mostRecent);
        currentStreak = 1;
        for (let i = 1; i < uniqueDatesDesc.length; i++) {
          const prevExpected = new Date(expectedDate);
          prevExpected.setDate(prevExpected.getDate() - 1);
          const prevExpectedStr = prevExpected.toISOString().split("T")[0];
          if (uniqueDatesDesc[i] === prevExpectedStr) {
            currentStreak++;
            expectedDate = prevExpected;
          } else {
            break;
          }
        }
      }

      isStreakAtRisk = !isActiveToday && isYesterday;

      // Compute all-time longest streak
      longestStreak = currentStreak;
      let tempStreak = 1;
      for (let i = 0; i < uniqueDatesDesc.length - 1; i++) {
        const cur = new Date(uniqueDatesDesc[i]);
        const next = new Date(uniqueDatesDesc[i + 1]);
        const diffDays = Math.round((cur.getTime() - next.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak++;
          if (tempStreak > longestStreak) longestStreak = tempStreak;
        } else {
          tempStreak = 1;
        }
      }
    }

    // 4. Calculate active days this week (last 7 calendar days)
    const activeDaysThisWeek: string[] = [];
    for (let offset = 6; offset >= 0; offset--) {
      const day = new Date(Date.now() - offset * 24 * 60 * 60 * 1000);
      const dayStr = day.toISOString().split("T")[0];
      if (dateSet.has(dayStr)) {
        activeDaysThisWeek.push(dayStr);
      }
    }

    const lastActivityDate = uniqueDatesDesc[0] || null;

    // 5. Upsert to Neon user_streaks table
    try {
      const existing = await db
        .select()
        .from(userStreaks)
        .where(eq(userStreaks.userId, userId))
        .limit(1);

      const maxLongest = Math.max(longestStreak, existing[0]?.longestStreak || 0);

      if (existing.length === 0) {
        await db.insert(userStreaks).values({
          userId,
          currentStreak,
          longestStreak: maxLongest,
          lastActivityDate,
          totalTasksCompleted,
        });
      } else {
        await db
          .update(userStreaks)
          .set({
            currentStreak,
            longestStreak: maxLongest,
            lastActivityDate,
            totalTasksCompleted,
            updatedAt: new Date(),
          })
          .where(eq(userStreaks.userId, userId));
      }
    } catch (err) {
      console.warn("[StreakRepository] Non-fatal upsert sync error:", err);
    }

    return {
      currentStreak,
      longestStreak: Math.max(longestStreak, currentStreak),
      isActiveToday,
      isStreakAtRisk,
      activeDaysThisWeek,
      totalTasksCompleted,
      lastActivityDate,
    };
  }
}
