import api from '@/lib/axios'
import type { Usuario } from '@/types'

export interface CreateUsuarioDto {
  nome: string
  email: string
  senha: string
  roles: string
}

export const usuariosApi = {
  findAll: () => api.get<Usuario[]>('/usuarios').then((r) => r.data),
  findOne: (id: number) => api.get<Usuario>(`/usuarios/${id}`).then((r) => r.data),
  create: (dto: CreateUsuarioDto) => api.post<Usuario>('/usuarios', dto).then((r) => r.data),
  update: (id: number, dto: Partial<CreateUsuarioDto>) =>
    api.patch<Usuario>(`/usuarios/${id}`, dto).then((r) => r.data),
  remove: (id: number) => api.delete(`/usuarios/${id}`),
}
