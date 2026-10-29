import { NextResponse } from "next/server";
import { getAuthUserId } from "@/server/auth/getUser";
import { GeminiService } from "@/server/services/gemini.service";

export async function POST(req: Request) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

    return NextResponse.json({ success: true, draft });
  } catch (err: any) {
    console.error("Error generating roadmap with Gemini AI:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to generate AI roadmap" },
      { status: 500 }
    );
  }
}
