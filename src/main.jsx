import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

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
