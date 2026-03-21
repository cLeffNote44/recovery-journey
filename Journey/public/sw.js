/**
 * Service Worker for Offline Support
 *
 * Provides offline capabilities for the Recover Clinician Portal:
 * - Caches static assets for offline access
 * - Queues API requests made while offline
 * - Syncs queued requests when back online
 * - Shows cached data when offline
 *
 * Strategy:
 * - Static assets: Cache-first (fast loading)
 * - API requests: Network-first with cache fallback
 * - API mutations: Queue and sync when online
 */

const CACHE_NAME = 'recover-portal-v1'
const API_CACHE_NAME = 'recover-portal-api-v1'

// Static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
]

// API endpoints to cache for offline access (GET only)
const CACHEABLE_API_PATTERNS = [
  /\/api\/v1\/patients$/,
  /\/api\/v1\/patients\/[^/]+$/,
  /\/api\/v1\/patients\/[^/]+\/dashboard$/,
  /\/api\/v1\/messages\/conversations$/,
  /\/api\/v1\/dashboard\/stats$/,
]

// API endpoints for mutations (to be queued when offline)
const QUEUEABLE_API_PATTERNS = [
  /\/api\/v1\/patients$/,           // POST - create patient
  /\/api\/v1\/patients\/[^/]+$/,     // PUT/PATCH - update patient
  /\/api\/v1\/messages$/,            // POST - send message
]

// =============================================================================
// INSTALL EVENT
// =============================================================================

self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...')

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets')
      return cache.addAll(STATIC_ASSETS)
    })
  )

  // Activate immediately
  self.skipWaiting()
})

// =============================================================================
// ACTIVATE EVENT
// =============================================================================

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...')

  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME && name !== API_CACHE_NAME)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name)
              return caches.delete(name)
            })
        )
      }),
      // Take control of all clients
      self.clients.claim(),
    ])
  )
})

// =============================================================================
// FETCH EVENT
// =============================================================================

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    if (request.method === 'GET') {
      event.respondWith(handleApiGet(request))
    } else if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
      event.respondWith(handleApiMutation(request))
    }
    return
  }

  // Handle static assets with cache-first strategy
  event.respondWith(handleStaticAsset(request))
})

// =============================================================================
// STATIC ASSET HANDLING (Cache-First)
// =============================================================================

async function handleStaticAsset(request) {
  const cache = await caches.open(CACHE_NAME)
  const cachedResponse = await cache.match(request)

  if (cachedResponse) {
    // Return cached version, but fetch fresh version in background
    fetchAndCache(request, cache)
    return cachedResponse
  }

  // Not in cache, fetch from network
  try {
    const response = await fetch(request)
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    // Return offline fallback for navigation requests
    if (request.mode === 'navigate') {
      return cache.match('/index.html')
    }
    throw error
  }
}

async function fetchAndCache(request, cache) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      cache.put(request, response.clone())
    }
  } catch (error) {
    // Silently fail - we already have cached version
  }
}

// =============================================================================
// API GET HANDLING (Network-First with Cache Fallback)
// =============================================================================

