import { NextResponse } from "next/server";
import { getAuthUserId } from "@/server/auth/getUser";
import { TaskService } from "@/server/services/task.service";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: taskId } = await params;
  const body = await req.json();

  let updated = null;

  if (body.status === "completed") {
    updated = await TaskService.completeTask(taskId, userId, body.actualMinutes);
  } else if (body.dueDate || body.dueAt) {
    updated = await TaskService.rescheduleTask(taskId, userId, body.dueDate || body.dueAt);
  } else if (body.status === "skipped") {
    updated = await TaskService.skipTask(taskId, userId, body.reason || body.notes);
  }

  return NextResponse.json({ success: true, task: updated });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: taskId } = await params;
  await TaskService.deleteTask(taskId);
  return NextResponse.json({ success: true });
}
