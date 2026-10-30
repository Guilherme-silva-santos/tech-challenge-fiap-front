import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface Column<T> {
  key: string
  header: string
  srOnly?: boolean
  render: (row: T) => ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  getRowKey: (row: T) => string | number
  onRowClick?: (row: T) => void
  className?: string
  minWidth?: number
  emptyState?: ReactNode
}

export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  onRowClick,
  className,
  minWidth = 640,
  emptyState,
}: DataTableProps<T>) {
  return (
    <div
      className={cn('bg-(--surface) border border-(--line) rounded-(--radius-card) overflow-hidden', className)}
    >
      <div className="overflow-x-auto">
        <table style={{ minWidth }} className="w-full border-collapse text-[14px]">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn(
                    'text-left font-semibold text-[11px] tracking-[.08em] uppercase text-(--muted) px-5 py-[14px] border-b border-(--line) bg-(--surface-muted)',
                    col.className,
                  )}
                >
                  {col.srOnly ? <span className="sr-only">{col.header}</span> : col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && emptyState ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-10 text-center text-(--muted)">
                  {emptyState}
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr
                  key={getRowKey(row)}
                  onClick={() => onRowClick?.(row)}
                  onKeyDown={(e) => {
                    if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault()
                      onRowClick(row)
                    }
                  }}
                  tabIndex={onRowClick ? 0 : undefined}
                  role={onRowClick ? 'button' : undefined}
                  className={cn(
                    'border-b border-(--line-soft) last:border-b-0 transition-colors duration-150 anim-fade',
                    onRowClick && 'cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-(--accent) focus-visible:outline-offset-[-2px]',
                    'hover:bg-(--surface-muted)',
                    '[&:hover_.row-actions]:opacity-100',
                  )}
                  style={{ animationDelay: `${0.22 + i * 0.08}s` }}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={cn('px-5 py-3 align-middle', col.className)}>
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
