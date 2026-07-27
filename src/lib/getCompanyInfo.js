import API_BASE from './apiConfig'

let cachedSettings = null

export async function getSettings() {
  if (cachedSettings) return cachedSettings
  try {
    const res = await fetch(`${API_BASE}/api/settings`)
    if (res.ok) {
      cachedSettings = await res.json()
      if (cachedSettings.company) {
        try { localStorage.setItem('tdg_company_settings', JSON.stringify(cachedSettings.company)) } catch (e) {}
      }
      return cachedSettings
    }
  } catch (e) {
    console.error('Failed to fetch settings:', e)
  }
  return {
    company: getCompanyInfoSync(),
    theme: { accentPrimary: '#e63946', accentPrimaryDark: '#c1121f', bgPrimary: '#f5f5f7' },
    printers: []
  }
}

export function clearSettingsCache() {
  cachedSettings = null
}

export function getCompanyInfoSync() {
  if (cachedSettings && cachedSettings.company) {
    return cachedSettings.company
  }
  try {
    const raw = localStorage.getItem('tdg_company_settings')
    if (raw) return JSON.parse(raw)
  } catch (e) {}
  return {
    name: 'Ten Dens Gyros',
    address: 'Shop 1 & 2, Kottakuppam, Viluppuram',
    phone: '000000000',
    email: '',
    gst: '',
    logo: null
  }
}

export async function getCompanyInfo() {
  const s = await getSettings()
  return s.company || getCompanyInfoSync()
}
