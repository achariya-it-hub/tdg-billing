// API Configuration - auto-detects environment
const isVercel = window.location.hostname.includes('vercel.app')
const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

const API_BASE = isVercel 
  ? ''  // Same origin on Vercel
  : isDev 
    ? 'http://localhost:3001'  // Local development server
    : ''  // Default to same origin

export default API_BASE