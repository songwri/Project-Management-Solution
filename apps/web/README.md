# apps/web

React + TypeScript + Vite frontend for the Project Management Solution.
See the [repo root README](../../README.md) for the overall architecture
and [docs/DEPLOYMENT.md](../../docs/DEPLOYMENT.md) for how to deploy it.

## Commands

```
npm install
npm run seed:sync   # copy /data (repo root) into public/data for local demo mode
npm run dev          # http://localhost:5173, no backend required (demo mode)
npm run build
npm run preview
```

## Config

Set `VITE_API_BASE` (e.g. in `.env.local`) to a deployed Worker URL
(`apps/worker`) to switch from local demo mode (localStorage only) to the
real GitHub-backed backend. Unset = demo mode.
