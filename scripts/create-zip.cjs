const { readFileSync, writeFileSync, statSync, readdirSync, existsSync } = require('fs')
const { join } = require('path')
const JSZip = require('jszip')

const stage = process.argv[2]
const outPath = process.argv[3]

async function main() {
  const zip = new JSZip()

  function addDir(dir, prefix) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name)
      const name = prefix ? prefix + '/' + entry.name : entry.name
      if (entry.isDirectory()) {
        addDir(full, name)
      } else {
        zip.file(name, readFileSync(full))
      }
    }
  }

  addDir(join(stage, 'dist'), 'dist')
  if (existsSync(join(stage, 'server'))) addDir(join(stage, 'server'), 'server')
  if (existsSync(join(stage, 'package.json'))) zip.file('package.json', readFileSync(join(stage, 'package.json')))
  if (existsSync(join(stage, 'package-lock.json'))) zip.file('package-lock.json', readFileSync(join(stage, 'package-lock.json')))

  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 9 } })
  writeFileSync(outPath, buf)
  console.log('ZIP_SIZE:' + statSync(outPath).size)
}

main().catch(err => { console.error('ZIP_ERR:' + err.message); process.exit(1) })
