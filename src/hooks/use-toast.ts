import { useState } from 'react'

interface ToastState {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'destructive' | 'success'
  open: boolean
}

let listeners: Array<(toasts: ToastState[]) => void> = []
let toasts: ToastState[] = []

function dispatch(newToasts: ToastState[]) {
  toasts = newToasts
  listeners.forEach((l) => l(toasts))
}

export function toast({
  title,
  description,
  variant = 'default',
}: {
  title: string
  description?: string
  variant?: 'default' | 'destructive' | 'success'
}) {
  const id = Math.random().toString(36).slice(2)
  dispatch([...toasts, { id, title, description, variant, open: true }])
  setTimeout(() => {
    dispatch(toasts.map((t) => (t.id === id ? { ...t, open: false } : t)))
    setTimeout(() => {
      dispatch(toasts.filter((t) => t.id !== id))
    }, 300)
  }, 3500)
}

export function useToast() {
  const [state, setState] = useState<ToastState[]>(toasts)
  useState(() => {
    listeners.push(setState)
    return () => {
      listeners = listeners.filter((l) => l !== setState)
    }
  })
  return { toasts: state }
}
