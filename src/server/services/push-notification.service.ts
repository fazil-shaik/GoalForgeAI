import webpush from "web-push";
import { NotificationRepository } from "@/server/repositories/notification.repository";
import { TaskRepository } from "@/server/repositories/task.repository";
import { StreakRepository } from "@/server/repositories/streak.repository";
import { UserRepository } from "@/server/repositories/user.repository";

let isVapidInitialized = false;

function ensureVapidConfigured() {
  if (isVapidInitialized) return true;

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:support@goalforge.app";

  if (!publicKey || !privateKey) {
    console.warn("⚠️ [PushNotificationService] Missing VAPID keys in environment.");
    return false;
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  isVapidInitialized = true;
  return true;
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
  requireInteraction?: boolean;
}

export class PushNotificationService {
  /**
   * Send a push notification to a specific push subscription record.
   * Cleans up expired (410/404) subscriptions automatically.
   */
  static async sendToSubscription(
    subscription: { endpoint: string; p256dh: string; auth: string },
    payload: PushPayload
  ): Promise<boolean> {
    if (!ensureVapidConfigured()) return false;

    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      },
    };

    try {
      await webpush.sendNotification(
        pushSubscription,
        JSON.stringify({
          title: payload.title,
          body: payload.body,
          icon: payload.icon || "/favicon.ico",
          badge: payload.badge || "/favicon.ico",
          url: payload.url || "/dashboard",
          tag: payload.tag || "goalforge-notification",
          requireInteraction: payload.requireInteraction || false,
        })
      );
      return true;
    } catch (err: any) {
      // 404 Not Found or 410 Gone indicates the browser unregistered the subscription
      if (err.statusCode === 404 || err.statusCode === 410) {
        console.info(`[PushNotificationService] Pruning expired subscription endpoint: ${subscription.endpoint}`);
        await NotificationRepository.removeSubscription(subscription.endpoint);
      } else {
        console.error("[PushNotificationService] Push delivery error:", err.message || err);
      }
      return false;
    }
  }

  /**
   * Send a push notification to all registered devices of a given user.
   */
  static async sendToUser(userId: string, payload: PushPayload): Promise<{ sent: number; total: number }> {
    const subs = await NotificationRepository.getSubscriptionsForUser(userId);
    if (!subs.length) {
      return { sent: 0, total: 0 };
    }

    const results = await Promise.all(
      subs.map((sub) =>
        this.sendToSubscription(
          {
            endpoint: sub.endpoint,
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
          payload
        )
      )
    );

    const sent = results.filter(Boolean).length;
    return { sent, total: subs.length };
  }

  /**
   * Calculate local date in YYYY-MM-DD for a given timezone.
   */
  static getLocalDateString(timezone: string = "UTC"): string {
    try {
      const now = new Date();
      // Format to YYYY-MM-DD in the specified timezone
      const formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      return formatter.format(now);
    } catch {
      return new Date().toISOString().split("T")[0];
    }
  }

  /**
   * Get current local hour in "HH" (24h) format for a given timezone.
   */
  static getLocalHour(timezone: string = "UTC"): string {
    try {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        hour: "2-digit",
        hour12: false,
      });
      return formatter.format(now).padStart(2, "0");
    } catch {
      return new Date().getUTCHours().toString().padStart(2, "0");
    }
  }

  /**
   * Send daily task briefing to a single user.
   */
  static async sendDailyDigest(
    userId: string,
    options?: { force?: boolean; timezone?: string }
  ): Promise<{
    sent: boolean;
    reason?: string;
    taskCount?: number;
  }> {
    const subs = await NotificationRepository.getSubscriptionsForUser(userId);
    if (!subs.length) {
      return { sent: false, reason: "No active push subscriptions found" };
    }

    let userTimezone = options?.timezone;
    if (!userTimezone) {
      const userProfile = await UserRepository.findById(userId);
      userTimezone = userProfile?.timezone || (userProfile?.preferences as any)?.timezone || "UTC";
    }

    const todayDate = this.getLocalDateString(userTimezone);
    const dedupeKey = `daily_tasks_${userId}_${todayDate}`;

    // Check if already sent today
    if (!options?.force) {
      const alreadySent = await NotificationRepository.hasNotificationBeenSent(userId, dedupeKey);
      if (alreadySent) {
        return { sent: false, reason: "Daily notification already delivered today" };
      }
    }

    // Fetch today's tasks and user streak
    const [todayTasks, streak] = await Promise.all([
      TaskRepository.getTodayTasksForUser(userId, todayDate),
      StreakRepository.getStreakForUser(userId),
    ]);

    const taskCount = todayTasks.length;
    const pendingCount = todayTasks.filter((t) => t.status !== "completed" && t.status !== "skipped").length;

    let title = "GoalForge Daily Briefing ⚔️";
    let body = "";

    if (taskCount === 0) {
      body = `No tasks scheduled for today. Maintain your ${streak.currentStreak}-day execution streak with a focused session!`;
    } else if (pendingCount === 0) {
      body = `🔥 Outstanding work! All ${taskCount} tasks for today are already crushed. Current streak: ${streak.currentStreak} days.`;
    } else {
      const topTask = todayTasks.find((t) => t.status === "todo" || t.status === "in_progress") || todayTasks[0];
      body = `You have ${pendingCount} task${pendingCount > 1 ? "s" : ""} on deck today. Top focus: "${topTask.title}". Streak: ${streak.currentStreak}d 🔥`;
    }

    const result = await this.sendToUser(userId, {
      title,
      body,
      url: "/dashboard",
      tag: `daily-digest-${todayDate}`,
    });

    if (result.sent > 0) {
      await NotificationRepository.logNotification({
        userId,
        type: "daily_tasks_briefing",
        dedupeKey,
        status: "sent",
      });
      return { sent: true, taskCount: pendingCount };
    } else {
      await NotificationRepository.logNotification({
        userId,
        type: "daily_tasks_briefing",
        dedupeKey,
        status: "failed",
      });
      return { sent: false, reason: "Failed to dispatch to browser endpoints" };
    }
  }

  /**
   * Automated evening streak guard warning: warns user if tasks remain unfinished before midnight.
   */
  static async sendStreakWarning(
    userId: string,
    timezone: string = "UTC",
    options?: { force?: boolean }
  ): Promise<boolean> {
    const todayDate = this.getLocalDateString(timezone);
    const dedupeKey = `streak_warning_${userId}_${todayDate}`;

    if (!options?.force) {
      const alreadySent = await NotificationRepository.hasNotificationBeenSent(userId, dedupeKey);
      if (alreadySent) return false;
    }

    const [todayTasks, streak] = await Promise.all([
      TaskRepository.getTodayTasksForUser(userId, todayDate),
      StreakRepository.getStreakForUser(userId),
    ]);

    const pendingTasks = todayTasks.filter((t) => t.status !== "completed" && t.status !== "skipped");
    if (pendingTasks.length === 0) {
      return false; // All finished, no warning needed!
    }

    const title = "⚠️ Evening Streak Guard: Tasks Remaining!";
    const body = `You still have ${pendingTasks.length} pending task${pendingTasks.length > 1 ? "s" : ""} left today. Complete them before midnight to protect your ${streak.currentStreak}-day streak!`;

    const res = await this.sendToUser(userId, {
      title,
      body,
      url: "/dashboard",
      tag: `streak-guard-${todayDate}`,
      requireInteraction: true,
    });

    if (res.sent > 0) {
      await NotificationRepository.logNotification({
        userId,
        type: "streak_warning",
        dedupeKey,
        status: "sent",
      });
      return true;
    }
    return false;
  }

  /**
   * Run the cron process for all eligible subscribers based on timezone and preferences.
   * Dispatches both morning task briefings and evening streak warnings autonomously.
   */
  static async processDailyDigests(options?: { forceAll?: boolean }): Promise<{
    processed: number;
    briefingsSent: number;
    streakWarningsSent: number;
    skipped: number;
    errors: number;
  }> {
    const subscribers = await NotificationRepository.getAllSubscribers();
    let processed = 0;
    let briefingsSent = 0;
    let streakWarningsSent = 0;
    let skipped = 0;
    let errors = 0;

    for (const sub of subscribers) {
      processed++;
      try {
        const prefs = sub.preferences as any;

        // Skip if user explicitly disabled all push notifications
        if (prefs?.pushNotificationsEnabled === false) {
          skipped++;
          continue;
        }

        const tz = sub.timezone || "UTC";
        const currentHour = this.getLocalHour(tz);

        // 1. Check Morning Task Briefing
        const preferredTime = prefs?.dailyBriefingTime || "09:00";
        const preferredHour = preferredTime.split(":")[0]?.padStart(2, "0") || "09";
        const isBriefingEligible = prefs?.dailyBriefingEnabled !== false && (options?.forceAll || currentHour === preferredHour);

        if (isBriefingEligible) {
          const res = await this.sendDailyDigest(sub.userId, { force: options?.forceAll, timezone: tz });
          if (res.sent) {
            briefingsSent++;
          }
        }

        // 2. Check Evening Streak Guard (Triggered around 20:00 / 8 PM local time)
        const isStreakWarningEligible = prefs?.streakRemindersEnabled !== false && (options?.forceAll || currentHour === "20");
        if (isStreakWarningEligible) {
          const sent = await this.sendStreakWarning(sub.userId, tz, { force: options?.forceAll });
          if (sent) {
            streakWarningsSent++;
          }
        }

        if (!isBriefingEligible && !isStreakWarningEligible) {
          skipped++;
        }
      } catch (err) {
        console.error(`[PushNotificationService] Error for user ${sub.userId}:`, err);
        errors++;
      }
    }

    return { processed, briefingsSent, streakWarningsSent, skipped, errors };
  }
}
