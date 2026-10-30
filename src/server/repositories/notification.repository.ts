import { getDb } from "@/db";
import { ensureDatabaseInitialized } from "@/db/init";
import { pushSubscriptions, notifications, users } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

export interface PushSubscriptionData {
  userId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string;
}

export class NotificationRepository {
  static async saveSubscription(data: PushSubscriptionData) {
    await ensureDatabaseInitialized();
    const db = getDb();
    if (!db) return null;

    const res = await db
      .insert(pushSubscriptions)
      .values({
        userId: data.userId,
        endpoint: data.endpoint,
        p256dh: data.p256dh,
        auth: data.auth,
        userAgent: data.userAgent || null,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: pushSubscriptions.endpoint,
        set: {
          userId: data.userId,
          p256dh: data.p256dh,
          auth: data.auth,
          userAgent: data.userAgent || null,
          updatedAt: new Date(),
        },
      })
      .returning();

    return res[0] || null;
  }

  static async removeSubscription(endpoint: string) {
    await ensureDatabaseInitialized();
    const db = getDb();
    if (!db) return false;

    await db
      .delete(pushSubscriptions)
      .where(eq(pushSubscriptions.endpoint, endpoint));
    return true;
  }

  static async removeUserSubscriptions(userId: string) {
    await ensureDatabaseInitialized();
    const db = getDb();
    if (!db) return false;

    await db
      .delete(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, userId));
    return true;
  }

  static async getSubscriptionsForUser(userId: string) {
    await ensureDatabaseInitialized();
    const db = getDb();
    if (!db) return [];

    return db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, userId));
  }

  static async getAllSubscribers() {
    await ensureDatabaseInitialized();
    const db = getDb();
    if (!db) return [];

    // Return users who have at least one active push subscription
    return db
      .select({
        userId: users.id,
        email: users.email,
        name: users.name,
        timezone: users.timezone,
        preferences: users.preferences,
      })
      .from(users)
      .innerJoin(pushSubscriptions, eq(users.id, pushSubscriptions.userId))
      .groupBy(users.id);
  }

  static async hasNotificationBeenSent(userId: string, dedupeKey: string): Promise<boolean> {
    await ensureDatabaseInitialized();
    const db = getDb();
    if (!db) return false;

    const res = await db
      .select({ id: notifications.id })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.dedupeKey, dedupeKey),
          eq(notifications.status, "sent")
        )
      )
      .limit(1);

    return res.length > 0;
  }

  static async logNotification(data: {
    userId: string;
    type: string;
    dedupeKey?: string;
    status: "pending" | "sent" | "failed";
  }) {
    await ensureDatabaseInitialized();
    const db = getDb();
    if (!db) return null;

    const res = await db
      .insert(notifications)
      .values({
        userId: data.userId,
        type: data.type,
        dedupeKey: data.dedupeKey || null,
        status: data.status,
        sentAt: data.status === "sent" ? new Date() : null,
      })
      .returning();

    return res[0] || null;
  }
}
