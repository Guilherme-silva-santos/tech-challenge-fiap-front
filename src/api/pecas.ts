import api from '@/lib/axios'
import type { Peca } from '@/types'

export interface CreatePecaDto {
  nome: string
  qtdEstoque: number
  valorUn: number
}

export const pecasApi = {
  findAll: () => api.get<Peca[]>('/pecas').then((r) => r.data),
  findOne: (id: number) => api.get<Peca>(`/pecas/${id}`).then((r) => r.data),
  create: (dto: CreatePecaDto) => api.post<Peca>('/pecas', dto).then((r) => r.data),
  update: (id: number, dto: Partial<CreatePecaDto>) =>
    api.patch<Peca>(`/pecas/${id}`, dto).then((r) => r.data),
  remove: (id: number) => api.delete(`/pecas/${id}`),
}
