import { NextResponse } from "next/server";
import { PushNotificationService } from "@/server/services/push-notification.service";

function isAuthorized(req: Request): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true; // If not configured in dev, allow execution

  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.replace(/^Bearer\s+/i, "").trim() === cronSecret) {
    return true;
  }

  const { searchParams } = new URL(req.url);
  if (searchParams.get("secret") === cronSecret) {
    return true;
  }

  return false;
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized: Invalid CRON_SECRET" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const forceAll = searchParams.get("force") === "true";
    const targetUserId = searchParams.get("userId");

    if (targetUserId) {
      const res = await PushNotificationService.sendDailyDigest(targetUserId, { force: true });
      return NextResponse.json({
        success: true,
        mode: "single_user",
        userId: targetUserId,
        result: res,
        timestamp: new Date().toISOString(),
      });
    }

    const summary = await PushNotificationService.processDailyDigests({ forceAll });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary,
    });
  } catch (err: any) {
    console.error("[api/cron/daily-digest] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process daily digests" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  return GET(req);
}
