import { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react'

const ToastContext = createContext(null)

let toastId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((type, message) => {
    const id = ++toastId
    setToasts(prev => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  const toast = {
    success: (message) => addToast('success', message),
    error: (message) => addToast('error', message),
    warning: (message) => addToast('warning', message),
    info: (message) => addToast('info', message),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <Toaster toasts={toasts} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    return {
      success: () => {},
      error: () => {},
      warning: () => {},
      info: () => {}
    }
  }
  return context
}

const icons = {
  success: <CheckCircle size={20} />,
  error: <XCircle size={20} />,
  warning: <AlertCircle size={20} />,
  info: <Info size={20} />,
}

const colors = {
  success: 'var(--accent-success)',
  error: 'var(--accent-primary)',
  warning: '#d4a00a',
  info: 'var(--accent-info)',
}

const bgColors = {
  success: '#e6f7f5',
  error: '#fef2f2',
  warning: '#fefce8',
  info: '#eff6ff',
}

function Toaster({ toasts }) {
  if (toasts.length === 0) return null
  
  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        zIndex: 2000,
        pointerEvents: 'none'
      }}
    >
      {toasts.map(t => (
        <div
          key={t.id}
          style={{
            background: bgColors[t.type] || 'var(--bg-card)',
            border: `1px solid ${colors[t.type]}30`,
            borderLeft: `4px solid ${colors[t.type]}`,
            borderRadius: '12px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: colors[t.type],
            animation: 'slideIn 0.3s ease',
            pointerEvents: 'auto',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            minWidth: '280px'
          }}
        >
          {icons[t.type]}
          <span style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 500 }}>{t.message}</span>
        </div>
      ))}
    </div>
  )
}

export { Toaster }
