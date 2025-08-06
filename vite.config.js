import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  
  plugins: [react({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    })],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          
          react: ['react', 'react-dom'],
          vendor: ['axios', '@supabase/supabase-js', '@tanstack/react-query', 'lucide-react', '@google/genai', '@supabase/auth-ui-shared','motion'],
        },
      },
    },
  },
})
