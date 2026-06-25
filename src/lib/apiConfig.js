// API Configuration for production
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'

// On Hostinger, frontend and backend are served from the same server
export const API_BASE = isProduction ? window.location.origin : 'http://localhost:3001'

export default API_BASE