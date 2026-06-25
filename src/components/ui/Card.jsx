export default function Card({ 
  children, 
  padding = 'md',
  hover = false,
  selected = false,
  onClick,
  style,
  glass = false,
  ...props 
}) {
  const paddingMap = {
    none: 0,
    sm: '12px',
    md: '16px',
    lg: '24px',
  }
  
  const isClickable = onClick || hover
  
  return (
    <div
      onClick={onClick}
      style={{
        background: glass ? 'rgba(255, 255, 255, 0.7)' : 'var(--bg-secondary)',
        backdropFilter: glass ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: glass ? 'blur(20px)' : 'none',
        borderRadius: 'var(--radius-lg)',
        border: selected 
          ? '1.5px solid var(--accent-primary)' 
          : glass 
            ? '1px solid rgba(255, 255, 255, 0.3)' 
            : '1px solid var(--border)',
        padding: paddingMap[padding],
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: isClickable ? 'pointer' : 'default',
        boxShadow: selected 
          ? '0 4px 20px rgba(230, 57, 70, 0.15), 0 1px 3px rgba(0,0,0,0.04)' 
          : isClickable
            ? '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0,0,0,0.04)'
            : '0 1px 3px rgba(0, 0, 0, 0.04)',
        ...style
      }}
      onMouseEnter={(e) => {
        if (isClickable) {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0,0,0,0.04)'
          if (!selected) e.currentTarget.style.borderColor = glass ? 'rgba(230,57,70,0.2)' : 'var(--accent-primary)'
        }
      }}
      onMouseLeave={(e) => {
        if (isClickable) {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = selected 
            ? '0 4px 20px rgba(230, 57, 70, 0.15)' 
            : '0 2px 8px rgba(0, 0, 0, 0.04)'
          if (!selected) e.currentTarget.style.borderColor = glass ? 'rgba(255, 255, 255, 0.3)' : 'var(--border)'
        }
      }}
      {...props}
    >
      {children}
    </div>
  )
}
