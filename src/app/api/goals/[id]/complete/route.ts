import { NextResponse } from "next/server";
import { getAuthUserId } from "@/server/auth/getUser";
import { GoalRepository } from "@/server/repositories/goal.repository";
import { MedalRepository } from "@/server/repositories/medal.repository";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: goalId } = await params;

  // 1. Update goal status to completed in Neon DB
  const updatedGoal = await GoalRepository.updateStatus(goalId, "completed");
  if (!updatedGoal) {
    return NextResponse.json({ error: "Goal not found" }, { status: 404 });
  }

  // 2. Evaluate hard goal status and award medals
  const { newlyUnlockedMedals, isHardGoal } =
    await MedalRepository.evaluateGoalCompletionMedals(goalId, userId);

  return NextResponse.json({
    success: true,
    goal: updatedGoal,
    isHardGoal,
    newlyUnlockedMedals,
  });
}
