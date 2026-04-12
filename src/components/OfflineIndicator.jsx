import { useState, useEffect } from 'react'
import { WifiOff, Wifi } from 'lucide-react'

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    if (!isOnline) {
      setShow(true)
      const timer = setTimeout(() => setShow(false), 5000)
      return () => clearTimeout(timer)
    } else {
      setShow(true)
      setTimeout(() => setShow(false), 2000)
    }
  }, [isOnline])

  if (!show) return null

  return (
    <div style={{
      position: 'fixed',
      top: isOnline ? 'auto' : 0,
      bottom: isOnline ? 0 : 'auto',
      left: 0,
      right: 0,
      background: isOnline ? '#10b981' : '#ef4444',
      color: 'white',
      padding: '10px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      zIndex: 9999,
      fontWeight: 600,
      fontSize: '14px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
    }}>
      {isOnline ? (
        <>
          <Wifi size={18} />
          Back Online
        </>
      ) : (
        <>
          <WifiOff size={18} />
          Offline Mode - Changes will sync when connected
        </>
      )}
    </div>
  )
}