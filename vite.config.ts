import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // For GitHub Pages deploys, set BASE_PATH env to "/<repo-name>/"
  // Example in CI: BASE_PATH="/church-site-2/"
  // Use root base during local dev so the dev server runs at http://localhost:5173/
  // @ts-ignore process is provided by Node at build time
  base: command === 'serve' ? '/' : (process.env.BASE_PATH || '/wilsonnguyen257.github.io'),
  plugins: [react()],
}))
