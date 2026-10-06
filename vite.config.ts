import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/Marvel-Legendary-React/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Marvel Legendary',
        short_name: 'Legendary',
        description: 'Solo browser card game — Marvel Legendary',
        start_url: '/Marvel-Legendary-React/',
        scope: '/Marvel-Legendary-React/',
        display: 'standalone',
        theme_color: '#0d1b2a',
        background_color: '#0d1b2a',
        icons: [
          {
            src: 'pwa-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
})