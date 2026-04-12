export default function Card({ 
  children, 
  padding = 'md',
  hover = false,
  selected = false,
  onClick,
  style,
  ...props 
}) {
  const paddingMap = {
    none: 0,
    sm: '12px',
    md: '16px',
    lg: '24px',
  }
  
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--bg-card)',
        borderRadius: '16px',
        border: `1px solid ${selected ? 'var(--accent-primary)' : 'var(--border)'}`,
        padding: paddingMap[padding],
        transition: 'all 0.2s ease',
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: selected 
          ? '0 4px 20px rgba(230, 57, 70, 0.15)' 
          : hover 
            ? '0 4px 16px rgba(0, 0, 0, 0.08)' 
            : '0 2px 8px rgba(0, 0, 0, 0.04)',
        ...style
      }}
      onMouseEnter={(e) => {
        if (hover) {
          e.currentTarget.style.borderColor = 'var(--accent-primary)'
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.1)'
        }
      }}
      onMouseLeave={(e) => {
        if (hover) {
          e.currentTarget.style.borderColor = selected ? 'var(--accent-primary)' : 'var(--border)'
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = selected 
            ? '0 4px 20px rgba(230, 57, 70, 0.15)' 
            : '0 2px 8px rgba(0, 0, 0, 0.04)'
        }
      }}
      {...props}
    >
      {children}
    </div>
  )
}
