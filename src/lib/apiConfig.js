// API Configuration for production
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'

// Use Railway backend in production, localhost for development
export const API_BASE = isProduction ? 'https://tdg-billing-production.up.railway.app' : 'http://localhost:3001'

export default API_BASE