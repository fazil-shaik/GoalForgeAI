import { PushNotificationService } from "./push-notification.service";

let isRunning = false;

/**
 * Autonomous background notification runner.
 * Automatically checks and delivers daily task briefings and evening streak
 * warnings to users according to their local timezone and schedule preferences.
 */
export function startBackgroundNotificationScheduler() {
  // Prevent duplicate execution during dev server fast-refresh
  if ((globalThis as any).__goalforge_scheduler_initialized) {
    return;
  }
  (globalThis as any).__goalforge_scheduler_initialized = true;

  console.log("⚡ [GoalForge Scheduler] Autonomous push notification service initialized.");

  const runAutomationTick = async () => {
    if (isRunning) return;
    isRunning = true;

    try {
      const summary = await PushNotificationService.processDailyDigests();
      const totalSent = summary.briefingsSent + summary.streakWarningsSent;
      if (totalSent > 0) {
        console.log(
          `🔔 [GoalForge Scheduler] Autonomous tick delivered ${summary.briefingsSent} briefing(s) and ${summary.streakWarningsSent} streak warning(s).`
        );
      }
    } catch (err) {
      console.error("⚠️ [GoalForge Scheduler] Unexpected error in automation runner:", err);
    } finally {
      isRunning = false;
    }
  };

  // 1. Initial automated check 5 seconds after server boot
  setTimeout(runAutomationTick, 5000);

  // 2. Continuous automated polling every 15 minutes (900,000 ms)
  // Deduplication keys in PostgreSQL ensure that each user receives only 1 briefing and 1 streak alert per day.
  const INTERVAL_MS = 15 * 60 * 1000;
  setInterval(runAutomationTick, INTERVAL_MS);
}
