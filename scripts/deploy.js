// Creates deploy.zip for Hostinger — cross-platform (forward slashes in zip paths)
// SAFETY: server/ directory is NOT included — extracting never touches server/db.json or backups
// server/index.js must be uploaded separately via File Manager when it changes
import { execSync } from 'child_process'
import { mkdtempSync, cpSync, rmSync, existsSync, copyFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { tmpdir } from 'os'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const stage = mkdtempSync(join(tmpdir(), 'tdg-deploy-'))

try {
  // Only deploy dist/ + package files — server/ is NOT included to prevent db.json wipe
  cpSync(join(root, 'dist'), join(stage, 'dist'), { recursive: true })
  cpSync(join(root, 'package.json'), join(stage, 'package.json'))
  cpSync(join(root, 'package-lock.json'), join(stage, 'package-lock.json'))
  // Save deploy-time backup of db.json for emergency restore
  const dbPath = join(root, 'server', 'db.json')
  if (existsSync(dbPath)) {
    copyFileSync(dbPath, join(root, 'server', 'db.pre-deploy-backup.json'))
    console.log('Pre-deploy backup saved: server/db.pre-deploy-backup.json')
  }

  // Use CJS helper to create zip with forward slashes
  const helper = join(__dirname, 'create-zip.cjs')
  const zipPath = join(root, 'deploy.zip')
  const out = execSync(`node "${helper}" "${stage}" "${zipPath}"`, { encoding: 'utf8', cwd: root })

  for (const line of out.trim().split('\n').filter(Boolean)) {
    if (line.startsWith('ZIP_SIZE:')) {
      const size = parseInt(line.replace('ZIP_SIZE:', ''), 10)
      console.log(`deploy.zip created (${(size / 1024).toFixed(0)} KB) — forward-slash paths`)
    } else if (line.startsWith('ARCHIVER_ERR:')) {
      console.error('Error:', line.replace('ARCHIVER_ERR:', ''))
    } else {
      console.log(line)
    }
  }
} finally {
  rmSync(stage, { recursive: true, force: true })
}
