import { readFileSync, statSync } from 'fs'
const c = readFileSync('server/index.js', 'utf8')
console.log('BACKUP_DIR:', c.includes('BACKUP_DIR'))
console.log('app.post backup:', c.includes("app.post('/api/backup"))
console.log('app.get backups:', c.includes("app.get('/api/backups"))
console.log('SIZE:', statSync('server/index.js').size, 'bytes')
