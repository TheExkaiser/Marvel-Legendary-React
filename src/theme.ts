export interface ThemeDef {
  id: string
  label: string
  backgroundImage?: string // ścieżka względem public/
}

// Nowy motyw = nowy wpis tutaj (plus ewentualny blok CSS pod :root[data-theme='id'])
export const THEMES: ThemeDef[] = [
  { id: 'classic', label: 'Core Set', backgroundImage: 'backgrounds/bg_01.jpg' },
  { id: 'dark-city', label: 'Dark City', backgroundImage: 'backgrounds/bg_02.jpeg' },
  { id: 'fantastic-four', label: 'Fantastic Four', backgroundImage: 'backgrounds/bg_ff.jpeg' },
  { id: 'paint-the-town-red', label: 'Paint the Town Red', backgroundImage: 'backgrounds/bg_pttr.jpg' },
]

export const DEFAULT_THEME_ID = 'classic'

export function applyTheme(id: string, useImage = false): void {
  const theme = THEMES.find((t) => t.id === id) ?? THEMES[0]
  const root = document.documentElement
  root.dataset.theme = theme.id
  const imageEnabled = useImage && !!theme.backgroundImage
  root.dataset.themeImage = imageEnabled ? 'true' : 'false'
  if (imageEnabled) {
    // BASE_URL, żeby działało też po deployu na GitHub Pages (podkatalog repo)
    root.style.setProperty('--bg-image', `url("${import.meta.env.BASE_URL}${theme.backgroundImage}")`)
  } else {
    root.style.removeProperty('--bg-image')
  }
}
