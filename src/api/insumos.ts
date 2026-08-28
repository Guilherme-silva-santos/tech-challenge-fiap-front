import api from '@/lib/axios';
import type { Insumo } from '@/types';

export interface CreateInsumoDto {
  nome: string;
  qtdEstoque: number;
  valorUn: number;
}

export const insumosApi = {
  findAll: () => api.get<Insumo[]>('/insumos').then((r) => r.data),
  findOne: (id: number) =>
    api.get<Insumo>(`/insumos/${id}`).then((r) => r.data),
  create: (dto: CreateInsumoDto) =>
    api.post<Insumo>('/insumos', dto).then((r) => r.data),
  update: (id: number, dto: Partial<CreateInsumoDto>) =>
    api.patch<Insumo>(`/insumos/${id}`, dto).then((r) => r.data),
  remove: (id: number) => api.delete(`/insumos/${id}`),
};
