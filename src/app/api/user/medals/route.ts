import { NextResponse } from "next/server";
import { getAuthUserId } from "@/server/auth/getUser";
import { MedalRepository, ALL_MEDAL_DEFINITIONS } from "@/server/repositories/medal.repository";
import { getDb } from "@/db";
import { goals } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET() {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userMedals = await MedalRepository.listByUserId(userId);
  const unlockedKeys = new Set(userMedals.map((m) => m.medalKey));

  // Count user completed hard goals
  const db = getDb();
  let hardGoalsCount = 0;
  let totalGoalsCompleted = 0;

  if (db) {
    const userCompletedGoals = await db
      .select({ id: goals.id, feasibilityRisk: goals.feasibilityRisk })
      .from(goals)
      .where(and(eq(goals.userId, userId), eq(goals.status, "completed")));

    totalGoalsCompleted = userCompletedGoals.length;
    hardGoalsCount = userCompletedGoals.filter(
      (g) => g.feasibilityRisk === "high_risk"
    ).length;
  }

  const medals = ALL_MEDAL_DEFINITIONS.map((def) => {
    const unlockedRecord = userMedals.find((m) => m.medalKey === def.key);
    return {
      ...def,
      isUnlocked: unlockedKeys.has(def.key),
      unlockedAt: unlockedRecord?.unlockedAt || null,
      goalId: unlockedRecord?.goalId || null,
      metadata: unlockedRecord?.metadataJson || null,
    };
  });

  return NextResponse.json({
    medals,
    unlockedCount: userMedals.length,
    totalDefinitions: ALL_MEDAL_DEFINITIONS.length,
    hardGoalsCount,
    totalGoalsCompleted,
  });
}
