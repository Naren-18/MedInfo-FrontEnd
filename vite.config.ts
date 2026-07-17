import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Vite doesn't load .env files into process.env for the config file
  // itself by default (only into import.meta.env for app code) — loadEnv()
  // does that explicitly, so VITE_GATEWAY_URL in .env.local reaches the
  // proxy target below without having to export it in the shell every time.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        // Only the app shell (HTML/CSS/JS/icons) is precached — API
        // responses are deliberately excluded below. Medical data must
        // always be fetched live; an offline-cached emergency profile is a
        // correctness bug waiting to happen, not a feature.
        includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
        manifest: {
          name: 'MedInfo — Emergency Medical Profile',
          short_name: 'MedInfo',
          description:
            'Instant emergency medical information via QR code — no login required for first responders.',
          theme_color: '#0c5f80',
          background_color: '#f1f5f9',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            { src: '/pwa-64x64.png', sizes: '64x64', type: 'image/png' },
            { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
            {
              src: '/maskable-icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          // Precache the built app shell only.
          globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
          navigateFallbackDenylist: [/^\/api\//],
          runtimeCaching: [
            {
              // /api/* is explicitly NetworkOnly — this is a same-origin
              // path (proxied to the Gateway by nginx/Vite, see
              // Architecture.md), and the service worker must never serve a
              // stale or offline response for it. A first responder reading
              // a cached (possibly outdated) emergency profile is the one
              // failure mode this app cannot tolerate.
              urlPattern: /^\/api\//,
              handler: 'NetworkOnly',
            },
          ],
        },
        devOptions: {
          // The service worker is disabled in `npm run dev` by default;
          // flip this to true only if you need to debug install-prompt
          // behavior locally without a production build.
          enabled: false,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      proxy: {
        // Forwards to the API Gateway server-side (Node), so the browser
        // only ever sees same-origin requests — no CORS involved, and the
        // backend never needs to be touched.
        '/api': {
          target: env.VITE_GATEWAY_URL || 'http://localhost:8080',
          changeOrigin: true,
          secure: true,
        },
      },
    },
  }
})
