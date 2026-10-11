import { useEffect, useState } from 'react'
import { THEMES, DEFAULT_THEME_ID, applyTheme } from './theme'

const STORAGE_KEY = 'legendary-settings'

export interface Settings {
  showRevealPopups: boolean
  theme: string
}

const DEFAULT_SETTINGS: Settings = {
  showRevealPopups: true,
  theme: DEFAULT_THEME_ID,
}

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SETTINGS
    const merged: Settings = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
    // zapisany motyw, którego już nie ma na liście, wraca do domyślnego
    if (!THEMES.some((t) => t.id === merged.theme)) merged.theme = DEFAULT_THEME_ID
    return merged
  } catch {
    return DEFAULT_SETTINGS
  }
}

// Motyw od razu przy starcie aplikacji (także na ekranie startowym, który nie woła useSettings)
applyTheme(loadSettings().theme)

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() => loadSettings())

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch {
      // np. tryb prywatny bez dostępu do localStorage — ignorujemy
    }
  }, [settings])

  useEffect(() => {
    applyTheme(settings.theme)
  }, [settings.theme])

  function updateSetting<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  return { settings, updateSetting }
}