async function handleApiGet(request) {
  const url = new URL(request.url)
  const isCacheable = CACHEABLE_API_PATTERNS.some((pattern) =>
    pattern.test(url.pathname)
  )

  try {
    // Try network first
    const response = await fetch(request)

    if (response.ok && isCacheable) {
      // Cache successful responses
      const cache = await caches.open(API_CACHE_NAME)
      cache.put(request, response.clone())
    }

    return response
  } catch (error) {
    console.log('[SW] Network failed, checking cache:', url.pathname)

    // Network failed, try cache
    if (isCacheable) {
      const cache = await caches.open(API_CACHE_NAME)
      const cachedResponse = await cache.match(request)

      if (cachedResponse) {
        console.log('[SW] Returning cached API response')
        // Clone and add header indicating offline data
        const headers = new Headers(cachedResponse.headers)
        headers.set('X-Offline-Data', 'true')

        return new Response(cachedResponse.body, {
          status: cachedResponse.status,
          statusText: cachedResponse.statusText,
          headers,
        })
      }
    }

    // No cache available, return error response
    return new Response(
      JSON.stringify({
        error: 'offline',
        message: 'You are offline and this data is not cached',
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: {
          'Content-Type': 'application/json',
          'X-Offline-Data': 'true',
        },
      }
    )
  }
}

// =============================================================================
// API MUTATION HANDLING (Queue when Offline)
// =============================================================================

async function handleApiMutation(request) {
  try {
    // Try to send immediately
    const response = await fetch(request.clone())
    return response
  } catch (error) {
    // Check if this is a queueable request
    const url = new URL(request.url)
    const isQueueable = QUEUEABLE_API_PATTERNS.some((pattern) =>
      pattern.test(url.pathname)
    )

    if (isQueueable) {
      // Queue the request for later
      await queueRequest(request)

      return new Response(
        JSON.stringify({
          queued: true,
          message: 'Request queued for sync when online',
        }),
        {
          status: 202,
          statusText: 'Accepted',
          headers: {
            'Content-Type': 'application/json',
            'X-Queued-Request': 'true',
          },
        }
      )
    }

    // Not queueable, return error
    return new Response(
      JSON.stringify({
        error: 'offline',
        message: 'You are offline and this action cannot be queued',
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

// =============================================================================
// REQUEST QUEUE (IndexedDB)
// =============================================================================

const DB_NAME = 'recover-portal-offline'
const STORE_NAME = 'request-queue'

async function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true })
      }
    }
  })
}

async function queueRequest(request) {
  const db = await openDatabase()
  const body = await request.text()

  const queuedRequest = {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    body,
    timestamp: Date.now(),
  }

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const req = store.add(queuedRequest)

    req.onsuccess = () => {
      console.log('[SW] Request queued:', request.url)
      resolve()
    }
    req.onerror = () => reject(req.error)
  })
}

async function getQueuedRequests() {
  const db = await openDatabase()

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const req = store.getAll()

    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function removeQueuedRequest(id) {
  const db = await openDatabase()

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const req = store.delete(id)

    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

// =============================================================================
// BACKGROUND SYNC
// =============================================================================

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-requests') {
    event.waitUntil(syncQueuedRequests())
  }
})

async function syncQueuedRequests() {
  console.log('[SW] Syncing queued requests...')

  const queuedRequests = await getQueuedRequests()
  console.log(`[SW] Found ${queuedRequests.length} queued requests`)

  const results = await Promise.allSettled(
    queuedRequests.map(async (item) => {
      try {
        const response = await fetch(item.url, {
          method: item.method,
          headers: item.headers,
          body: item.body,
        })

        if (response.ok) {
          await removeQueuedRequest(item.id)
          console.log('[SW] Synced request:', item.url)
          return { success: true, url: item.url }
        } else {
          console.error('[SW] Sync failed:', response.status)
          return { success: false, url: item.url, status: response.status }
        }
      } catch (error) {
        console.error('[SW] Sync error:', error)
        return { success: false, url: item.url, error: error.message }
      }
    })
  )

  // Notify clients of sync results
  const clients = await self.clients.matchAll()
  clients.forEach((client) => {
    client.postMessage({
      type: 'SYNC_COMPLETE',
      results: results.map((r) => r.value || r.reason),
    })
  })
}

// =============================================================================
// MESSAGE HANDLING
// =============================================================================

self.addEventListener('message', (event) => {
  const { type, payload } = event.data || {}

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting()
      break

    case 'GET_QUEUE_STATUS':
      getQueuedRequests().then((requests) => {
        event.source.postMessage({
          type: 'QUEUE_STATUS',
          count: requests.length,
          requests: requests.map((r) => ({
            url: r.url,
            method: r.method,
            timestamp: r.timestamp,
          })),
        })
      })
      break

    case 'FORCE_SYNC':
      syncQueuedRequests()
      break

    case 'CLEAR_CACHE':
      Promise.all([
        caches.delete(CACHE_NAME),
        caches.delete(API_CACHE_NAME),
      ]).then(() => {
        event.source.postMessage({ type: 'CACHE_CLEARED' })
      })
      break

    default:
      break
  }
})

// =============================================================================
// PERIODIC BACKGROUND SYNC (if supported)
// =============================================================================

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'sync-requests-periodic') {
    event.waitUntil(syncQueuedRequests())
  }
})
