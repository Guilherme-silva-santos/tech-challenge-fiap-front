import { Search } from 'lucide-react'
import * as React from 'react'
import { cn } from '@/lib/utils'

interface SearchInputProps {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  className?: string
  style?: React.CSSProperties
  id?: string
  label?: string
}

export function SearchInput({ placeholder = 'Buscar…', value, onChange, className, style, id, label }: SearchInputProps) {
  const inputId = id ?? React.useId()
  return (
    <label
      htmlFor={inputId}
      style={style}
      className={cn(
        'flex items-center gap-[10px] min-h-11 px-[14px] border border-(--field-border) rounded-(--radius-btn) bg-(--surface) text-(--muted) transition-[border-color,box-shadow] duration-200 cursor-text',
        'focus-within:border-(--accent) focus-within:shadow-[0_0_0_4px_rgba(194,65,12,.14)]',
        className,
      )}
    >
      <Search size={18} aria-hidden="true" className="shrink-0" />
      {label && <span className="sr-only">{label}</span>}
      <input
        id={inputId}
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="border-0 outline-none flex-1 min-w-0 bg-transparent text-[14px] text-(--ink) placeholder:text-(--sidebar-label)"
      />
    </label>
  )
}
