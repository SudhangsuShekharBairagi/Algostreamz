const SHELL_CACHE = 'algostreamz-shell-v1'
const ASSET_CACHE = 'algostreamz-assets-v1'
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/pwa-192.svg',
  '/pwa-512.svg',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => cache.addAll(APP_SHELL).then(() => cache.match('/index.html')))
      .then(async (shell) => {
        const html = await shell.text()
        const entryAssets = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
          .map((match) => new URL(match[1], self.location.origin))
          .filter((url) => url.origin === self.location.origin && url.pathname.startsWith('/assets/'))
        const cache = await caches.open(SHELL_CACHE)
        await cache.addAll(entryAssets)

        const stylesheets = entryAssets.filter((url) => /\.css$/i.test(url.pathname))
        const fontAssets = []
        for (const stylesheet of stylesheets) {
          const response = await cache.match(stylesheet)
          if (!response) continue
          const css = await response.text()
          for (const match of css.matchAll(/url\(["']?([^)"']+)["']?\)/g)) {
            const asset = new URL(match[1], stylesheet)
            if (asset.origin === self.location.origin && asset.pathname.startsWith('/assets/')) {
              fontAssets.push(asset)
            }
          }
        }
        await cache.addAll(fontAssets)
      })
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith('algostreamz-') && ![SHELL_CACHE, ASSET_CACHE].includes(key))
          .map((key) => caches.delete(key)),
      ),
    ).then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  const url = new URL(request.url)
  if (request.method !== 'GET' || url.origin !== self.location.origin) return
  if (url.pathname === '/api' || url.pathname.startsWith('/api/')) return
  if (url.pathname === '/sw.js') return

  const isAuthRoute = /^\/(?:login|verify-email)(?:\/|$)/.test(url.pathname)
  if (isAuthRoute) return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone()
          return caches.open(SHELL_CACHE).then((cache) => cache.put('/index.html', copy)).then(() => response)
        }
        return response
      }).catch(async () => {
        const cachedShell = await caches.match('/index.html')
        return cachedShell || Response.error()
      }),
    )
    return
  }

  const isStaticAsset = url.pathname.startsWith('/assets/') ||
    /\.(?:css|js|svg|png|webp|woff2?)$/i.test(url.pathname)
  if (!isStaticAsset) return

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached
      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone()
          caches.open(ASSET_CACHE).then((cache) => cache.put(request, copy))
        }
        return response
      })
    }),
  )
})
