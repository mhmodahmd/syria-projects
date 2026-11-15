// عامل خدمة صغير لنسخة GitHub: يجعل النظام قابلاً للتثبيت تطبيقاً، ويفتح الواجهة من النسخة المحفوظة إن انقطع الإنترنت.
// الواجهة: الشبكة أولاً (فيظهر كل تحديث فوراً) ثم المحفوظ عند الانقطاع. لا يمس طلبات الخادم (POST إلى script.google.com)
// ولا أي مورد من نطاق آخر، ولا يحفظ أي بيانات للمستخدم.
const CACHE = 'shell-v1';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).catch(() => {})); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  if (new URL(r.url).origin !== self.location.origin) return;
  e.respondWith(fetch(r).then(res => {
    if (res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); }
    return res;
  }).catch(() => caches.match(r).then(m => m || caches.match('./index.html'))));
});
