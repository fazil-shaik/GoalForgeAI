import { NextResponse } from "next/server";
import { getAuthUserId } from "@/server/auth/getUser";
import { GoalService } from "@/server/services/goal.service";
import { Goal, Milestone, Task, RecoveryProposal, CoachMessage } from "@/types/goal";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: goalId } = await params;
  const graph = await GoalService.getGoalDetails(goalId);

  if (!graph || !graph.goal) {
    return NextResponse.json({ error: "Goal not found" }, { status: 404 });
  }

  const formattedGoal: Goal = {
    id: graph.goal.id,
    title: graph.goal.title,
    outcome: graph.goal.outcome,
    category: graph.goal.category,
    baseline: graph.goal.baseline || "",
    targetMetric: graph.goal.targetMetric || "",
    targetValue: graph.goal.targetValue || "",
    deadline: graph.goal.targetDate,
    status: graph.goal.status as any,
    feasibilityRisk: graph.goal.feasibilityRisk as any,
    activePlanVersion: graph.goal.activePlanVersion,
    createdAt: graph.goal.createdAt.toISOString(),
  };

  const formattedMilestones: Milestone[] = graph.milestones.map((m) => ({
    id: m.id,
    goalId: m.goalId,
    title: m.title,
    description: m.description || "",
    dueDate: m.dueDate,
    status: m.status as any,
    completionCriteria: (m.completionCriteriaJson as string[]) || [],
    order: m.order,
  }));

  const formattedTasks: Task[] = graph.tasks.map((t) => ({
    id: t.id,
    goalId: t.goalId,
    milestoneId: t.milestoneId,
    title: t.title,
    description: t.description || "",
    estimatedMinutes: t.estimateMinutes,
    actualMinutes: t.actualMinutes || undefined,
    dueDate: t.dueAt,
    priority: t.priority as any,
    status: t.status as any,
    completionCriteria: t.completionCriteria || "",
    notes: t.notes || undefined,
    completedAt: t.updatedAt?.toISOString(),
  }));

  let formattedProposal: RecoveryProposal | null = null;
  if (graph.activeProposal) {
    const p = graph.activeProposal;
    const diff = p.proposedDiffJson as any;
    formattedProposal = {
      id: p.id,
      goalId: p.goalId,
      triggerReason: diff?.triggerReason || p.reason,
      recoverySummary: diff?.recoverySummary || p.reason,
      blockerHypotheses: diff?.blockerHypotheses || [],
      proposedChanges: diff?.proposedChanges || [],
      firstStep: diff?.firstStep || "Complete today's primary focus session.",
      tradeoffs: diff?.tradeoffs || [],
      status: p.status === "rejected" ? "dismissed" : (p.status as any),
      createdAt: p.createdAt.toISOString(),
    };
  }

  const formattedCoachMessages: CoachMessage[] = graph.coachMessages.map((msg) => ({
    id: msg.id,
    sender: msg.sender as any,
    text: msg.text,
    recommendedNextAction: msg.recommendedNextAction || undefined,
    reason: msg.reason || undefined,
    timestamp: msg.timestamp.toISOString(),
  }));

  return NextResponse.json({
    goal: formattedGoal,
    milestones: formattedMilestones,
    tasks: formattedTasks,
    activeProposal: formattedProposal,
    coachMessages: formattedCoachMessages,
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: goalId } = await params;
  const body = await req.json();

  if (body.status === "paused") {
    await GoalService.pauseGoal(goalId);
  } else if (body.status === "active") {
    await GoalService.resumeGoal(goalId);
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: goalId } = await params;
  await GoalService.deleteGoal(goalId);
  return NextResponse.json({ success: true });
}
