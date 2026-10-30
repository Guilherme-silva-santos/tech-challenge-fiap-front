import * as React from 'react'
import { cn } from '@/lib/utils'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex w-full min-h-[48px] rounded-(--radius-btn) border border-(--field-border) bg-(--surface) px-[14px] text-[15px] text-(--ink) transition-[border-color,box-shadow] duration-200',
        'placeholder:text-(--sidebar-label)',
        'hover:border-[#B9B4A8]',
        'focus-visible:outline-none focus-visible:border-(--accent) focus-visible:shadow-[0_0_0_4px_rgba(194,65,12,.14)]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'file:border-0 file:bg-transparent file:text-sm file:font-medium',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = 'Input'

export { Input }
