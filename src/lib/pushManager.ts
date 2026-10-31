"use client";

/**
 * Utility to convert base64 URL-safe string to Uint8Array for PushManager
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export type PushPermissionStatus = "granted" | "denied" | "default" | "unsupported";

export class PushManagerHelper {
  static isSupported(): boolean {
    if (typeof window === "undefined") return false;
    return (
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window
    );
  }

  static getPermission(): PushPermissionStatus {
    if (!this.isSupported()) return "unsupported";
    return Notification.permission;
  }

  static async getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
    if (!this.isSupported()) return null;
    try {
      return await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    } catch (err) {
      console.warn("[PushManagerHelper] Could not register service worker:", err);
      return null;
    }
  }

  static async getExistingSubscription(): Promise<PushSubscription | null> {
    if (!this.isSupported()) return null;
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) return null;
      return await registration.pushManager.getSubscription();
    } catch {
      return null;
    }
  }

  static async subscribe(): Promise<{ success: boolean; message?: string; subscription?: PushSubscription }> {
    if (!this.isSupported()) {
      return { success: false, message: "Push notifications are not supported in this browser." };
    }

    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      return {
        success: false,
        message: "VAPID Public Key is missing. Ensure NEXT_PUBLIC_VAPID_PUBLIC_KEY is configured.",
      };
    }

    // 1. Request user permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return {
        success: false,
        message:
          permission === "denied"
            ? "Notification permission was blocked in your browser settings. Please enable notifications for GoalForge."
            : "Notification permission was dismissed.",
      };
    }

    // 2. Register Service Worker
    const registration = await this.getServiceWorkerRegistration();
    if (!registration) {
      return { success: false, message: "Could not initialize GoalForge service worker." };
    }

    // Wait until service worker is active
    await navigator.serviceWorker.ready;

    // 3. Subscribe with PushManager
    try {
      const cleanedKey = vapidPublicKey.trim().replace(/^["']|["']$/g, "");
      const applicationServerKey = urlBase64ToUint8Array(cleanedKey);
      let subscription = await registration.pushManager.getSubscription().catch(() => null);

      if (!subscription) {
        try {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: applicationServerKey as any,
          });
        } catch (firstErr: any) {
          // If first attempt fails (e.g. stale registration state), unsubscribe and retry cleanly
          const staleSub = await registration.pushManager.getSubscription().catch(() => null);
          if (staleSub) {
            await staleSub.unsubscribe().catch(() => { });
          }
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: applicationServerKey as any,
          });
        }
      }

      const rawKey = subscription.getKey ? subscription.getKey("p256dh") : null;
      const rawAuth = subscription.getKey ? subscription.getKey("auth") : null;

      const p256dh = rawKey
        ? btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(rawKey))))
        : "";
      const auth = rawAuth
        ? btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(rawAuth))))
        : "";

      // 4. Save to backend database
      const res = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: { p256dh, auth },
          userAgent: navigator.userAgent,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to persist push subscription to server.");
      }

      return { success: true, subscription };
    } catch (err: any) {
      const isPushServiceError =
        err?.name === "AbortError" ||
        String(err?.message || "").includes("push service error");

      if (isPushServiceError) {
        console.warn(
          "[PushManagerHelper] Browser push service currently unavailable (e.g. Incognito mode, Brave shields, or network firewall). In-app alerts remain active."
        );
        return {
          success: false,
          message:
            "Your browser's push service is currently unavailable or disabled (common in Incognito, Brave shields, or corporate firewalls). All in-app notifications remain active!",
        };
      }

      console.warn("[PushManagerHelper] Subscription notice:", err?.message || err);
      return { success: false, message: err?.message || "Failed to subscribe to web push." };
    }
  }

  static async unsubscribe(): Promise<{ success: boolean; message?: string }> {
    if (!this.isSupported()) return { success: true };

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const subscription = await registration.pushManager.getSubscription().catch(() => null);
        if (subscription) {
          const endpoint = subscription.endpoint;
          await subscription.unsubscribe().catch(() => { });

          await fetch("/api/notifications/unsubscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ endpoint }),
          });
        }
      }
      return { success: true };
    } catch (err: any) {
      console.warn("[PushManagerHelper] Unsubscribe notice:", err);
      return { success: false, message: err.message || "Failed to unsubscribe." };
    }
  }

  static async sendTestPush(): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch("/api/notifications/test", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error || "Failed to send test push." };
      }
      return { success: data.success, message: data.message };
    } catch (err: any) {
      return { success: false, message: err.message || "Network error while testing notifications." };
    }
  }
}
