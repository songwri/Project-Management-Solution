import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages serves this app from https://<org>.github.io/<repo>/,
// so the base path must match the repo name in production builds.
const repoBase = process.env.VITE_BASE_PATH ?? '/'

// https://vite.dev/config/
export default defineConfig({
  base: repoBase,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // frappe-gantt's package.json "exports" only maps the "." entry, so
      // the bare subpath import for its stylesheet is rejected by Node's
      // exports resolution. Aliasing to the real file bypasses that.
      'frappe-gantt/dist/frappe-gantt.css': fileURLToPath(
        new URL('./node_modules/frappe-gantt/dist/frappe-gantt.css', import.meta.url),
      ),
    },
  },
})
