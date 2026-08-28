import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type CreateInsumoDto, insumosApi } from '@/api/insumos'

export const INSUMOS_KEY = ['insumos'] as const

export function useInsumos() {
  return useQuery({
    queryKey: INSUMOS_KEY,
    queryFn: insumosApi.findAll,
  })
}

export function useCreateInsumo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateInsumoDto) => insumosApi.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: INSUMOS_KEY }),
  })
}

export function useUpdateInsumo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: Partial<CreateInsumoDto> }) =>
      insumosApi.update(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: INSUMOS_KEY }),
  })
}

export function useDeleteInsumo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => insumosApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: INSUMOS_KEY }),
  })
}
