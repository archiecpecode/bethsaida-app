import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Bethsaida Music Team',
        short_name: 'Bethsaida',
        description: 'Music program builder and AI assistant',
        theme_color: '#0f172a'
      }
    })
  ],
})