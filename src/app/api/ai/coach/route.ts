import { NextResponse } from "next/server";
import { getAuthUserId } from "@/server/auth/getUser";
import { GoalRepository } from "@/server/repositories/goal.repository";
import { TaskRepository } from "@/server/repositories/task.repository";
import { CoachRepository } from "@/server/repositories/coach.repository";
import { GeminiService } from "@/server/services/gemini.service";
import { CoachMessage } from "@/types/goal";

export async function POST(req: Request) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { goalId, message } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const todayDate = body.todayDate || new Date().toISOString().split("T")[0];

    // Fetch active goal & task metrics from Neon DB
    const goal = goalId ? await GoalRepository.getById(goalId) : null;
    const allTasks = goalId ? await TaskRepository.listByGoalId(goalId) : [];

    const completedTasks = allTasks.filter((t) => t.status === "completed");
    const pendingTasks = allTasks.filter((t) => t.status === "todo");
    const todayTasks = allTasks.filter((t) => t.dueAt === todayDate && t.status === "todo");
    const overdueTasks = allTasks.filter((t) => t.dueAt < todayDate && t.status === "todo");

    const recentHistory = goalId
      ? await CoachRepository.listByGoalId(goalId, 6)
      : [];

    // Save user message to Neon DB
    const userMsgRecord = await CoachRepository.addMessage({
      userId,
      goalId: goalId || undefined,
      sender: "user",
      text: message.trim(),
    });

    // Call Gemini AI
    const geminiReply = await GeminiService.chatWithCoach({
      message: message.trim(),
      goalContext: {
        title: goal?.title || "My Career & Skills Ambition",
        category: goal?.category || "Personal Growth",
        deadline: goal?.targetDate || "2026-12-31",
        feasibilityRisk: goal?.feasibilityRisk || "moderate_risk",
        completedTasksCount: completedTasks.length,
        pendingTasksCount: pendingTasks.length,
        overdueTasksCount: overdueTasks.length,
        todayTasks: todayTasks.map((t) => ({
          title: t.title,
          estimatedMinutes: t.estimateMinutes,
        })),
        overdueTasks: overdueTasks.map((t) => ({
          title: t.title,
          estimatedMinutes: t.estimateMinutes,
          dueDate: t.dueAt,
        })),
      },
      coachingStyle: body.coachingStyle || "compassionate",
      recentMessages: recentHistory.map((m) => ({
        sender: m.sender,
        text: m.text,
      })),
    });

    // Save Coach response to Neon DB
    const coachMsgRecord = await CoachRepository.addMessage({
      userId,
      goalId: goalId || undefined,
      sender: "coach",
      text: geminiReply.text,
      recommendedNextAction: geminiReply.recommendedNextAction,
      reason: geminiReply.reason,
    });

    const userMessage: CoachMessage = {
      id: userMsgRecord?.id || "usr_" + Date.now(),
      sender: "user",
      text: message.trim(),
      timestamp: userMsgRecord?.timestamp?.toISOString() || new Date().toISOString(),
    };

    const coachMessage: CoachMessage = {
      id: coachMsgRecord?.id || "coach_" + Date.now(),
      sender: "coach",
      text: geminiReply.text,
      recommendedNextAction: geminiReply.recommendedNextAction,
      reason: geminiReply.reason,
      suggestedFollowup: geminiReply.suggestedFollowup,
      timestamp: coachMsgRecord?.timestamp?.toISOString() || new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      userMessage,
      coachMessage,
    });
  } catch (err: any) {
    console.error("Error in AI Coach chat:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to generate AI coach response" },
      { status: 500 }
    );
  }
}
