import { NextResponse } from "next/server";
import { getAuthUserId } from "@/server/auth/getUser";
import { TaskService } from "@/server/services/task.service";
import { Task } from "@/types/goal";

export async function GET(req: Request) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const goalId = searchParams.get("goalId");

  if (!goalId) {
    return NextResponse.json({ error: "goalId is required" }, { status: 400 });
  }

  const rawTasks = await TaskService.getTasksForGoal(goalId);
  const formattedTasks: Task[] = rawTasks.map((t) => ({
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

  return NextResponse.json({ tasks: formattedTasks });
}

export async function POST(req: Request) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const created = await TaskService.createTask(
      body.goalId,
      body.milestoneId,
      body.title,
      body.estimatedMinutes || body.estimateMinutes || 30,
      body.dueDate || body.dueAt,
      body.priority || "normal",
      body.completionCriteria,
      body.description
    );

    if (!created) {
      return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
    }

    const formattedTask: Task = {
      id: created.id,
      goalId: created.goalId,
      milestoneId: created.milestoneId,
      title: created.title,
      description: created.description || "",
      estimatedMinutes: created.estimateMinutes,
      actualMinutes: created.actualMinutes || undefined,
      dueDate: created.dueAt,
      priority: created.priority as any,
      status: created.status as any,
      completionCriteria: created.completionCriteria || "",
      notes: created.notes || undefined,
      completedAt: created.updatedAt?.toISOString(),
    };

    return NextResponse.json({ success: true, task: formattedTask }, { status: 201 });
  } catch (err: any) {
    console.error("[Tasks API] Error creating task:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to create task" },
      { status: 500 }
    );
  }
}
