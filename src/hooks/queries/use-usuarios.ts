import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type CreateUsuarioDto, usuariosApi } from '@/api/usuarios'

export const USUARIOS_KEY = ['usuarios'] as const

export function useUsuarios() {
  return useQuery({
    queryKey: USUARIOS_KEY,
    queryFn: usuariosApi.findAll,
  })
}

export function useUsuario(id: number) {
  return useQuery({
    queryKey: [...USUARIOS_KEY, id],
    queryFn: () => usuariosApi.findOne(id),
    enabled: !!id,
  })
}

export function useCreateUsuario() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateUsuarioDto) => usuariosApi.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: USUARIOS_KEY }),
  })
}

export function useUpdateUsuario() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: Partial<CreateUsuarioDto> }) =>
      usuariosApi.update(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: USUARIOS_KEY }),
  })
}

export function useDeleteUsuario() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => usuariosApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: USUARIOS_KEY }),
  })
}
