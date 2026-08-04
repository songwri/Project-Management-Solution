// Runtime configuration, injected at build time via Vite env vars.
//
// - VITE_API_BASE: base URL of the deployed Cloudflare Worker (e.g.
//   "https://pm-solution-api.yourteam.workers.dev"). When set, ALL reads
//   and writes go through the Worker, which is the recommended production
//   setup (see apps/worker and docs/DEPLOYMENT.md).
// - When unset (e.g. plain `npm run dev` with no .env), the app runs in
//   local demo mode: it reads the bundled seed dataset from /data/*.json
//   (public/data, synced from the repo-root /data folder) and persists
//   any edits to the browser's localStorage only. This makes the app
//   fully explorable with zero setup.
export const API_BASE: string | undefined = import.meta.env.VITE_API_BASE
export const IS_DEMO_MODE = !API_BASE
