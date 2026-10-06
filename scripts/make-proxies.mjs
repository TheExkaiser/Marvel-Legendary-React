import sharp from 'sharp'
import { mkdir, readdir, stat } from 'node:fs/promises'
import path from 'node:path'

const SRC = 'public/cards' // folder z dużymi obrazkami (dostosuj)
const DEST = 'public/cards-small' // folder na małe wersje
const WIDTH = 180 // szerokość proxy w pikselach

async function walk(dir) {
  const result = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) result.push(...(await walk(full)))
    else if (/\.(png|jpe?g|webp)$/i.test(entry.name)) result.push(full)
  }
  return result
}

async function isUpToDate(src, dest) {
  try {
    const [s, d] = await Promise.all([stat(src), stat(dest)])
    return d.mtimeMs >= s.mtimeMs
  } catch {
    return false
  }
}

for (const src of await walk(SRC)) {
  const rel = path.relative(SRC, src)
  const dest = path.join(DEST, rel).replace(/\.\w+$/, '.webp')
  if (await isUpToDate(src, dest)) continue
  await mkdir(path.dirname(dest), { recursive: true })
  await sharp(src).resize({ width: WIDTH }).webp({ quality: 70 }).toFile(dest)
  console.log('OK', rel)
}