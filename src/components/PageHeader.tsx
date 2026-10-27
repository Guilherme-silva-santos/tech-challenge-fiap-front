import type { ReactNode } from 'react'

interface PageHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function PageHeader({ eyebrow, title, description, action, className }: PageHeaderProps) {
  return (
    <header
      className={className}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 16,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {eyebrow && (
          <span
            style={{
              fontSize: 12,
              letterSpacing: '.1em',
              textTransform: 'uppercase',
              fontWeight: 600,
              color: 'var(--accent-hover)',
            }}
          >
            {eyebrow}
          </span>
        )}
        <h1
          style={{
            margin: 0,
            fontFamily: 'Barlow, sans-serif',
            fontWeight: 700,
            fontSize: 38,
            letterSpacing: '-0.01em',
            color: 'var(--ink)',
            lineHeight: 1.1,
          }}
        >
          {title}
        </h1>
        {description && (
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: 15 }}>{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </header>
  )
}
