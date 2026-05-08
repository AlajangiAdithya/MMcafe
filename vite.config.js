import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
// Vite 8 uses Rolldown + Oxc, so we leave minification + transpilation to the
// defaults and only customise what actually matters for production payload
// size: chunk splitting and a few build flags.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('react-dom')) return 'react-dom'
          if (id.includes('react-router')) return 'router'
          if (id.includes('@supabase')) return 'supabase'
          if (id.includes('framer-motion')) return 'motion'
          if (id.includes('lucide-react')) return 'icons'
          if (id.includes('react-icons')) return 'react-icons'
          if (id.includes('class-variance-authority') || id.includes('clsx') || id.includes('tailwind-merge')) return 'shadcn-utils'
          if (id.includes('react-hot-toast')) return 'toast'
          if (id.includes('@emailjs')) return 'emailjs'
          if (id.includes('react/') || id.includes('/react/')) return 'react'
          return 'vendor'
        },
      },
    },
  },
})
