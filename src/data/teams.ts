export const TEAM_NAMES: Record<string, string> = {
  'x-men': 'X-Men',
  'avengers': 'Avengers',
  'spider-friends': 'Spider Friends',
  'S.H.I.E.L.D.': 'S.H.I.E.L.D.',
  'marvel-knights': 'Marvel Knights',
  'x-force': 'X-Force',
}

// Brak wpisu = pokazujemy samo id, więc nowy team nigdy nie psuje wyświetlania
export function teamName(id: string): string {
  return TEAM_NAMES[id] ?? id
}

// Ścieżki względem public/ (tak jak ikony bohaterów). Brak wpisu = brak ikonki.
export const TEAM_ICONS: Record<string, string> = {
  'x-men': 'icons/x-men.png',
  'avengers': 'icons/avengers.png',
  'spider-friends': 'icons/spider-friends.png',
  'S.H.I.E.L.D.': 'icons/shield.png',
  'marvel-knights': 'icons/marvel-knights.png',
  'x-force': 'icons/x-force.png',
}

export function teamIcon(id?: string): string | undefined {
  return id ? TEAM_ICONS[id] : undefined
}
