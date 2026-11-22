self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data = { body: event.data.text() };
    }
  }

  const title = data.title || 'Мой Гардероб';
  const options = {
    body: data.body || 'Пора отметить грязные вещи за сегодня',
    tag: 'garderob-daily-reminder',
    renotify: true,
    data: {
      url: data.url || '/garderob/'
    }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlObj = new URL(
    (event.notification.data && event.notification.data.url) || '/garderob/',
    self.location.origin
  );
  urlObj.searchParams.set('from', 'push');
  const targetUrl = urlObj.href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.startsWith(self.registration.scope) && 'focus' in client) {
          try {
            client.postMessage({ type: 'OPEN_CLEAN_TAB' });
          } catch (_) {}
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
