export interface ThemeDef {
  id: string
  label: string
  backgroundImage?: string // ścieżka względem public/
}

// Nowy motyw = nowy wpis tutaj (plus ewentualny blok CSS pod :root[data-theme='id'])
export const THEMES: ThemeDef[] = [
  { id: 'classic', label: 'Classic (gradient)' },
  { id: 'image', label: 'Default Image', backgroundImage: 'backgrounds/bg_01.jpg' },
  {id: 'image2', label: 'Dark City', backgroundImage: 'backgrounds/bg_02.jpeg' },
]

export const DEFAULT_THEME_ID = 'classic'

export function applyTheme(id: string): void {
  const theme = THEMES.find((t) => t.id === id) ?? THEMES[0]
  const root = document.documentElement
  root.dataset.theme = theme.id
  if (theme.backgroundImage) {
    // BASE_URL, żeby działało też po deployu na GitHub Pages (podkatalog repo)
    root.style.setProperty('--bg-image', `url("${import.meta.env.BASE_URL}${theme.backgroundImage}")`)
  } else {
    root.style.removeProperty('--bg-image')
  }
}