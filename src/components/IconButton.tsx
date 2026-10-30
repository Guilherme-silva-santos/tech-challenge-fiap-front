import * as React from 'react'
import { cn } from '@/lib/utils'

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'danger'
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          'inline-flex items-center justify-center w-11 h-11 rounded-(--radius-btn) border border-transparent bg-transparent text-(--muted) transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--accent) focus-visible:ring-offset-1',
          variant === 'default' && 'hover:bg-(--bg) hover:border-(--line) hover:text-(--ink)',
          variant === 'danger'  && 'hover:bg-(--danger-bg) hover:border-[#F5C6C0] hover:text-(--danger)',
          className,
        )}
        {...props}
      />
    )
  },
)
IconButton.displayName = 'IconButton'
