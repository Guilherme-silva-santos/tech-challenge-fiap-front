import api from '@/lib/axios';
import type { Cliente, Tipo } from '@/types';

export interface CreateClienteDto {
  numDocumento: string;
  nome: string;
  email?: string;
  telefone: string;
  tipo: Tipo;
}

export const clientesApi = {
  findAll: () => api.get<Cliente[]>('/clientes').then((r) => r.data),
  findOne: (id: string) =>
    api.get<Cliente>(`/clientes/${id}`).then((r) => r.data),
  create: (dto: CreateClienteDto) =>
    api.post<Cliente>('/clientes', dto).then((r) => r.data),
  update: (id: string, dto: Partial<CreateClienteDto>) =>
    api.patch<Cliente>(`/clientes/${id}`, dto).then((r) => r.data),
  remove: (id: string) => api.delete(`/clientes/${id}`),
};
