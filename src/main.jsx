import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import API_BASE from './lib/apiConfig'

// Intercept all fetch requests to inject JWT token for POS security
const originalFetch = window.fetch
window.fetch = async (...args) => {
  let [resource, config] = args
  
  // Attach token if making a request to our API
  if (typeof resource === 'string' && resource.startsWith(API_BASE)) {
    const token = localStorage.getItem('token')
    if (token) {
      config = config || {}
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`
      }
    }
  }
  
  const response = await originalFetch(resource, config)
  
  // Handle session expiration for protected endpoints
  if (response.status === 401 && !resource.includes('/api/billing/login')) {
    if (resource.includes('/api/pos') || resource.includes('/api/admin') || resource.includes('/api/settings') || resource.includes('/api/inventory') || resource.includes('/api/reports')) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.dispatchEvent(new CustomEvent('session-expired'))
      // Short timeout to let UI react before reload
      setTimeout(() => window.location.reload(), 1000)
    }
  }
  
  return response
}

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(reg => {
      console.log('SW registered:', reg.scope)
    }).catch(err => {
      console.log('SW registration failed:', err)
    })
  })
}

// PWA install prompt
let deferredPrompt = null
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  deferredPrompt = e
  if (!isStandalone) {
    window.dispatchEvent(new CustomEvent('pwa-install-ready', { detail: true }))
  }
})

// For iOS: show install guide after 3 seconds if not already installed
if (isIOS && !isStandalone) {
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('pwa-install-ready', { detail: true }))
  }, 3000)
}

window.getPWAPrompt = () => deferredPrompt
window.clearPWAPrompt = () => { deferredPrompt = null }
window.isPWAiOS = isIOS
window.isPWAStandalone = isStandalone

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
