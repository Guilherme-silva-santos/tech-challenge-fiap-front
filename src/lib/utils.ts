import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Status } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: string | number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    Number(value),
  )
}

export function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr))
}

export const STATUS_LABEL: Record<Status, string> = {
  recebida: 'Recebida',
  em_diagnostico: 'Em Diagnóstico',
  aguardando_aprovacao: 'Aguardando Aprovação',
  em_execucao: 'Em Execução',
  finalizada: 'Finalizada',
  entregue: 'Entregue',
  rejeitada: 'Rejeitada',
}

export const STATUS_COLOR: Record<Status, string> = {
  recebida: 'bg-slate-100 text-slate-700',
  em_diagnostico: 'bg-blue-100 text-blue-700',
  aguardando_aprovacao: 'bg-yellow-100 text-yellow-700',
  em_execucao: 'bg-orange-100 text-orange-700',
  finalizada: 'bg-green-100 text-green-700',
  entregue: 'bg-emerald-100 text-emerald-700',
  rejeitada: 'bg-red-100 text-red-700',
}

export const STATUS_ORDER: Status[] = [
  'recebida',
  'em_diagnostico',
  'aguardando_aprovacao',
  'em_execucao',
  'finalizada',
  'entregue',
]

export const ROLES_LABEL: Record<string, string> = {
  admin: 'Administrador',
  funcionario: 'Funcionário',
  mecanico: 'Mecânico',
}
