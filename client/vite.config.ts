import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'pdf-renderer': ['@react-pdf/renderer'],
          'recharts': ['recharts'],
          'framer-motion': ['framer-motion'],
          'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          'ui-icons': ['lucide-react']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
