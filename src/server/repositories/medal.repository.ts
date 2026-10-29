import { getDb } from "@/db";
import { userMedals, goals, milestones, tasks, planProposals, taskEvents } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { ensureDatabaseInitialized } from "@/db/init";

export interface MedalDefinition {
  key: string;
  title: string;
  description: string;
  tier: "bronze" | "silver" | "gold" | "platinum" | "diamond";
  iconType: string;
  category: "hard_goal" | "streak" | "recovery" | "milestone" | "milestone_count";
}

export const ALL_MEDAL_DEFINITIONS: MedalDefinition[] = [
  {
    key: "titan_conqueror",
    title: "Titan Goal Conqueror",
    description: "Successfully conquered a High-Risk, high-complexity Hard Goal with 100% milestone mastery.",
    tier: "platinum",
    iconType: "trophy",
    category: "hard_goal",
  },
  {
    key: "phoenix_resurgence",
    title: "Phoenix Resurgence",
    description: "Rebounded from schedule slippage via Goal Recovery Mode and brought the goal to completion.",
    tier: "gold",
    iconType: "flame",
    category: "recovery",
  },
  {
    key: "summit_master",
    title: "Summit Master",
    description: "Reached the pinnacle checkpoint of an ambitious roadmap with 3+ strategic milestones.",
    tier: "gold",
    iconType: "mountain",
    category: "milestone",
  },
  {
    key: "iron_streak",
    title: "Iron Discipline Medal",
    description: "Maintained an unbroken 7-day daily execution streak without skipping focus sprints.",
    tier: "diamond",
    iconType: "zap",
    category: "streak",
  },
  {
    key: "centurion",
    title: "Centurion Finisher",
    description: "Crushed 10+ actionable daily execution tasks across active roadmaps.",
    tier: "silver",
    iconType: "shield",
    category: "milestone_count",
  },
  {
    key: "first_blood",
    title: "First Blood Medal",
    description: "Forged and finalized your inaugural goal on GoalForge.",
    tier: "bronze",
    iconType: "target",
    category: "hard_goal",
  },
];

export class MedalRepository {
  /**
   * List all medals awarded to a user
   */
  static async listByUserId(userId: string) {
    await ensureDatabaseInitialized();
    const db = getDb();
    if (!db) return [];
    try {
      return await db
        .select()
        .from(userMedals)
        .where(eq(userMedals.userId, userId))
        .orderBy(desc(userMedals.unlockedAt));
    } catch (err) {
      console.warn("[MedalRepository] Notice listing medals:", err);
      return [];
    }
  }

  /**
   * Award a medal safely without duplicate spam
   */
  static async awardMedal(
    userId: string,
    medal: {
      key: string;
      title: string;
      description: string;
      tier: "bronze" | "silver" | "gold" | "platinum" | "diamond";
      iconType?: string;
      goalId?: string;
      metadata?: any;
    }
  ) {
    await ensureDatabaseInitialized();
    const db = getDb();
    if (!db) return null;

    try {
      // Check if user already has this medal for this goal or globally
      const existing = await db
        .select({ id: userMedals.id })
        .from(userMedals)
        .where(
          and(
            eq(userMedals.userId, userId),
            eq(userMedals.medalKey, medal.key),
            medal.goalId ? eq(userMedals.goalId, medal.goalId) : sql`TRUE`
          )
        )
        .limit(1);

      if (existing.length > 0) {
        return null; // Already unlocked
      }

      const inserted = await db
        .insert(userMedals)
        .values({
          userId,
          goalId: medal.goalId || null,
          medalKey: medal.key,
          title: medal.title,
          description: medal.description,
          tier: medal.tier,
          iconType: medal.iconType || "trophy",
          metadataJson: medal.metadata || {},
        })
        .returning();

      return inserted[0] || null;
    } catch (err) {
      console.error("[MedalRepository] Error awarding medal:", err);
      return null;
    }
  }

