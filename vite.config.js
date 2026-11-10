import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        // long-lived vendor chunks: they stay cached when only the site code changes
        manualChunks: {
          react: ['react', 'react-dom'],
          motion: ['gsap', 'lenis'],
        },
      },
    },
  },
})
