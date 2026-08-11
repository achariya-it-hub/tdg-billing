// Hostinger deployment script
// Usage: node scripts/deploy-hostinger.js
// 1. Builds the frontend
// 2. Packages dist/ + server/ (excludes db.json, backups, node_modules)
// 3. Creates deploy-hostinger.zip ready for upload via hPanel File Manager

import { execSync } from 'child_process'
import { mkdtempSync, cpSync, rmSync, existsSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { tmpdir } from 'os'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

console.log('\n=== TDG Billing — Hostinger Deploy ===\n')

// 1. Build frontend
console.log('1. Building frontend...')
execSync('npm run build', { cwd: root, stdio: 'inherit' })

// 2. Create staging directory
console.log('2. Packaging files...')
const stage = mkdtempSync(join(root, 'tmp-deploy-'))

try {
  // Copy dist/
  const distSrc = join(root, 'dist')
  if (!existsSync(distSrc)) throw new Error('dist/ not found — build may have failed')
  cpSync(distSrc, join(stage, 'dist'), { recursive: true })
  cpSync(distSrc, stage, { recursive: true })
  const distSize = countSize(distSrc)
  console.log(`   ✓ dist/  (${distSize} files copied to root & dist/)`)

  // Copy server/ — exclude runtime database & lock vaults so live Hostinger data is NEVER overwritten
  const serverSrc = join(root, 'server')
  const serverDst = join(stage, 'server')
  cpSync(serverSrc, serverDst, { recursive: true })
  const removeFromServer = [
    'node_modules', 'billing.db', 'backups', 'daily-backups',
    'db.json', 'seed-db.json', 'db.pre-deploy-backup.json',
    'sales_vault_LOCK.json', 'menu_backup_LOCK.json', 'frozen_menu_LOCK.json',
    'inventory_vault_LOCK.json', 'settings_vault_LOCK.json'
  ]
  for (const f of readdirSync(serverDst)) {
    if (removeFromServer.includes(f) || f.endsWith('_LOCK.json')) {
      rmSync(join(serverDst, f), { recursive: true, force: true })
    }
  }

  const serverSize = countSize(serverDst)
  console.log(`   ✓ server/  (${serverSize} code files, preserving live Hostinger db & lock vaults)`)

  // Copy package & root entry files
  cpSync(join(root, 'package.json'), join(stage, 'package.json'))
  cpSync(join(root, 'package-lock.json'), join(stage, 'package-lock.json'))
  if (existsSync(join(root, 'index.js'))) cpSync(join(root, 'index.js'), join(stage, 'index.js'))
  if (existsSync(join(root, 'app.js'))) cpSync(join(root, 'app.js'), join(stage, 'app.js'))
  if (existsSync(join(root, 'app.cjs'))) cpSync(join(root, 'app.cjs'), join(stage, 'app.cjs'))
  if (existsSync(join(root, 'index.cjs'))) cpSync(join(root, 'index.cjs'), join(stage, 'index.cjs'))
  if (existsSync(join(root, '.htaccess'))) cpSync(join(root, '.htaccess'), join(stage, '.htaccess'))
  console.log('   ✓ package.json + index.js + app.js + app.cjs + index.cjs + .htaccess')

  // 3. Create zip
  console.log('\n3. Creating deploy-hostinger.zip...')
  const helper = join(__dirname, 'create-zip.cjs')
  const zipPath = join(root, 'deploy-hostinger.zip')
  const out = execSync(`node "${helper}" "${stage}" "${zipPath}"`, { encoding: 'utf8', cwd: root })

  for (const line of out.trim().split('\n').filter(Boolean)) {
    if (line.startsWith('ZIP_SIZE:')) {
      const size = parseInt(line.replace('ZIP_SIZE:', ''), 10)
      console.log(`   ✓ deploy-hostinger.zip created  (${(size / 1024 / 1024).toFixed(1)} MB)`)
    } else if (line.startsWith('ZIP_ERR:')) {
      console.error('   ✗ Error:', line.replace('ZIP_ERR:', ''))
    }
  }

  // 4. Print instructions
  console.log('\n=== Deployment Instructions ===')
  console.log('')
  console.log('1. Log in to Hostinger hPanel → Hosting → Manage')
  console.log('2. Go to Files → File Manager → Upload deploy-hostinger.zip')
  console.log('3. Extract the zip in your domain root (e.g., /home/u1234/domains/yourdomain.com/public_html)')
  console.log('4. In hPanel, go to Advanced → Node.js Selector')
  console.log('5. Set:')
  console.log('   - Mode: Production')
  console.log('   - Application path: / (root)')
  console.log('   - Entry point: server/index.js')
  console.log('   - Node.js version: 20+')
  console.log('6. Click "Setup" — Hostinger installs dependencies and starts the app')
  console.log('')
  console.log('   First-time setup: Hostinger runs "npm install" automatically.')
  console.log('   The app will be available at your domain. The server serves the')
  console.log('   built frontend from dist/ and the API from /api/* routes.')
  console.log('')
  console.log('   Environment: Server uses process.env.PORT (set by Hostinger)')
  console.log('   - Frontend: yourdomain.com')
  console.log('   - API:      yourdomain.com/api/*')
  console.log('')
  console.log('   IMPORTANT: The deploy does NOT include db.json — your server')
  console.log('   data starts empty. Upload an existing db.json separately via')
  console.log('   File Manager if restoring from backup.')
  console.log('')
} finally {
  rmSync(stage, { recursive: true, force: true })
}

function countSize(dir) {
  let count = 0
  function walk(d) {
    for (const entry of readdirSync(d, { withFileTypes: true })) {
      const full = join(d, entry.name)
      if (entry.isDirectory()) walk(full)
      else count++
    }
  }
  walk(dir)
  return count
}
