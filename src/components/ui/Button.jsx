const styles = {
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontWeight: 600,
    borderRadius: '12px',
    transition: 'all 0.15s ease',
    WebkitTapHighlightColor: 'transparent',
    touchAction: 'manipulation',
    border: 'none',
  },
  sizes: {
    sm: { padding: '10px 14px', fontSize: '13px', minHeight: '36px' },
    md: { padding: '12px 20px', fontSize: '14px', minHeight: '44px' },
    lg: { padding: '14px 28px', fontSize: '16px', minHeight: '52px' },
    xl: { padding: '18px 36px', fontSize: '18px', minHeight: '60px' },
  },
  variants: {
    primary: { 
      background: 'var(--accent-primary)', 
      color: 'white',
      boxShadow: '0 2px 8px rgba(230, 57, 70, 0.3)'
    },
    secondary: { 
      background: 'var(--bg-elevated)', 
      color: 'var(--text-primary)',
      border: '1px solid var(--border)'
    },
    ghost: { 
      background: 'transparent', 
      color: 'var(--text-secondary)' 
    },
    success: { 
      background: 'var(--accent-success)', 
      color: 'white',
      boxShadow: '0 2px 8px rgba(42, 157, 143, 0.3)'
    },
    warning: { 
      background: 'var(--accent-warning)', 
      color: 'var(--bg-primary)' 
    },
    danger: { 
      background: '#dc2626', 
      color: 'white',
      boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3)'
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
        userSelect: 'none',
        ...style
      }}
      disabled={disabled || loading}
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
