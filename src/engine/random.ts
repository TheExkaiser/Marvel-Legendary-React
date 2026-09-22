// <T> to generyk, jak w C#: działa dla tablicy dowolnego typu
export function shuffle<T>(items: T[]): T[] {
  const result = [...items] // kopia, żeby nie ruszać oryginału

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = result[i]
    result[i] = result[j]
    result[j] = temp
  }

  return result
}