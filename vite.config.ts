import { URL, fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import netlify from '@netlify/vite-plugin-tanstack-start'
import { nitro } from 'nitro/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'

const isVPS = process.env.BUILD_TARGET === 'vps'

const config = defineConfig(({ mode }) => ({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [
    ...(mode === 'development' ? [devtools()] : []),
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart(),
    ...(isVPS ? [nitro()] : [netlify()]),
    viteReact(),
  ],
  build: {
    // Suppress the warning limit up to 1000kb if you prefer
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 1. Charts
          if (
            id.includes('node_modules/recharts') ||
            id.includes('node_modules/d3-') ||
            id.includes('node_modules/@visx')
          ) {
            return 'vendor-charts'
          }
          // 2. Motion
          if (
            id.includes('node_modules/framer-motion') ||
            id.includes('node_modules/motion')
          ) {
            return 'vendor-motion'
          }
          // 3. Core React
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/')
          ) {
            return 'vendor-react'
          }
          // 4. Core TanStack (Router, Query, etc.)
          if (id.includes('node_modules/@tanstack/')) {
            return 'vendor-tanstack'
          }
        },
      },
    },
  },
}))

export default config
