import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import checker from 'vite-plugin-checker'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import fs from 'node:fs'
import { compression } from 'vite-plugin-compression2'

export default defineConfig({
  plugins: [
    react(),
    checker({
      typescript: true,
      overlay: true,
    }),
    tailwindcss(),

    // Compression Brotli + Gzip pour les assets
    compression({
      algorithms: ['gzip'],
      exclude: [/\.(br)$/, /\.(gz)$/],
    }),
    compression({
      algorithms: ['brotliCompress'],
      exclude: [/\.(br)$/, /\.(gz)$/],
    }),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },

  build: {
    // Sortie optimisée
    outDir: 'dist',
    assetsDir: 'assets',

    // Source maps désactivées en prod (ou 'hidden' si besoin)
    sourcemap: false,

    // Un seul fichier CSS = moins de requêtes bloquantes
    cssCodeSplit: true,
    // Minification optimale
    cssMinify: true,

    // Minification optimale
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Supprimer console.log en prod
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'], // Supprimer les console spécifiques
        passes: 2, // Deux passes de minification
      },
      format: {
        comments: false, // Supprimer tous les commentaires
      },
    },

    // Optimisation du chunking
    rollupOptions: {
      output: {
        // Nom des fichiers CSS
        assetFileNames: assetInfo => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/index.css'
          }
          return 'assets/[name]-[hash][extname]'
        },
        // Chunking stratégique
        manualChunks: id => {
          if (id.includes('node_modules')) {
            const match = id.match(/node_modules\/([^/]+)/)
            const packageName = match ? match[1] : null

            // React core
            if (packageName === 'react' || packageName === 'react-dom') {
              return 'react-vendor'
            }

            // Forms
            if (packageName === 'react-hook-form' || packageName?.includes('@hookform')) {
              return 'forms-vendor'
            }

            // Icons
            if (packageName === 'lucide-react') {
              return 'icons-vendor'
            }

            // PDF rendering (gros package)
            if (packageName?.includes('@react-pdf') || packageName === 'pako') {
              return 'pdf-vendor'
            }

            // State management
            if (packageName === 'zustand') {
              return 'state-vendor'
            }

            // Validation
            if (packageName === 'zod') {
              return 'validation-vendor'
            }

            // Share/Analytics
            if (packageName === 'react-share' || packageName === 'react-ga4') {
              return 'tracking-vendor'
            }

            // Utilities
            if (packageName === 'clsx') {
              return 'utils-vendor'
            }

            // Tout le reste des node_modules
            return 'vendor'
          }
        },
      },
    },

    // Performance
    target: 'esnext',
    modulePreload: {
      polyfill: true,
    },
  },

  // Optimisation des dépendances
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      // Ajoutez vos dépendances principales ici
    ],
    exclude: [
      // Dépendances à ne pas pré-bundler
    ],
  },

  server: {
    https: {
      key: fs.readFileSync('./certs/localhost-key.pem'),
      cert: fs.readFileSync('./certs/localhost.pem'),
    },
    host: '192.168.1.113',
    port: 3000,
    cors: true,
    headers: {
      'Service-Worker-Allowed': '/',
    },
  },
})
