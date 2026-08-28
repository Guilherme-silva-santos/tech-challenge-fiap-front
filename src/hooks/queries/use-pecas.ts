import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type CreatePecaDto, pecasApi } from '@/api/pecas'

export const PECAS_KEY = ['pecas'] as const

export function usePecas() {
  return useQuery({
    queryKey: PECAS_KEY,
    queryFn: pecasApi.findAll,
  })
}

export function useCreatePeca() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreatePecaDto) => pecasApi.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: PECAS_KEY }),
  })
}

export function useUpdatePeca() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: Partial<CreatePecaDto> }) =>
      pecasApi.update(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: PECAS_KEY }),
  })
}

export function useDeletePeca() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => pecasApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: PECAS_KEY }),
  })
}
