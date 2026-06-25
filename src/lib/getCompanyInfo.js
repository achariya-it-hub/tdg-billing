import API_BASE from './apiConfig'

let cachedSettings = null

export async function getSettings() {
  if (cachedSettings) return cachedSettings
  try {
    const res = await fetch(`${API_BASE}/api/settings`)
    if (res.ok) {
      cachedSettings = await res.json()
      return cachedSettings
    }
  } catch (e) {
    console.error('Failed to fetch settings:', e)
  }
  return {
    company: { name: 'Ten Den Gyros', address: '', phone: '', email: '', gst: '', logo: null },
    theme: { accentPrimary: '#e63946', accentPrimaryDark: '#c1121f', bgPrimary: '#f5f5f7' },
    printers: []
  }
}

export function clearSettingsCache() {
  cachedSettings = null
}

export async function getCompanyInfo() {
  const s = await getSettings()
  return s.company
}
