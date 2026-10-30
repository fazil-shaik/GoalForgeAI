import { NextResponse } from "next/server";
import { getAuthUserId } from "@/server/auth/getUser";
import { NotificationRepository } from "@/server/repositories/notification.repository";
import { UserRepository } from "@/server/repositories/user.repository";

export async function POST(req: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let endpoint: string | undefined;
    try {
      const body = await req.json();
      endpoint = body.endpoint;
    } catch {
      // Body may be empty if unsubscribing all devices
    }

    if (endpoint) {
      await NotificationRepository.removeSubscription(endpoint);
    } else {
      await NotificationRepository.removeUserSubscriptions(userId);
    }

    // Check remaining subscriptions for user
    const remaining = await NotificationRepository.getSubscriptionsForUser(userId);
    if (remaining.length === 0) {
      await UserRepository.updatePreferences(userId, {
        pushNotificationsEnabled: false,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Unsubscribed successfully.",
    });
  } catch (err: any) {
    console.error("[api/notifications/unsubscribe] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to unsubscribe" },
      { status: 500 }
    );
  }
}
