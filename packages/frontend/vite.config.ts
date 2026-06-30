import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.svg', 'icons/*.png'],
      manifest: {
        name: 'Pokédex Real',
        short_name: 'Pokédex',
        description: 'Pokédex funcional con reconocimiento de imagen por IA',
        theme_color: '#CC1F1F',
        background_color: '#CC1F1F',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        scope: '/',
        lang: 'es',
        categories: ['entertainment', 'utilities'],
        icons: [
          {
            src: 'icons/icon-64x64.png',
            sizes: '64x64',
            type: 'image/png',
          },
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        screenshots: [],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,json}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/pokeapi\.co\/api\/v2\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'pokeapi-cache',
              expiration: { maxEntries: 200, maxAgeSeconds: 86400 },
            },
          },
          {
            urlPattern: /^https:\/\/raw\.githubusercontent\.com\/PokeAPI\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'pokeapi-sprites',
              expiration: { maxEntries: 500, maxAgeSeconds: 604800 },
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
