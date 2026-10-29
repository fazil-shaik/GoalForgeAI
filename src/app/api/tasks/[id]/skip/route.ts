import { NextResponse } from "next/server";
import { getAuthUserId } from "@/server/auth/getUser";
import { TaskService } from "@/server/services/task.service";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: taskId } = await params;
  const body = await req.json().catch(() => ({}));

  const updatedTask = await TaskService.skipTask(
    taskId,
    userId,
    body.reason
  );

  return NextResponse.json({ success: true, task: updatedTask });
}
