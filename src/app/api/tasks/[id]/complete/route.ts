import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/config";
import { TaskService } from "@/server/services/task.service";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: taskId } = await params;
  const userId = (session.user as any).id;
  const body = await req.json().catch(() => ({}));

  const updatedTask = await TaskService.completeTask(
    taskId,
    userId,
    body.actualMinutes
  );

  return NextResponse.json({ success: true, task: updatedTask });
}
