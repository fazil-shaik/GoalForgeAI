import { NextResponse } from "next/server";
import { getAuthUserId } from "@/server/auth/getUser";
import { RateLimitService } from "@/server/services/rate-limit.service";

export async function GET() {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const limits = await RateLimitService.getUserRateLimits(userId);
    return NextResponse.json({ success: true, limits });
  } catch (error: any) {
    console.error("[api/user/rate-limits] Error fetching rate limits:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch rate limits" },
      { status: 500 }
    );
  }
}
