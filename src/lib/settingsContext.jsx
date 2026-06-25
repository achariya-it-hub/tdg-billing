import { createContext, useContext, useState, useEffect } from 'react'
import { getSettings, clearSettingsCache } from './getCompanyInfo'

const SettingsContext = createContext(null)

export function useSettings() {
  return useContext(SettingsContext)
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadSettings = async () => {
    clearSettingsCache()
    const s = await getSettings()
    setSettings(s)
    applyTheme(s.theme)
    setLoading(false)
  }

  useEffect(() => {
    loadSettings()
  }, [])

  const applyTheme = (theme) => {
    if (!theme) return
    const root = document.documentElement
    root.style.setProperty('--accent-primary', theme.accentPrimary || '#e63946')
    root.style.setProperty('--accent-primary-dark', theme.accentPrimaryDark || '#c1121f')
    root.style.setProperty('--accent-primary-light', adjustBrightness(theme.accentPrimary || '#e63946', 40))
    root.style.setProperty('--accent-gradient', `linear-gradient(135deg, ${theme.accentPrimary || '#e63946'} 0%, ${theme.accentPrimaryDark || '#c1121f'} 100%)`)
    root.style.setProperty('--accent-gradient-warm', `linear-gradient(135deg, ${theme.accentPrimary || '#e63946'} 0%, #f4a261 100%)`)
    root.style.setProperty('--shadow-glow', `0 4px 20px ${hexToRgba(theme.accentPrimary || '#e63946', 0.25)}`)
    root.style.setProperty('--shadow-glow-sm', `0 2px 8px ${hexToRgba(theme.accentPrimary || '#e63946', 0.2)}`)
    if (theme.bgPrimary) root.style.setProperty('--bg-primary', theme.bgPrimary)
  }

  return (
    <SettingsContext.Provider value={{ settings, loading, reloadSettings: loadSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function adjustBrightness(hex, amount) {
  let r = parseInt(hex.slice(1, 3), 16)
  let g = parseInt(hex.slice(3, 5), 16)
  let b = parseInt(hex.slice(5, 7), 16)
  r = Math.min(255, r + amount)
  g = Math.min(255, g + amount)
  b = Math.min(255, b + amount)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}
