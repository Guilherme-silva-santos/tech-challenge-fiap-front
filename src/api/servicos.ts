import api from '@/lib/axios'
import type { Servico } from '@/types'

export interface CreateServicoDto {
  descricao: string
  valor: number
}

export const servicosApi = {
  findAll: () => api.get<Servico[]>('/servico').then((r) => r.data),
  findOne: (id: number) => api.get<Servico>(`/servico/${id}`).then((r) => r.data),
  create: (dto: CreateServicoDto) => api.post<Servico>('/servico', dto).then((r) => r.data),
  update: (id: number, dto: Partial<CreateServicoDto>) =>
    api.patch<Servico>(`/servico/${id}`, dto).then((r) => r.data),
  remove: (id: number) => api.delete(`/servico/${id}`),
}
