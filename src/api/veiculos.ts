import api from '@/lib/axios'
import type { Veiculo } from '@/types'

export interface CreateVeiculoDto {
  placa: string
  marca: string
  modelo: string
  ano: string
  cor: string
}

export const veiculosApi = {
  findAll: () => api.get<Veiculo[]>('/veiculos').then((r) => r.data),
  findOne: (id: string) => api.get<Veiculo>(`/veiculos/${id}`).then((r) => r.data),
  create: (dto: CreateVeiculoDto) => api.post<Veiculo>('/veiculos', dto).then((r) => r.data),
  update: (id: string, dto: Partial<CreateVeiculoDto>) =>
    api.patch<Veiculo>(`/veiculos/${id}`, dto).then((r) => r.data),
  remove: (id: string) => api.delete(`/veiculos/${id}`),
}
