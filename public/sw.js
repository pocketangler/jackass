const currentCacheVersion = "2023-03-31_1";
skipWaiting();

const deleteOldCaches = async () => {
    const keyList = await caches.keys();
    const cachesToDelete = keyList.filter((key) => key !== currentCacheVersion);
    await Promise.all(cachesToDelete.map(deleteCache));
};

self.addEventListener("activate", async (event) => {
    event.waitUntil(clients.claim());
    event.waitUntil(deleteOldCaches);
});

self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") return;
    event.respondWith(readThrough(event));
});

async function readThrough(event) {
    const cache = await caches.open(currentCacheVersion);
    const fresheningResponse = freshenResponse(event.request, cache);
    const cachedResponse = await cache.match(event.request);
    return cachedResponse || await fresheningResponse;
}

async function freshenResponse(request, cache) {
    const response = await fetch(request);
    cache.put(request, response.clone());
    return response;
}
