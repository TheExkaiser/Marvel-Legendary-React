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