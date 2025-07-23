// Service Worker لكتاب البرمجة
// يتيح العمل بدون إنترنت وتحسين الأداء

const CACHE_NAME = 'programming-book-v1.0.0';
const OFFLINE_URL = '/offline.html';

// الملفات المهمة التي نريد تخزينها في الكاش
const CORE_FILES = [
  '/',
  '/index.html',
  '/toc.html',
  '/about.html',
  '/style.css',
  '/css/style.css',
  '/css/print.css',
  '/js/main.js',
  '/js/interactive.js',
  '/manifest.json',
  OFFLINE_URL
];

// فصول الكتاب
const CHAPTER_FILES = [
  '/chapters/chapter1.html',
  '/chapters/chapter2.html',
  '/chapters/chapter3.html',
  '/chapters/chapter4.html'
];

// الخطوط والموارد الخارجية
const EXTERNAL_RESOURCES = [
  'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap'
];

// جميع الملفات للتخزين المسبق
const PRECACHE_FILES = [
  ...CORE_FILES,
  ...CHAPTER_FILES,
  ...EXTERNAL_RESOURCES
];

// تثبيت Service Worker
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching core files');
        return cache.addAll(CORE_FILES);
      })
      .then(() => {
        console.log('Service Worker: Core files cached');
        // تخزين الفصول بشكل منفصل لتجنب فشل التثبيت
        return caches.open(CACHE_NAME);
      })
      .then(cache => {
        // محاولة تخزين الفصول (قد تفشل بعضها)
        return Promise.allSettled(
          CHAPTER_FILES.map(file => cache.add(file))
        );
      })
      .then(() => {
        console.log('Service Worker: Installation complete');
        // فرض التفعيل الفوري
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker: Installation failed', error);
      })
  );
});

// تفعيل Service Worker
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            // حذف الكاش القديم
            if (cacheName !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        // السيطرة على جميع العملاء فوراً
        return self.clients.claim();
      })
  );
});

// اعتراض طلبات الشبكة
self.addEventListener('fetch', event => {
  // تجاهل الطلبات غير HTTP/HTTPS
  if (!event.request.url.startsWith('http')) {
    return;
  }

  // تجاهل طلبات POST وغيرها
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    handleFetchRequest(event.request)
  );
});

// معالجة طلبات الشبكة
async function handleFetchRequest(request) {
  const url = new URL(request.url);
  
  try {
    // استراتيجية مختلفة حسب نوع الملف
    if (isNavigationRequest(request)) {
      return await handleNavigationRequest(request);
    } else if (isCoreFile(url.pathname)) {
      return await handleCoreFileRequest(request);
    } else if (isChapterFile(url.pathname)) {
      return await handleChapterRequest(request);
    } else if (isExternalResource(url.href)) {
      return await handleExternalResource(request);
    } else {
      return await handleOtherRequest(request);
    }
  } catch (error) {
    console.error('Service Worker: Fetch error', error);
    return await handleOfflineResponse(request);
  }
}

// التحقق من نوع الطلب
function isNavigationRequest(request) {
  return request.mode === 'navigate' || 
         (request.method === 'GET' && request.headers.get('accept').includes('text/html'));
}

function isCoreFile(pathname) {
  return CORE_FILES.some(file => pathname.endsWith(file.replace('/', '')));
}

function isChapterFile(pathname) {
  return pathname.includes('/chapters/') && pathname.endsWith('.html');
}

function isExternalResource(url) {
  return EXTERNAL_RESOURCES.some(resource => url.startsWith(resource.split('?')[0]));
}

// معالجة طلبات التنقل (صفحات HTML)
async function handleNavigationRequest(request) {
  try {
    // محاولة جلب من الشبكة أولاً
    const networkResponse = await fetch(request);
    
    // تخزين في الكاش إذا نجح
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // إذا فشل، جرب الكاش
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // إذا لم يوجد في الكاش، أرجع صفحة offline
    return await caches.match(OFFLINE_URL);
  }
}

// معالجة الملفات الأساسية (Cache First)
async function handleCoreFileRequest(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    throw error;
  }
}

// معالجة فصول الكتاب (Network First مع Fallback)
async function handleChapterRequest(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    // إذا فشل، جرب الكاش
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
  }
  
  // إذا لم يوجد، أرجع صفحة offline
  return await caches.match(OFFLINE_URL);
}

// معالجة الموارد الخارجية (الخطوط، إلخ)
async function handleExternalResource(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('', { status: 404 });
  }
}

// معالجة الطلبات الأخرى
async function handleOtherRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    // تخزين الموارد الناجحة في الكاش
    if (networkResponse.ok && request.url.includes(self.location.origin)) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('', { status: 404 });
  }
}

// معالجة حالة عدم الاتصال
async function handleOfflineResponse(request) {
  if (isNavigationRequest(request)) {
    return await caches.match(OFFLINE_URL);
  }
  
  const cachedResponse = await caches.match(request);
  return cachedResponse || new Response('', { status: 404 });
}

// معالجة رسائل من الصفحة الرئيسية
self.addEventListener('message', event => {
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'SKIP_WAITING':
        self.skipWaiting();
        break;
      case 'GET_VERSION':
        event.ports[0].postMessage({ version: CACHE_NAME });
        break;
      case 'CACHE_CHAPTER':
        cacheChapter(event.data.url);
        break;
      case 'CLEAR_CACHE':
        clearCache();
        break;
    }
  }
});

// تخزين فصل معين
async function cacheChapter(url) {
  try {
    const cache = await caches.open(CACHE_NAME);
    await cache.add(url);
    console.log('Service Worker: Chapter cached', url);
  } catch (error) {
    console.error('Service Worker: Failed to cache chapter', url, error);
  }
}

// مسح الكاش
async function clearCache() {
  try {
    await caches.delete(CACHE_NAME);
    console.log('Service Worker: Cache cleared');
  } catch (error) {
    console.error('Service Worker: Failed to clear cache', error);
  }
}

// معالجة تحديثات الكاش في الخلفية
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // تحديث الملفات الأساسية
    const cache = await caches.open(CACHE_NAME);
    await Promise.allSettled(
      CORE_FILES.map(file => 
        fetch(file).then(response => {
          if (response.ok) {
            return cache.put(file, response);
          }
        }).catch(() => {})
      )
    );
    console.log('Service Worker: Background sync completed');
  } catch (error) {
    console.error('Service Worker: Background sync failed', error);
  }
}

// إشعارات Push (للمستقبل)
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/assets/icons/icon-192x192.png',
      badge: '/assets/icons/badge-72x72.png',
      tag: 'programming-book-notification',
      requireInteraction: true,
      actions: [
        {
          action: 'open',
          title: 'فتح الكتاب'
        },
        {
          action: 'close',
          title: 'إغلاق'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// معالجة النقر على الإشعارات
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
