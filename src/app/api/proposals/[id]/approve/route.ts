import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth/config";
import { RecoveryService } from "@/server/services/recovery.service";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: proposalId } = await params;

  try {
    const updated = await RecoveryService.approveRecoveryProposal(proposalId);
    return NextResponse.json({ success: true, proposal: updated });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to approve proposal" },
      { status: 500 }
    );
  }
}
