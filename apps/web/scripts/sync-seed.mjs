// Copies the canonical seed dataset from the repo-root /data folder into
// apps/web/public/data so the web app has an offline demo dataset to read
// from when no Worker API is configured (see src/lib/dataClient.ts).
// Run after editing files under /data: `npm run seed:sync`
import { cpSync, mkdirSync, rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, '..', '..', '..')
const source = path.join(repoRoot, 'data')
const dest = path.join(here, '..', 'public', 'data')

rmSync(dest, { recursive: true, force: true })
mkdirSync(dest, { recursive: true })
cpSync(source, dest, { recursive: true })

console.log(`Synced seed data: ${source} -> ${dest}`)
