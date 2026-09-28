self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {};
  }
  const title = typeof data.title === "string" ? data.title : "Readiness";
  const body = typeof data.body === "string" ? data.body : "Open Readiness for details.";
  const rawUrl = typeof data.url === "string" ? data.url : "/";
  const url = rawUrl.startsWith("/") && !rawUrl.startsWith("//") ? rawUrl : "/";
  event.waitUntil(self.registration.showNotification(title, {
    body,
    icon: "/readiness-logo.png",
    badge: "/icons/icon-192.png",
    data: { url },
  }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const rawUrl = event.notification.data && typeof event.notification.data.url === "string"
    ? event.notification.data.url
    : "/";
  const targetPath = rawUrl.startsWith("/") && !rawUrl.startsWith("//") ? rawUrl : "/";
  event.waitUntil((async () => {
    const allClients = await clients.matchAll({ type: "window", includeUncontrolled: true });
    const origin = self.location.origin;
    const targetUrl = new URL(targetPath, origin).href;
    for (const client of allClients) {
      const clientUrl = new URL(client.url);
      if (clientUrl.origin === origin && "focus" in client) {
        await client.focus();
        if ("navigate" in client) await client.navigate(targetUrl);
        return;
      }
    }
    await clients.openWindow(targetUrl);
  })());
});
