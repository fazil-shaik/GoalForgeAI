import { NextResponse } from "next/server";
import { getAuthUserId } from "@/server/auth/getUser";
import { LeaderboardRepository } from "@/server/repositories/leaderboard.repository";
import { ensureDatabaseInitialized } from "@/db/init";

export async function GET(req: Request) {
  await ensureDatabaseInitialized();
  const userId = await getAuthUserId();
  const { searchParams } = new URL(req.url);
  const sortByParam = searchParams.get("sortBy") as "goals" | "hard_goals" | "streak" | "medals";
  const sortBy = ["goals", "hard_goals", "streak", "medals"].includes(sortByParam)
    ? sortByParam
    : "goals";

  const leaderboard = await LeaderboardRepository.getLeaderboard(userId, sortBy);

  // Identify current user's entry
  const currentUserEntry = leaderboard.find((entry) => entry.isCurrentUser) || null;

  return NextResponse.json({
    leaderboard,
    currentUserEntry,
    totalParticipants: leaderboard.length,
    sortBy,
  });
}
