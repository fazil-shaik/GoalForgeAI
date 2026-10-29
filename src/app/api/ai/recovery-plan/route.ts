import { NextResponse } from "next/server";
import { getAuthUserId } from "@/server/auth/getUser";
import { RecoveryService } from "@/server/services/recovery.service";
import { RecoveryProposal } from "@/types/goal";

export async function POST(req: Request) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
    });
  } catch (err: any) {
    console.error("Error generating recovery proposal with Gemini AI:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to generate recovery proposal" },
      { status: 500 }
    );
  }
}
