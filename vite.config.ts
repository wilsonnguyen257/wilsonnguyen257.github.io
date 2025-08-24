import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // For GitHub Pages deploys, set BASE_PATH env to "/<repo-name>/"
  // Example in CI: BASE_PATH="/church-site-2/"
  // @ts-ignore process is provided by Node at build time
  base: process.env.BASE_PATH || '/',
  plugins: [react()],
})
