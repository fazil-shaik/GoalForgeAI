// GoalForge Web Push Service Worker
self.addEventListener("install", (event) => {
  // Activate immediately without waiting
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Claim all clients immediately so push messages work right away
  event.waitUntil(clients.claim());
});

self.addEventListener("push", (event) => {
  let notificationData = {
    title: "GoalForge Notification",
    body: "You have pending daily tasks in GoalForge.",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    url: "/dashboard",
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      notificationData = { ...notificationData, ...parsed };
    } catch {
      notificationData.body = event.data.text() || notificationData.body;
    }
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon || "/favicon.ico",
    badge: notificationData.badge || "/favicon.ico",
    data: {
      url: notificationData.url || "/dashboard",
      timestamp: Date.now(),
    },
    vibrate: [100, 50, 100],
    requireInteraction: notificationData.requireInteraction || false,
    tag: notificationData.tag || "goalforge-daily-digest",
    renotify: true,
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl =
    (event.notification.data && event.notification.data.url) || "/dashboard";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it and navigate if needed
      for (const client of clientList) {
        if ("focus" in client) {
          if (client.url.includes(self.location.origin)) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
