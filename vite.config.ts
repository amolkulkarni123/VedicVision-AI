import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' // Only keep if you use path aliases

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/VedicVision-AI/', // CRITICAL: This ensures your paths don't break on GitHub Pages
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
