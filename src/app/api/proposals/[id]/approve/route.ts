import { NextResponse } from "next/server";
import { getAuthUserId } from "@/server/auth/getUser";
import { RecoveryService } from "@/server/services/recovery.service";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: proposalId } = await params;

  try {
    const updated = await RecoveryService.approveRecoveryProposal(proposalId, userId);
    return NextResponse.json({ success: true, proposal: updated });
  } catch (err: any) {
    console.error("Error approving proposal:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to approve proposal" },
      { status: 500 }
    );
  }
}
