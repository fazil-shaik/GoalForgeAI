import { getDb } from "@/db";
import { ensureDatabaseInitialized } from "@/db/init";
import { goals, coachMessages, planProposals, aiRequests } from "@/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export const RATE_LIMIT_CONFIG = {
  MAX_GOALS_PER_USER: 2,
  MAX_COACH_REQUESTS_PER_DAY: 4,
  MAX_RECOVERY_REQUESTS_PER_DAY: 1,
} as const;

export interface RateLimitCheckResult {
  allowed: boolean;
  limit: number;
  current: number;
  remaining: number;
  resetsAt?: string;
  retryAfterSeconds?: number;
  message?: string;
  feature: "goal_creation" | "ai_coach" | "goal_recovery";
}

export interface UserRateLimitsSummary {
  goals: {
    limit: number;
    current: number;
    remaining: number;
    allowed: boolean;
  };
  coach: {
    limit: number;
    current: number;
    remaining: number;
    allowed: boolean;
    resetsAt: string;
  };
  recovery: {
    limit: number;
    current: number;
    remaining: number;
    allowed: boolean;
    resetsAt: string;
  };
}

export class RateLimitService {
  /**
   * Helper to compute start of UTC day and seconds until next midnight reset
   */
  private static getUtcDayWindow() {
    const now = new Date();
    const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0));
    const retryAfterSeconds = Math.max(1, Math.ceil((endOfDay.getTime() - now.getTime()) / 1000));
    return { startOfDay, endOfDay, retryAfterSeconds };
  }

  /**
   * Check if user is allowed to create another goal (Max 2 active goals per user)
   */
  static async checkGoalLimit(userId: string): Promise<RateLimitCheckResult> {
    await ensureDatabaseInitialized();
    const db = getDb();
    if (!db) {
      return {
        allowed: true,
        limit: RATE_LIMIT_CONFIG.MAX_GOALS_PER_USER,
        current: 0,
        remaining: RATE_LIMIT_CONFIG.MAX_GOALS_PER_USER,
        feature: "goal_creation",
      };
    }

    // Count non-archived goals for the user
    const userGoals = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(goals)
      .where(and(eq(goals.userId, userId), sql`${goals.status} != 'archived'`));

    const currentCount = Number(userGoals[0]?.count || 0);
    const limit = RATE_LIMIT_CONFIG.MAX_GOALS_PER_USER;
    const allowed = currentCount < limit;
    const remaining = Math.max(0, limit - currentCount);

    return {
      allowed,
      limit,
      current: currentCount,
      remaining,
      feature: "goal_creation",
      message: allowed
        ? undefined
        : `Goal limit reached: Each account is limited to ${limit} active goals. Complete or archive an existing goal to create a new one.`,
    };
  }

  /**
   * Check if user can send another AI Coach message (Max 4 requests per day)
   */
  static async checkCoachLimit(userId: string): Promise<RateLimitCheckResult> {
    await ensureDatabaseInitialized();
    const db = getDb();
    const { startOfDay, endOfDay, retryAfterSeconds } = this.getUtcDayWindow();

    if (!db) {
      return {
        allowed: true,
        limit: RATE_LIMIT_CONFIG.MAX_COACH_REQUESTS_PER_DAY,
        current: 0,
        remaining: RATE_LIMIT_CONFIG.MAX_COACH_REQUESTS_PER_DAY,
        resetsAt: endOfDay.toISOString(),
        retryAfterSeconds,
        feature: "ai_coach",
      };
    }

    // Count user messages sent to coach today
    const coachQuery = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(coachMessages)
      .where(
        and(
          eq(coachMessages.userId, userId),
          eq(coachMessages.sender, "user"),
          gte(coachMessages.timestamp, startOfDay)
        )
      );

    const currentCount = Number(coachQuery[0]?.count || 0);
    const limit = RATE_LIMIT_CONFIG.MAX_COACH_REQUESTS_PER_DAY;
    const allowed = currentCount < limit;
    const remaining = Math.max(0, limit - currentCount);

    return {
      allowed,
      limit,
      current: currentCount,
      remaining,
      resetsAt: endOfDay.toISOString(),
      retryAfterSeconds,
      feature: "ai_coach",
      message: allowed
        ? undefined
        : `Daily AI Coach quota reached: You have used all ${limit} questions for today. Your quota resets at midnight UTC.`,
    };
  }

  /**
   * Check if user can generate another AI Goal Recovery plan (Max 1 per day)
   */
  static async checkRecoveryLimit(userId: string): Promise<RateLimitCheckResult> {
    await ensureDatabaseInitialized();
    const db = getDb();
    const { startOfDay, endOfDay, retryAfterSeconds } = this.getUtcDayWindow();

    if (!db) {
      return {
        allowed: true,
        limit: RATE_LIMIT_CONFIG.MAX_RECOVERY_REQUESTS_PER_DAY,
        current: 0,
        remaining: RATE_LIMIT_CONFIG.MAX_RECOVERY_REQUESTS_PER_DAY,
        resetsAt: endOfDay.toISOString(),
        retryAfterSeconds,
        feature: "goal_recovery",
      };
    }

    // Count recovery proposals generated today for this user across their goals
    const recoveryQuery = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(planProposals)
      .innerJoin(goals, eq(planProposals.goalId, goals.id))
      .where(
        and(
          eq(goals.userId, userId),
          gte(planProposals.createdAt, startOfDay)
        )
      );

    const currentCount = Number(recoveryQuery[0]?.count || 0);
    const limit = RATE_LIMIT_CONFIG.MAX_RECOVERY_REQUESTS_PER_DAY;
    const allowed = currentCount < limit;
    const remaining = Math.max(0, limit - currentCount);

    return {
      allowed,
      limit,
      current: currentCount,
      remaining,
      resetsAt: endOfDay.toISOString(),
      retryAfterSeconds,
      feature: "goal_recovery",
      message: allowed
        ? undefined
        : `Daily Recovery Plan quota reached: You can generate ${limit} AI recovery plan per day. Your quota resets at midnight UTC.`,
    };
  }

  /**
   * Log an AI request to the audit ledger in Neon PostgreSQL
   */
  static async logAiRequest(params: {
    userId: string;
    goalId?: string;
    taskType: "roadmap" | "coach" | "recovery";
    status: "success" | "error" | "rate_limited";
    latencyMs?: number;
    tokenUsage?: number;
  }) {
    try {
      await ensureDatabaseInitialized();
      const db = getDb();
      if (!db) return;

      await db.insert(aiRequests).values({
        userId: params.userId,
        goalId: params.goalId || null,
        taskType: params.taskType,
        provider: "gemini",
        model: "gemini-1.5-pro",
        status: params.status,
        latencyMs: params.latencyMs || null,
        tokenUsage: params.tokenUsage || null,
      });
    } catch (err) {
      // Non-fatal telemetry error
      console.warn("[RateLimitService] Failed to log AI request:", err);
    }
  }

  /**
   * Get all rate limits for a user at once for the dashboard UI
   */
  static async getUserRateLimits(userId: string): Promise<UserRateLimitsSummary> {
    const [goalLimit, coachLimit, recoveryLimit] = await Promise.all([
      this.checkGoalLimit(userId),
      this.checkCoachLimit(userId),
      this.checkRecoveryLimit(userId),
    ]);

    const { endOfDay } = this.getUtcDayWindow();
    const resetsAt = endOfDay.toISOString();

    return {
      goals: {
        limit: goalLimit.limit,
        current: goalLimit.current,
        remaining: goalLimit.remaining,
        allowed: goalLimit.allowed,
      },
      coach: {
        limit: coachLimit.limit,
        current: coachLimit.current,
        remaining: coachLimit.remaining,
        allowed: coachLimit.allowed,
        resetsAt: coachLimit.resetsAt || resetsAt,
      },
      recovery: {
        limit: recoveryLimit.limit,
        current: recoveryLimit.current,
        remaining: recoveryLimit.remaining,
        allowed: recoveryLimit.allowed,
        resetsAt: recoveryLimit.resetsAt || resetsAt,
      },
    };
  }

  /**
   * Standard RFC-compliant HTTP 429 response helper
   */
  static createRateLimitResponse(info: RateLimitCheckResult) {
    const headers: Record<string, string> = {
      "X-RateLimit-Limit": info.limit.toString(),
      "X-RateLimit-Remaining": Math.max(0, info.remaining).toString(),
    };

    if (info.resetsAt) {
      headers["X-RateLimit-Reset"] = info.resetsAt;
    }
    if (info.retryAfterSeconds && info.remaining === 0) {
      headers["Retry-After"] = info.retryAfterSeconds.toString();
    }

    return NextResponse.json(
      {
        error: info.message || "Too many requests",
        code: "RATE_LIMIT_EXCEEDED",
        feature: info.feature,
        rateLimit: {
          limit: info.limit,
          current: info.current,
          remaining: info.remaining,
          resetsAt: info.resetsAt,
        },
      },
      {
        status: 429,
        headers,
      }
    );
  }
}
