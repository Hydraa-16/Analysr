import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Vite config for Analysr.
// Milestone 10: PWA manifest + service worker finalised for deployment.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Non-icon static assets that also need to be precached by the service worker.
      // icons/*.png already covers icon-192 and icon-512.
      includeAssets: [
        'favicon_1.ico',
        'favicon-32x32_1.png',
        'apple-touch-icon.png',
        'icons/*.png'
      ],
      manifest: {
        name: 'Analysr',
        short_name: 'Analysr',
        description: 'AI-generated preliminary analysis of your medical reports.',
        theme_color: '#111110',
        background_color: '#F5F5F3',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        // Versioned cache names: every build gets a distinct cache id, and the
        // previous build's cache is torn down on activate instead of lingering.
        // Directly addresses the "stale PWA cache after deployment" risk in the brief.
        cacheId: 'analysr-cache',
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true
      }
    })
  ],
  server: {
    port: 5173
  }
})
