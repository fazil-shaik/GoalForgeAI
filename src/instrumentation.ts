/**
 * Next.js Server Lifecycle Instrumentation
 * Automatically boots background jobs and continuous notification runners on server start.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      const { startBackgroundNotificationScheduler } = await import(
        "@/server/services/notification-scheduler.service"
      );
      startBackgroundNotificationScheduler();
    } catch (err) {
      console.error("[Instrumentation] Failed to register background notification scheduler:", err);
    }
  }
}
