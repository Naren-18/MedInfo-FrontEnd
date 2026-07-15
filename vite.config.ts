import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Vite doesn't load .env files into process.env for the config file
  // itself by default (only into import.meta.env for app code) — loadEnv()
  // does that explicitly, so VITE_GATEWAY_URL in .env.local reaches the
  // proxy target below without having to export it in the shell every time.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
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
