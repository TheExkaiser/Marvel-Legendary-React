import { useEffect, useState } from 'react'

// Zwraca true, gdy zapytanie CSS (np. '(max-height: 500px)') aktualnie pasuje. Odświeża się przy zmianie rozmiaru/obrotu ekranu.
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)

  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    mql.addEventListener('change', onChange)
    onChange()
    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return matches
}
