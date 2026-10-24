import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const setsDir = path.join(root, 'src', 'data', 'sets')
// src is a writable project directory in the app environment; an optional
// first argument can be used to choose another output path locally.
const requestedOutput = process.argv.slice(2).find((argument) => argument.toLowerCase().endsWith('.txt'))
const outputPath = path.resolve(root, requestedOutput ?? path.join('src', 'characters.txt'))

const read = (file) => fs.readFileSync(file, 'utf8')
const quote = (value) => value.replace(/^['"]|['"]$/g, '')

function parseGroups(source, exportName) {
  const start = source.indexOf(`export const ${exportName}`)
  if (start < 0) return []
  const end = source.indexOf('\nexport const ', start + 1)
  const block = source.slice(start, end < 0 ? source.length : end)
  const groups = []
  const pattern = /\{\s*id:\s*'([^']+)'\s*,\s*name:\s*'([^']+)'\s*(?:,\s*realName:\s*'([^']+)')?\s*,\s*cards:\s*([A-Z0-9_]+)/g
  for (const match of block.matchAll(pattern)) {
    groups.push({ id: match[1], name: match[2], realName: match[3] ?? '—', cards: match[4] })
  }
  return groups
}

function parseCardNames(source, constantName) {
  const start = source.indexOf(`export const ${constantName}`)
  if (start < 0) return []
  const end = source.indexOf('\nexport const ', start + 1)
  const block = source.slice(start, end < 0 ? source.length : end)
  const cardNames = [...block.matchAll(/\bname:\s*'([^']+)'/g)].map((match) => match[1])
  const helperCardNames = [...block.matchAll(/\bvillainCard\('[^']+',\s*'([^']+)'/g)].map((match) => match[1])
  return [...cardNames, ...helperCardNames]
}

function parseHeroes(setDir, content) {
  const heroExport = content.match(/export const ([A-Z0-9_]+_HEROES)\s*:/)?.[1]
  const groups = heroExport ? parseGroups(content, heroExport) : []
  const cardsSource = read(path.join(setDir.path, 'cards.ts'))
  const teams = new Map()
  for (const match of cardsSource.matchAll(/hero:\s*'([^']+)'[\s\S]{0,280}?team:\s*\[([^\]]*)\]/g)) {
    teams.set(match[1], [...match[2].matchAll(/'([^']+)'/g)].map((item) => item[1]))
  }
  return groups.map((group) => ({ ...group, teams: teams.get(group.name) ?? [] }))
}

function parseMasterminds(setDir) {
  const source = read(path.join(setDir.path, 'cards.ts'))
  return [...source.matchAll(/export const [A-Z0-9_]+:\s*MastermindData\s*=\s*\{\s*card:\s*\{[^}]*?name:\s*'([^']+)'/g)]
    .map((match) => match[1])
}

const setDirs = fs.readdirSync(setsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && /^\d/.test(entry.name))
  .sort((a, b) => a.name.localeCompare(b.name))
  .map((entry) => ({ name: entry.name, path: path.join(setsDir, entry.name) }))

const lines = ['MARVEL LEGENDARY CONTENT CATALOG', '']
for (const setDir of setDirs) {
  const contentPath = path.join(setDir.path, 'content.ts')
  if (!fs.existsSync(contentPath)) continue
  const content = read(contentPath)
  lines.push(`=== ${setDir.name} ===`, '', 'HEROES')
  for (const hero of parseHeroes(setDir, content)) {
    lines.push(`- ${hero.name} | Real Name: ${hero.realName} | Teams: ${hero.teams.join(', ') || '—'}`)
  }

  const cardsSource = read(contentPath)
  for (const [label, suffix] of [['VILLAIN GROUPS', '_VILLAIN_GROUPS'], ['HENCHMEN GROUPS', '_HENCHMEN_GROUPS']]) {
    lines.push('', label)
    const exportName = cardsSource.match(new RegExp(`export const ([A-Z0-9_]+${suffix})\\s*:`))?.[1]
    for (const group of exportName ? parseGroups(cardsSource, exportName) : []) {
      const names = parseCardNames(read(path.join(setDir.path, 'cards.ts')), group.cards)
      lines.push(`- ${group.name}: ${names.join(', ') || '—'}`)
    }
  }

  lines.push('', 'MASTERMINDS', ...parseMasterminds(setDir).map((name) => `- ${name}`))
  lines.push('', 'SCHEMES')
  const schemeFiles = fs.readdirSync(setDir.path).filter((file) => file === 'schemes.ts')
  for (const schemeFile of schemeFiles) {
    const source = read(path.join(setDir.path, schemeFile))
    for (const match of source.matchAll(/id:\s*'([^']+)'[\s\S]{0,220}?name:\s*'([^']+)'/g)) lines.push(`- ${match[2]}`)
  }
  lines.push('')
}

fs.writeFileSync(outputPath, `${lines.join('\n')}\n`, 'utf8')
console.log(`Wrote ${outputPath}`)
