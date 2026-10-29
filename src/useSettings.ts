import { useEffect, useState } from 'react'
import { THEMES, DEFAULT_THEME_ID, applyTheme } from './theme'

const STORAGE_KEY = 'legendary-settings'

export interface Settings {
  showRevealPopups: boolean
  theme: string
  useThemeImage: boolean
  sidekicksEnabled: boolean
  excludedBystanderGroupIds: string[]
  confirmSetDisable: boolean
}

const DEFAULT_SETTINGS: Settings = {
  showRevealPopups: true,
  theme: DEFAULT_THEME_ID,
  useThemeImage: false,
  sidekicksEnabled: true,
  excludedBystanderGroupIds: [],
  confirmSetDisable: false,
}

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SETTINGS
    const stored = JSON.parse(raw) as Partial<Settings>
    // Migracja wcześniejszych, osobnych motywów obrazkowych.
    const legacyImageTheme = stored.theme === 'image' || stored.theme === 'image2'
    const migratedTheme = stored.theme === 'image' ? 'classic' : stored.theme === 'image2' ? 'dark-city' : stored.theme
    const merged: Settings = {
      ...DEFAULT_SETTINGS,
      ...stored,
      theme: migratedTheme ?? DEFAULT_THEME_ID,
      useThemeImage: legacyImageTheme || stored.useThemeImage === true,
      sidekicksEnabled: stored.sidekicksEnabled !== false,
      excludedBystanderGroupIds: Array.isArray(stored.excludedBystanderGroupIds)
        ? stored.excludedBystanderGroupIds.filter((id): id is string => typeof id === 'string')
        : [],
      confirmSetDisable: stored.confirmSetDisable === true,
    }
    // zapisany motyw, którego już nie ma na liście, wraca do domyślnego
    if (!THEMES.some((t) => t.id === merged.theme)) merged.theme = DEFAULT_THEME_ID
    return merged
  } catch {
    return DEFAULT_SETTINGS
  }
}

// Motyw od razu przy starcie aplikacji (także na ekranie startowym, który nie woła useSettings)
const initialSettings = loadSettings()
applyTheme(initialSettings.theme, initialSettings.useThemeImage)

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
    applyTheme(settings.theme, settings.useThemeImage)
  }, [settings.theme, settings.useThemeImage])

  function updateSetting<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  return { settings, updateSetting }
}
