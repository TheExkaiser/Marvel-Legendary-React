import { useEffect, useState } from 'react'

const STORAGE_KEY = 'legendary-settings'

export interface Settings {
  showRevealPopups: boolean
}

const DEFAULT_SETTINGS: Settings = {
  showRevealPopups: true,
}

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SETTINGS
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() => loadSettings())

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch {
      // np. tryb prywatny bez dostępu do localStorage — ignorujemy
    }
  }, [settings])

  function updateSetting<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  return { settings, updateSetting }
}