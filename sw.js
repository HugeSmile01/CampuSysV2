/**
 * Service Worker for CampuSysV2 PWA
 * Provides offline functionality, caching, and background sync
 */

const CACHE_NAME = 'campusysv2-v1.0.0';
const DATA_CACHE_NAME = 'campusysv2-data-v1.0.0';

// Files to cache for offline functionality
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/login.html',
  '/registration.html',
  '/resources.html',
  '/account.html',
  '/notification.html',
  '/styles.css',
  '/css/login.css',
  '/css/analytics.css',
  '/JavaScript/security.js',
  '/JavaScript/auth.js',
  '/JavaScript/analytics.js',
  '/JavaScript/workflow.js',
  '/JavaScript/resource-manager.js',
  '/JavaScript/two-factor-auth.js',
  '/JavaScript/homepage.js',
  '/JavaScript/resources.js',
  '/JavaScript/account.js',
  '/JavaScript/notification.js',
  '/res/material.cyan-light_blue.min.css',
  '/images/user.jpg',
  '/images/android-desktop.png',
  '/images/ios-desktop.png',
  '/images/favicon.png',
  '/manifest.json'
];

// API endpoints to cache
const API_CACHE_URLS = [
  'https://www.gstatic.com/firebasejs/',
  'https://fonts.googleapis.com/',
  'https://fonts.gstatic.com/',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdn.jsdelivr.net/npm/sweetalert2@11',
  'https://code.getmdl.io/1.3.0/material.min.js'
];

/**
 * Install event - cache static resources
 */
self.addEventListener('install', (evt) => {
  console.log('[ServiceWorker] Install');
  
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching offline page');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  
  self.skipWaiting();
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (evt) => {
  console.log('[ServiceWorker] Activate');
  
  evt.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  
  self.clients.claim();
});

/**
 * Fetch event - serve cached content when offline
 */
self.addEventListener('fetch', (evt) => {
  // Handle API calls
  if (evt.request.url.includes('/api/')) {
    evt.respondWith(
      caches.open(DATA_CACHE_NAME).then((cache) => {
        return fetch(evt.request)
          .then((response) => {
            // If the response was successful, clone it and store it in the cache
            if (response.status === 200) {
              cache.put(evt.request.url, response.clone());
            }
            return response;
          })
          .catch(() => {
            // Network request failed, try to get it from the cache
            return cache.match(evt.request);
          });
      })
    );
    return;
  }

  // Handle static resources
  evt.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(evt.request).then((response) => {
        if (response) {
          // Return cached version
          return response;
        }

        // Try to fetch from network
        return fetch(evt.request)
          .then((response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Cache successful responses
            const shouldCache = FILES_TO_CACHE.some(url => evt.request.url.includes(url)) ||
                               API_CACHE_URLS.some(url => evt.request.url.includes(url));

            if (shouldCache) {
              const responseToCache = response.clone();
              cache.put(evt.request, responseToCache);
            }

            return response;
          })
          .catch(() => {
            // Network failed, try to return offline page for navigation requests
            if (evt.request.destination === 'document') {
              return cache.match('/index.html');
            }
            
            // For other resources, return a generic offline response
            return new Response('Offline', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      });
    })
  );
});

/**
 * Background sync for offline actions
 */
self.addEventListener('sync', (evt) => {
  console.log('[ServiceWorker] Background Sync', evt.tag);
  
  if (evt.tag === 'background-sync') {
    evt.waitUntil(backgroundSync());
  }
});

/**
 * Push notification handler
 */
self.addEventListener('push', (evt) => {
  console.log('[ServiceWorker] Push Received.');
  
  let data = {};
  if (evt.data) {
    data = evt.data.json();
  }
  
  const title = data.title || 'CampuSysV2 Notification';
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/images/icon-192x192.png',
    badge: '/images/icon-72x72.png',
    image: data.image,
    data: data.data,
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/images/action-view.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/images/action-dismiss.png'
      }
    ],
    vibrate: [100, 50, 100],
    requireInteraction: data.requireInteraction || false,
    silent: data.silent || false,
    timestamp: Date.now(),
    tag: data.tag || 'general'
  };
  
  evt.waitUntil(self.registration.showNotification(title, options));
});

/**
 * Notification click handler
 */
self.addEventListener('notificationclick', (evt) => {
  console.log('[ServiceWorker] Notification click:', evt.notification.tag);
  
  evt.notification.close();
  
  if (evt.action === 'view') {
    // Open the app
    evt.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientsArr) => {
        const hadWindowToFocus = clientsArr.some((windowClient) => {
          if (windowClient.url === self.location.origin) {
            windowClient.focus();
            return true;
          }
          return false;
        });
        
        if (!hadWindowToFocus) {
          clients.openWindow('/').then((windowClient) => {
            if (windowClient) {
              windowClient.focus();
            }
          });
        }
      })
    );
  } else if (evt.action === 'dismiss') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    evt.waitUntil(
      clients.openWindow('/')
    );
  }
});

