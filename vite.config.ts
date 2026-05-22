import { URL, fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import netlify from '@netlify/vite-plugin-tanstack-start'
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
    ...(!isVPS ? [netlify()] : []),
    viteReact(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes('node_modules/recharts') ||
            id.includes('node_modules/d3-')
          ) {
            return 'vendor-charts'
          }
          if (id.includes('node_modules/@visx')) {
            return 'vendor-charts'
          }
          if (
            id.includes('node_modules/framer-motion') ||
            id.includes('node_modules/motion')
          ) {
            return 'vendor-motion'
          }
        },
      },
    },
  },
}))

export default config
