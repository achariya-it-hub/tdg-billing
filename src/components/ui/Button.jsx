const styles = {
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontWeight: 600,
    borderRadius: '12px',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    WebkitTapHighlightColor: 'transparent',
    touchAction: 'manipulation',
    border: 'none',
    position: 'relative',
    overflow: 'hidden',
    userSelect: 'none',
  },
  sizes: {
    sm: { padding: '10px 14px', fontSize: '13px', minHeight: '36px' },
    md: { padding: '12px 20px', fontSize: '14px', minHeight: '44px' },
    lg: { padding: '14px 28px', fontSize: '16px', minHeight: '52px' },
    xl: { padding: '18px 36px', fontSize: '18px', minHeight: '60px' },
  },
  variants: {
    primary: { 
      background: 'linear-gradient(135deg, #e63946 0%, #c1121f 100%)',
      color: 'white',
      boxShadow: '0 4px 16px rgba(230, 57, 70, 0.3)',
    },
    secondary: { 
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(10px)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border)',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
    },
    ghost: { 
      background: 'transparent', 
      color: 'var(--text-secondary)' 
    },
    success: { 
      background: 'linear-gradient(135deg, #2a9d8f 0%, #21867a 100%)',
      color: 'white',
      boxShadow: '0 4px 16px rgba(42, 157, 143, 0.3)',
    },
    warning: { 
      background: 'linear-gradient(135deg, #e9c46a 0%, #d4a043 100%)',
      color: '#1a1a2e',
      boxShadow: '0 4px 16px rgba(233, 196, 106, 0.3)',
    },
    danger: { 
      background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
      color: 'white',
      boxShadow: '0 4px 16px rgba(220, 38, 38, 0.3)',
    },
  }
}

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  disabled,
  fullWidth,
  style,
  ...props 
}) {
  return (
    <button
      style={{
        ...styles.button,
        ...styles.sizes[size],
        ...styles.variants[variant],
        width: fullWidth ? '100%' : 'auto',
        opacity: disabled || loading ? 0.6 : 1,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        ...style
      }}
      disabled={disabled || loading}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          if (variant === 'primary' || variant === 'success' || variant === 'danger') {
            e.currentTarget.style.boxShadow = '0 6px 24px rgba(230, 57, 70, 0.4)'
          }
          e.currentTarget.style.transform = 'translateY(-1px)'
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = styles.variants[variant].boxShadow || 'none'
        }
      }}
      {...props}
    >
      {loading && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
          <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite" />
          </path>
        </svg>
      )}
      {children}
    </button>
  )
}
