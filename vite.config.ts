import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})


// sudo certbot certonly --standalone -d gosecure.site -d operator.gosecure.site -d www.gosecure.site -d api.gosecure.site -d admin.gosecure.site -d generateur-de-devis.fr -d www.generateur-de-devis.fr