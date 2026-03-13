const CACHE_NAME = 'guardian-v1';
const ASSETS = [
    'index.html',
    'style.css',
    'app.js',
    'manifest.json'
];

// Installation : Mise en cache
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
    self.skipWaiting(); // DevOps Trick: Forcer la mise à jour immédiate
});

// Activation : Nettoyage des vieux caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
            );
        })
    );
});

// Fetch : Stratégie "Network First" (pour les mises à jour en direct)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});