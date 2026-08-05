const STATIC_CACHE = 'tdg-static-v3';
const API_CACHE = 'tdg-api-v3';
const OFFLINE_STORE = 'tdg-offline-queue';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => {
        if (k !== STATIC_CACHE && k !== API_CACHE) return caches.delete(k);
      }))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { pathname } = new URL(event.request.url);
  const method = event.request.method;

  // API GET: network-first with cache fallback
  if (method === 'GET' && pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(event.request, API_CACHE));
    return;
  }

  // API mutation (POST/PUT/PATCH/DELETE): try network, queue if offline
  if (pathname.startsWith('/api/')) {
    event.respondWith(mutationHandler(event));
    return;
  }

  // Navigation (SPA routes): serve index.html from cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Static assets: cache-first with fetch fallback
  event.respondWith(cacheFirst(event.request));
});

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({ offline: true, error: 'No cached data' }), {
      status: 503, headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    if (request.mode === 'navigate') return caches.match('/index.html');
    throw new Error('Offline');
  }
}

async function mutationHandler(event) {
  const request = event.request.clone();
  try {
    return await fetch(event.request);
  } catch {
    await queueRequest(request);
    const client = await self.clients.get(event.clientId);
    if (client) {
      client.postMessage({ type: 'OFFLINE_QUEUED', url: request.url });
    }
    return new Response(JSON.stringify({ queued: true }), {
      status: 202, headers: { 'Content-Type': 'application/json' }
    });
  }
}

// ---- IndexedDB queue ----
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('tdg-offline-mutations', 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(OFFLINE_STORE, { autoIncrement: true, keyPath: 'id' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function queueRequest(request) {
  const db = await openDB();
  const body = await request.clone().text();
  const tx = db.transaction(OFFLINE_STORE, 'readwrite');
  tx.objectStore(OFFLINE_STORE).add({
    url: request.url,
    method: request.method,
    headers: [...request.headers.entries()],
    body: body || undefined,
    queuedAt: new Date().toISOString()
  });
  await tx.done;
}

async function getQueueCount() {
  try {
    const db = await openDB();
    const tx = db.transaction(OFFLINE_STORE, 'readonly');
    const store = tx.objectStore(OFFLINE_STORE);
    return await new Promise(res => { const r = store.count(); r.onsuccess = () => res(r.result); });
  } catch { return 0; }
}

async function replayQueue() {
  const db = await openDB();
  let tx = db.transaction(OFFLINE_STORE, 'readonly');
  let store = tx.objectStore(OFFLINE_STORE);
  const items = await new Promise(res => { const r = store.getAll(); r.onsuccess = () => res(r.result || []); });

  if (items.length === 0) return;

  const failed = [];
  for (const item of items) {
    try {
      const res = await fetch(item.url, {
        method: item.method,
        headers: Object.fromEntries(item.headers || []),
        body: item.body || undefined
      });
      if (!res.ok) { failed.push(item); continue; }
      const tx2 = db.transaction(OFFLINE_STORE, 'readwrite');
      tx2.objectStore(OFFLINE_STORE).delete(item.id);
      await tx2.done;
    } catch {
      failed.push(item);
    }
  }

  if (failed.length === 0) {
    const clients = await self.clients.matchAll();
    clients.forEach(c => c.postMessage({ type: 'QUEUE_REPLAYED' }));
  }
}

self.addEventListener('message', (event) => {
  if (event.data?.type === 'GET_QUEUE_COUNT') {
    getQueueCount().then(count => {
      if (event.source) event.source.postMessage({ type: 'QUEUE_COUNT', count });
    });
  }
  if (event.data?.type === 'REPLAY_QUEUE') {
    replayQueue();
  }
});

self.addEventListener('online', () => replayQueue());
