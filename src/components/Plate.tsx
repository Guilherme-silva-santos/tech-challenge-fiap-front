import { cn } from '@/lib/utils'

interface PlateProps {
  value: string
  className?: string
}

export function Plate({ value, className }: PlateProps) {
  return (
    <span
      className={cn('inline-flex flex-col overflow-hidden rounded-[4px] border border-[--ink] flex-none', className)}
      style={{ fontSize: 0 }}
    >
      <span
        style={{
          height: 6,
          background: '#1E4E8C',
          display: 'block',
        }}
      />
      <span
        style={{
          padding: '2px 8px 4px',
          fontFamily: "'IBM Plex Mono', monospace",
          fontWeight: 500,
          fontSize: 13,
          letterSpacing: '.05em',
          color: 'var(--ink)',
          background: 'var(--surface)',
          lineHeight: 1.2,
        }}
      >
        {value}
      </span>
    </span>
  )
}
