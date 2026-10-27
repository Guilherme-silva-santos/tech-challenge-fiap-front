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
  recebida:             'border-transparent !bg-[#ECEAE4] !text-[#3F3C36]',
  em_diagnostico:       'border-transparent !bg-[#E3ECF8] !text-[#1E4E8C]',
  aguardando_aprovacao: 'border-transparent !bg-[#FCEFC7] !text-[#7A4A00]',
  em_execucao:          'border-transparent !bg-[#FBE4D2] !text-[#9A3412]',
  finalizada:           'border-transparent !bg-[#DDF0E3] !text-[#1C5E33]',
  entregue:             'border-transparent !bg-[#1F1E1B] !text-white',
  rejeitada:            'border-transparent !bg-[#FDECEA] !text-[#B42318]',
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
