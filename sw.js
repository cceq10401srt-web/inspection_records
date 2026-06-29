const CACHE_NAME = 'hap-inspection-v1';
const SHELL_ASSETS = [
  '/inspection_records/',
  '/inspection_records/index.html',
  '/inspection_records/manifest.json',
  '/inspection_records/icons/icon-192.png',
  '/inspection_records/icons/icon-512.png',
];

// 安裝：快取靜態資源
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// 啟動：清除舊快取
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// 攔截請求：網路優先，失敗則用快取
self.addEventListener('fetch', e => {
  // 只快取同源請求，API 請求不快取
  if (!e.request.url.startsWith(self.location.origin)) return;
  if (e.request.url.includes('supabase.co')) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // 更新快取
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
