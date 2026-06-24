import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: '/' — absolute asset paths so client-side routes like /blog/:id
// resolve assets correctly (relative base breaks on nested routes).
export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: { three: ['three'] },
      },
    },
  },
})
