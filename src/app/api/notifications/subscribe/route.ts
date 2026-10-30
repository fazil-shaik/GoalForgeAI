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

    const body = await req.json();
    const { endpoint, keys, userAgent } = body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json(
        { error: "Invalid subscription payload. Required: endpoint, keys.p256dh, keys.auth" },
        { status: 400 }
      );
    }

    // Save or update subscription
    const saved = await NotificationRepository.saveSubscription({
      userId,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
      userAgent: userAgent || (typeof req.headers.get === "function" ? req.headers.get("user-agent") || undefined : undefined),
    });

    // Automatically enable push notifications in user preferences
    await UserRepository.updatePreferences(userId, {
      pushNotificationsEnabled: true,
    });

    return NextResponse.json({
      success: true,
      subscriptionId: saved?.id,
      message: "Push notifications successfully enabled on this device.",
    });
  } catch (err: any) {
    console.error("[api/notifications/subscribe] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to register subscription" },
      { status: 500 }
    );
  }
}
