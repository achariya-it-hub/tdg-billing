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
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: isFullScreen ? 'stretch' : 'center',
        justifyContent: 'center',
        zIndex: 1000,
        animation: 'fadeIn 0.2s ease',
        padding: isFullScreen ? 0 : '20px'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={isFullScreen ? '' : 'animate-scale-in'}
        style={{
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          borderRadius: isFullScreen ? 0 : '24px',
          border: isFullScreen ? 'none' : '1px solid rgba(255, 255, 255, 0.4)',
          boxShadow: '0 24px 80px rgba(0, 0, 0, 0.2), 0 1px 3px rgba(0,0,0,0.04)',
          width: '100%',
          maxWidth: sizeMap[size],
          maxHeight: isFullScreen ? '100vh' : '90vh',
          overflow: 'auto',
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
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            flexShrink: 0
          }}
        >
          <h3 style={{ fontSize: isFullScreen ? '18px' : '20px', margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h3>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(0,0,0,0.04)',
              color: 'var(--text-secondary)',
              padding: '10px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.08)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.04)' }}
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