/**
 * Message handler for communication with main thread
 */
self.addEventListener('message', (evt) => {
  console.log('[ServiceWorker] Message received:', evt.data);
  
  if (evt.data && evt.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (evt.data && evt.data.type === 'UPDATE_CACHE') {
    updateCache();
  }
  
  if (evt.data && evt.data.type === 'CLEAR_CACHE') {
    clearCache();
  }
});

/**
 * Background sync function
 */
async function backgroundSync() {
  try {
    // Sync offline data
    const offlineData = await getOfflineData();
    
    if (offlineData.length > 0) {
      for (const item of offlineData) {
        await syncDataItem(item);
      }
      
      // Clear synced data
      await clearOfflineData();
      
      // Notify clients of successful sync
      await notifyClients({
        type: 'SYNC_COMPLETE',
        message: `Synced ${offlineData.length} items`
      });
    }
  } catch (error) {
    console.error('[ServiceWorker] Background sync failed:', error);
  }
}

/**
 * Get offline data from IndexedDB
 */
async function getOfflineData() {
  // Implementation would use IndexedDB to store offline actions
  // For demo purposes, return empty array
  return [];
}

/**
 * Sync individual data item
 */
async function syncDataItem(item) {
  try {
    const response = await fetch(item.url, {
      method: item.method,
      headers: item.headers,
      body: item.body
    });
    
    if (!response.ok) {
      throw new Error(`Sync failed: ${response.status}`);
    }
    
    return response;
  } catch (error) {
    console.error('[ServiceWorker] Failed to sync item:', error);
    throw error;
  }
}

/**
 * Clear offline data after successful sync
 */
async function clearOfflineData() {
  // Implementation would clear IndexedDB offline storage
  console.log('[ServiceWorker] Clearing offline data');
}

/**
 * Notify all clients
 */
async function notifyClients(message) {
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage(message);
  });
}

/**
 * Update cache with new content
 */
async function updateCache() {
  try {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(FILES_TO_CACHE);
    console.log('[ServiceWorker] Cache updated');
  } catch (error) {
    console.error('[ServiceWorker] Cache update failed:', error);
  }
}

/**
 * Clear all caches
 */
async function clearCache() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
    console.log('[ServiceWorker] All caches cleared');
  } catch (error) {
    console.error('[ServiceWorker] Cache clear failed:', error);
  }
}

/**
 * Periodic background sync (if supported)
 */
self.addEventListener('periodicsync', (evt) => {
  console.log('[ServiceWorker] Periodic sync:', evt.tag);
  
  if (evt.tag === 'analytics-sync') {
    evt.waitUntil(syncAnalyticsData());
  }
  
  if (evt.tag === 'cache-update') {
    evt.waitUntil(updateCache());
  }
});

/**
 * Sync analytics data in background
 */
async function syncAnalyticsData() {
  try {
    // Collect and send analytics data
    const analyticsData = {
      timestamp: Date.now(),
      offline_usage: await getOfflineUsageStats(),
      performance_metrics: await getPerformanceMetrics()
    };
    
    await fetch('/api/analytics/background-sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(analyticsData)
    });
    
    console.log('[ServiceWorker] Analytics data synced');
  } catch (error) {
    console.error('[ServiceWorker] Analytics sync failed:', error);
  }
}

/**
 * Get offline usage statistics
 */
async function getOfflineUsageStats() {
  // Implementation would track offline usage patterns
  return {
    pages_accessed: 0,
    actions_performed: 0,
    time_offline: 0
  };
}

/**
 * Get performance metrics
 */
async function getPerformanceMetrics() {
  // Implementation would collect performance data
  return {
    cache_hit_rate: 0.85,
    average_response_time: 150,
    error_rate: 0.02
  };
}

/**
 * Handle app updates
 */
self.addEventListener('appinstalled', (evt) => {
  console.log('[ServiceWorker] App installed');
  
  // Track app installation
  fetch('/api/analytics/app-installed', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      timestamp: Date.now(),
      user_agent: navigator.userAgent
    })
  }).catch(error => {
    console.error('[ServiceWorker] Failed to track app installation:', error);
  });
});

/**
 * Handle beforeinstallprompt event
 */
self.addEventListener('beforeinstallprompt', (evt) => {
  console.log('[ServiceWorker] Before install prompt');
  
  // This event is fired in the main thread, not the service worker
  // but we can listen for messages about it
});

console.log('[ServiceWorker] Service Worker registered and ready');