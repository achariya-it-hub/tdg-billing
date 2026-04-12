import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])
  
  if (!isOpen) return null
  
  const sizeMap = {
    sm: '360px',
    md: '480px',
    lg: '640px',
    xl: '800px',
    full: '100vw'
  }
  
  const isFullScreen = size === 'full'
  
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: isFullScreen ? 'stretch' : 'center',
        justifyContent: 'center',
        zIndex: 1000,
        animation: 'fadeIn 0.2s ease'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-card)',
          borderRadius: isFullScreen ? 0 : '20px',
          border: isFullScreen ? 'none' : '1px solid var(--border)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
          width: '100%',
          maxWidth: sizeMap[size],
          maxHeight: isFullScreen ? '100vh' : '90vh',
          overflow: 'auto',
          animation: 'slideInUp 0.3s ease',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: isFullScreen ? '16px' : '20px 24px',
            borderBottom: '1px solid var(--border)',
            flexShrink: 0
          }}
        >
          <h3 style={{ fontSize: isFullScreen ? '18px' : '20px', margin: 0, fontWeight: 700 }}>{title}</h3>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-secondary)',
              color: 'var(--text-secondary)',
              padding: '10px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <X size={isFullScreen ? 24 : 20} />
          </button>
        </div>
        <div style={{ padding: isFullScreen ? '16px' : '24px', flex: 1, overflow: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
