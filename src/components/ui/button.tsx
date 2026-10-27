import { Slot } from '@radix-ui/react-slot'
import { type VariantProps, cva } from 'class-variance-authority'
import * as React from 'react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all duration-200 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-[--accent] text-white hover:bg-[--accent-hover] hover:-translate-y-px focus-visible:shadow-[0_0_0_4px_rgba(194,65,12,.14)]',
        outline:
          'border border-[--line] bg-[--surface] text-[--ink] hover:bg-[--surface-muted] focus-visible:shadow-[0_0_0_4px_rgba(194,65,12,.14)]',
        ghost:
          'text-[--ink-2] hover:bg-[--surface-muted]',
        destructive:
          'bg-[--danger] text-white hover:opacity-90',
        link:
          'text-[--accent] underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-11 rounded-[--radius-btn] px-[18px] text-[14px]',
        sm:      'h-9 rounded-[--radius-btn] px-3 text-[13px]',
        lg:      'h-12 rounded-[--radius-btn] px-6 text-[15px]',
        icon:    'h-11 w-11 rounded-[--radius-btn]',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
