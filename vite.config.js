import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite' // <-- Importamos el nuevo motor

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(), // <-- Lo activamos aquí
  ],
})