import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dev proxy forwards /api calls to the Spring Boot backend
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
