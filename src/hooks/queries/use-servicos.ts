import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type CreateServicoDto, servicosApi } from '@/api/servicos'

export const SERVICOS_KEY = ['servicos'] as const

export function useServicos() {
  return useQuery({
    queryKey: SERVICOS_KEY,
    queryFn: servicosApi.findAll,
  })
}

export function useCreateServico() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateServicoDto) => servicosApi.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: SERVICOS_KEY }),
  })
}

export function useUpdateServico() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: Partial<CreateServicoDto> }) =>
      servicosApi.update(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: SERVICOS_KEY }),
  })
}

export function useDeleteServico() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => servicosApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: SERVICOS_KEY }),
  })
}
