self.addEventListener('install', (e) => {
  e.waitUntil(caches.open('aikarangue').then((cache) => {
    return cache.addAll(['/','/reserve','/program']);
  }));
});

self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then((res) => res || fetch(e.request)));
});
