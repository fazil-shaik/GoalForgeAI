import { NextResponse } from "next/server";
import { getAuthUserId } from "@/server/auth/getUser";
import { GeminiService } from "@/server/services/gemini.service";
import { RateLimitService } from "@/server/services/rate-limit.service";

export async function POST(req: Request) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit check: Maximum 2 goals per user
  const goalLimit = await RateLimitService.checkGoalLimit(userId);
  if (!goalLimit.allowed) {
    await RateLimitService.logAiRequest({
      userId,
      taskType: "roadmap",
      status: "rate_limited",
    });
    return RateLimitService.createRateLimitResponse(goalLimit);
  }

  const startTime = Date.now();
  try {
    const body = await req.json();

    if (!body.ambition || !body.ambition.trim()) {
      return NextResponse.json({ error: "Ambition is required" }, { status: 400 });
    }

    const draft = await GeminiService.generateRoadmap({
      ambition: body.ambition.trim(),
      category: body.category || "Software Engineering & Cloud",
      baseline: body.baseline,
      targetDate: body.targetDate || "2026-12-15",
      dailyMinutes: body.dailyMinutes || 45,
      constraints: body.constraints,
      coachingStyle: body.coachingStyle,
    });

    const latencyMs = Date.now() - startTime;
    await RateLimitService.logAiRequest({
      userId,
      taskType: "roadmap",
      status: "success",
      latencyMs,
    });

    return NextResponse.json({
      success: true,
      draft,
      quota: {
        limit: goalLimit.limit,
        current: goalLimit.current,
        remaining: goalLimit.remaining,
      },
    });
  } catch (err: any) {
    console.error("Error generating roadmap with Gemini AI:", err);
    await RateLimitService.logAiRequest({
      userId,
      taskType: "roadmap",
      status: "error",
      latencyMs: Date.now() - startTime,
    });
    return NextResponse.json(
      { error: err?.message || "Failed to generate AI roadmap" },
      { status: 500 }
    );
  }
}
