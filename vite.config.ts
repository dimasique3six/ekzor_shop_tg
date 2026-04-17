import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/ekzor_shop_tg/',
  server: { port: 5173, host: true }
})
