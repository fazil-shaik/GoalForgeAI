import { NextResponse } from "next/server";
import { getAuthUserId } from "@/server/auth/getUser";
import { GoalService } from "@/server/services/goal.service";

export async function GET() {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rawGoals = await GoalService.getUserGoals(userId);
  const formattedGoals = rawGoals.map((g) => ({
    id: g.id,
    title: g.title,
    outcome: g.outcome,
    category: g.category,
    baseline: g.baseline || "",
    targetMetric: g.targetMetric || "",
    targetValue: g.targetValue || "",
    deadline: g.targetDate,
    status: g.status,
    feasibilityRisk: g.feasibilityRisk,
    activePlanVersion: g.activePlanVersion,
    createdAt: g.createdAt.toISOString(),
  }));

  return NextResponse.json({ goals: formattedGoals });
}

export async function POST(req: Request) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const result = await GoalService.createGoalWithRoadmap(
      userId,
      {
        title: body.goal.title,
        outcome: body.goal.outcome,
        category: body.goal.category,
        baseline: body.goal.baseline,
        targetMetric: body.goal.targetMetric,
        targetValue: body.goal.targetValue,
        targetDate: body.goal.deadline || body.goal.targetDate,
        feasibilityRisk: body.goal.feasibilityRisk || "moderate_risk",
      },
      body.milestones.map((m: any, idx: number) => ({
        tempId: m.id || `m_${idx + 1}`,
        title: m.title,
        description: m.description,
        dueDate: m.dueDate,
        completionCriteriaJson: m.completionCriteria || [],
        order: m.order || idx + 1,
      })),
      body.tasks.map((t: any) => ({
        milestoneTempId: t.milestoneId,
        title: t.title,
        description: t.description,
        estimateMinutes: t.estimatedMinutes || t.estimateMinutes || 30,
        dueAt: t.dueDate || t.dueAt,
        priority: t.priority || "normal",
        completionCriteria: t.completionCriteria,
      }))
    );

    return NextResponse.json({ success: true, ...result }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating goal in Neon DB:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create goal" },
      { status: 500 }
    );
  }
}
