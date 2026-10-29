import { NextResponse } from "next/server";
import { getAuthUserId } from "@/server/auth/getUser";
import { StreakRepository } from "@/server/repositories/streak.repository";

export async function GET() {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const streak = await StreakRepository.getStreakForUser(userId);
  return NextResponse.json({ streak });
}
