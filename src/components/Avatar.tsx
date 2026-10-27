import { cn } from '@/lib/utils'

interface AvatarInitialsProps {
  name: string
  variant?: 'default' | 'pj' | 'sidebar'
  size?: 'sm' | 'md'
  className?: string
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

export function AvatarInitials({ name, variant = 'default', size = 'md', className }: AvatarInitialsProps) {
  const dims = size === 'sm' ? 'w-[34px] h-[34px] text-[12px]' : 'w-9 h-9 text-[12px]'

  const colors =
    variant === 'pj'
      ? { background: '#1F1E1B', color: '#F28C28' }
      : variant === 'sidebar'
        ? { background: '#34322D', color: '#F28C28' }
        : { background: '#ECEAE4', color: '#3F3C36' }

  return (
    <span
      className={cn('inline-flex items-center justify-center rounded-full font-semibold flex-none', dims, className)}
      style={colors}
      aria-hidden="true"
    >
      {getInitials(name)}
    </span>
  )
}
