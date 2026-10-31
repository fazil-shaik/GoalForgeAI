import { NextResponse } from "next/server";
import { getAuthUserId } from "@/server/auth/getUser";
import { RecoveryService } from "@/server/services/recovery.service";
import { RateLimitService } from "@/server/services/rate-limit.service";
import { RecoveryProposal } from "@/types/goal";

export async function POST(req: Request) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit check: Maximum 1 Recovery Plan generation per day
  const recoveryLimit = await RateLimitService.checkRecoveryLimit(userId);
  if (!recoveryLimit.allowed) {
    await RateLimitService.logAiRequest({
      userId,
      taskType: "recovery",
      status: "rate_limited",
    });
    return RateLimitService.createRateLimitResponse(recoveryLimit);
  }

  const startTime = Date.now();
  try {
    const body = await req.json();
    const goalId = body.goalId;
    const userReason = body.userReason || "Schedule crunch & unexpected commitments";
    const todayDate = body.todayDate || new Date().toISOString().split("T")[0];

    if (!goalId) {
      return NextResponse.json({ error: "goalId is required" }, { status: 400 });
    }

    const savedProposal = await RecoveryService.diagnoseAndPropose(
      goalId,
      userId,
      userReason,
      todayDate
    );

    if (!savedProposal) {
      return NextResponse.json(
        { error: "Failed to generate recovery proposal" },
        { status: 500 }
      );
    }

    const latencyMs = Date.now() - startTime;
    await RateLimitService.logAiRequest({
      userId,
      goalId,
      taskType: "recovery",
      status: "success",
      latencyMs,
    });

    const payload = savedProposal.proposedDiffJson as any;
    const formattedProposal: RecoveryProposal = {
      id: savedProposal.id,
      goalId: savedProposal.goalId,
      triggerReason: payload.triggerReason || savedProposal.reason,
      recoverySummary: payload.recoverySummary || savedProposal.reason,
      blockerHypotheses: payload.blockerHypotheses || [],
      proposedChanges: payload.proposedChanges || [],
      firstStep: payload.firstStep || "Complete today's primary action block.",
      tradeoffs: payload.tradeoffs || [],
      status: "pending",
      createdAt: savedProposal.createdAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      proposal: formattedProposal,
      quota: {
        limit: recoveryLimit.limit,
        current: recoveryLimit.current + 1,
        remaining: 0,
        resetsAt: recoveryLimit.resetsAt,
      },
    }, {
      headers: {
        "X-RateLimit-Limit": recoveryLimit.limit.toString(),
        "X-RateLimit-Remaining": "0",
        ...(recoveryLimit.resetsAt ? { "X-RateLimit-Reset": recoveryLimit.resetsAt } : {}),
      },
    });
  } catch (err: any) {
    console.error("Error generating recovery proposal with Gemini AI:", err);
    await RateLimitService.logAiRequest({
      userId,
      taskType: "recovery",
      status: "error",
      latencyMs: Date.now() - startTime,
    });
    return NextResponse.json(
      { error: err?.message || "Failed to generate recovery proposal" },
      { status: 500 }
    );
  }
}
