import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg', 'logo.png'],     
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,gif,webp,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 365 days
              }
            }
          },
          {
            urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'firestore-api-cache',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 365 days
              }
            }
          }
        ]
      },
      manifest: {
        name: "Hallmay Harvest Control",
        short_name: "Hallmay",
        description: "Harvest Control",
        start_url: "/",
        display: "standalone",
        orientation: 'portrait',
        background_color: "#111827",
        theme_color: "#111827",
        // Configuraciones específicas para iOS
        categories: ['productivity', 'business'],
        lang: 'es',
        scope: '/',
        icons: [
          {
            src: 'logo.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          },
          // Iconos específicos para iOS
          {
            src: 'logo.png',
            sizes: '152x152',
            type: 'image/png'
          },
          {
            src: 'logo.png',
            sizes: '167x167',
            type: 'image/png'
          },
          {
            src: 'logo.png',
            sizes: '180x180',
            type: 'image/png'
          }
        ]
      }
    })],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core libraries
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react';
          }
          if (id.includes('node_modules/react-router')) {
            return 'react-router';
          }
          
          // Firebase
          if (id.includes('node_modules/firebase') || id.includes('@firebase')) {
            return 'firebase';
          }
          
          // Utilities
          if (id.includes('node_modules/date-fns')) return 'date';
          if (id.includes('node_modules/papaparse') || id.includes('node_modules/xlsx')) return 'exports';
          if (id.includes('node_modules/lucide-react')) return 'icons';
          if (id.includes('node_modules/react-hook-form') || id.includes('node_modules/@hookform')) return 'forms';
          
          // Feature chunks
          if (id.includes('src/features/harvest')) return 'harvest-feature';
          if (id.includes('src/features/logistics')) return 'logistics-feature';
          if (id.includes('src/features/reports')) return 'reports-feature';
          if (id.includes('src/features/silobags')) return 'silobags-feature';
          if (id.includes('src/features/auth')) return 'auth-feature';
          
          // Shared components
          if (id.includes('src/shared/components')) return 'shared-components';
          if (id.includes('src/shared/hooks')) return 'shared-hooks';
          if (id.includes('src/shared/services')) return 'shared-services';
        }
      }
    }
  }
})
