import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/lfp-climate/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split heavy vendor deps into separate cacheable chunks
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-charts': ['recharts'],
          'vendor-csv': ['papaparse'],
        },
      },
    },
  },
})
