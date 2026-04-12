const API_BASE = window.location.port === '3001' || window.location.port === '3005' 
  ? `${window.location.protocol}//${window.location.host}`
  : 'http://localhost:3001';

export default API_BASE;