import type { Status } from '@/types'
import { STATUS_LABEL } from '@/lib/utils'

const STATUS_STYLES: Record<Status, { background: string; color: string }> = {
  recebida:             { background: '#ECEAE4', color: '#3F3C36' },
  em_diagnostico:       { background: '#E3ECF8', color: '#1E4E8C' },
  aguardando_aprovacao: { background: '#FCEFC7', color: '#7A4A00' },
  em_execucao:          { background: '#FBE4D2', color: '#9A3412' },
  finalizada:           { background: '#DDF0E3', color: '#1C5E33' },
  entregue:             { background: '#1F1E1B', color: '#FFFFFF' },
  rejeitada:            { background: '#FDECEA', color: '#B42318' },
}

interface StatusPillProps {
  status: Status
  className?: string
}

export function StatusPill({ status, className }: StatusPillProps) {
  const s = STATUS_STYLES[status]
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: 'nowrap',
        background: s.background,
        color: s.color,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: 'currentColor',
          flexShrink: 0,
        }}
      />
      {STATUS_LABEL[status]}
    </span>
  )
}
