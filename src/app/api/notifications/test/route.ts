import { NextResponse } from "next/server";
import { getAuthUserId } from "@/server/auth/getUser";
import { PushNotificationService } from "@/server/services/push-notification.service";
import { NotificationRepository } from "@/server/repositories/notification.repository";

export async function POST(req: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subs = await NotificationRepository.getSubscriptionsForUser(userId);
    if (!subs.length) {
      return NextResponse.json(
        {
          success: false,
          error: "No push subscriptions found for this account. Please enable notifications on this device first.",
        },
        { status: 400 }
      );
    }

    const payload = {
      title: "GoalForge Test Notification 🚀",
      body: "High five! Web push notifications are active and ready to deliver your daily task briefings.",
      url: "/dashboard",
      tag: "goalforge-test",
    };

    const result = await PushNotificationService.sendToUser(userId, payload);

    return NextResponse.json({
      success: result.sent > 0,
      sentCount: result.sent,
      totalDevices: result.total,
      message:
        result.sent > 0
          ? `Dispatched test notification to ${result.sent} active device(s).`
          : "Could not deliver to registered devices. They may have expired or been disabled in browser settings.",
    });
  } catch (err: any) {
    console.error("[api/notifications/test] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to trigger test notification" },
      { status: 500 }
    );
  }
}
