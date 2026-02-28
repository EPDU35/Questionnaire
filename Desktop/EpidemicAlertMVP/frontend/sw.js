self.addEventListener("push", function (event) {
    const data = event.data ? event.data.json() : {};
    const title = data.title || "Babi Alert";
    const options = {
        body: data.body || "Nouvelle notification sanitaire.",
        icon: "/assets/img/logo.svg",
        badge: "/assets/img/logo.svg",
        vibrate: [200, 100, 200],
        data: { url: data.url || "/" },
        actions: [
            { action: "voir", title: "Voir" },
            { action: "fermer", title: "Fermer" }
        ]
    };
    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", function (event) {
    event.notification.close();
    if (event.action === "voir" || !event.action) {
        const url = event.notification.data && event.notification.data.url ? event.notification.data.url : "/";
        event.waitUntil(clients.openWindow(url));
    }
});