  /**
   * Evaluate and award medals upon goal completion
   */
  static async evaluateGoalCompletionMedals(goalId: string, userId: string) {
    await ensureDatabaseInitialized();
    const db = getDb();
    if (!db) return { newlyUnlockedMedals: [], isHardGoal: false };

    const newlyUnlockedMedals: any[] = [];

    // 1. Fetch goal graph
    const [goal] = await db.select().from(goals).where(eq(goals.id, goalId)).limit(1);
    if (!goal) return { newlyUnlockedMedals: [], isHardGoal: false };

    const goalMilestones = await db
      .select()
      .from(milestones)
      .where(eq(milestones.goalId, goalId));

    const goalTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.goalId, goalId));

    const proposals = await db
      .select({ id: planProposals.id })
      .from(planProposals)
      .where(eq(planProposals.goalId, goalId))
      .limit(1);

    // 2. Determine if it qualifies as a "Hard Goal"
    const isHardGoal =
      goal.feasibilityRisk === "high_risk" ||
      goal.feasibilityRisk === "moderate_risk" ||
      goalMilestones.length >= 2 ||
      goalTasks.length >= 3;

    // 3. Award Titan Goal Conqueror
    if (isHardGoal) {
      const titanMedal = await this.awardMedal(userId, {
        key: "titan_conqueror",
        title: "Titan Goal Conqueror",
        description: `Successfully conquered the Hard Goal: "${goal.title}" with 100% roadmap mastery.`,
        tier: "platinum",
        iconType: "trophy",
        goalId: goal.id,
        metadata: {
          goalTitle: goal.title,
          feasibilityRisk: goal.feasibilityRisk,
          milestoneCount: goalMilestones.length,
          taskCount: goalTasks.length,
        },
      });
      if (titanMedal) newlyUnlockedMedals.push(titanMedal);
    }

    // 4. Award Summit Master (Milestone roadmap summit)
    if (goalMilestones.length >= 2 || goalTasks.length >= 3) {
      const summitMedal = await this.awardMedal(userId, {
        key: "summit_master",
        title: "Summit Master",
        description: `Reached the summit of an ambitious multi-phase roadmap for "${goal.title}".`,
        tier: "gold",
        iconType: "mountain",
        goalId: goal.id,
        metadata: { milestoneCount: goalMilestones.length },
      });
      if (summitMedal) newlyUnlockedMedals.push(summitMedal);
    }

    // 5. Award Phoenix Resurgence if goal experienced slippage recovery
    if (proposals.length > 0) {
      const phoenixMedal = await this.awardMedal(userId, {
        key: "phoenix_resurgence",
        title: "Phoenix Resurgence",
        description: `Overcame slippage blockers and achieved victory on "${goal.title}".`,
        tier: "gold",
        iconType: "flame",
        goalId: goal.id,
      });
      if (phoenixMedal) newlyUnlockedMedals.push(phoenixMedal);
    }

    // 6. Award First Blood
    const firstBloodMedal = await this.awardMedal(userId, {
      key: "first_blood",
      title: "First Blood Medal",
      description: "Forged and completed an outcome on GoalForge.",
      tier: "bronze",
      iconType: "target",
      goalId: goal.id,
    });
    if (firstBloodMedal) newlyUnlockedMedals.push(firstBloodMedal);

    // 7. Award Centurion Finisher if total tasks completed >= 10
    const totalEvents = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(taskEvents)
      .where(and(eq(taskEvents.userId, userId), eq(taskEvents.eventType, "completed")));

    if ((totalEvents[0]?.count || 0) >= 10) {
      const centurionMedal = await this.awardMedal(userId, {
        key: "centurion",
        title: "Centurion Finisher",
        description: "Completed 10+ actionable daily execution tasks on GoalForge.",
        tier: "silver",
        iconType: "shield",
      });
      if (centurionMedal) newlyUnlockedMedals.push(centurionMedal);
    }

    return { newlyUnlockedMedals, isHardGoal };
  }
}
