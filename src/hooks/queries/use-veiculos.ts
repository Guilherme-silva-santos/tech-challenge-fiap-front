import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type CreateVeiculoDto, veiculosApi } from '@/api/veiculos'

export const VEICULOS_KEY = ['veiculos'] as const

export function useVeiculos() {
  return useQuery({
    queryKey: VEICULOS_KEY,
    queryFn: veiculosApi.findAll,
  })
}

export function useVeiculo(id: string) {
  return useQuery({
    queryKey: [...VEICULOS_KEY, id],
    queryFn: () => veiculosApi.findOne(id),
    enabled: !!id,
  })
}

export function useCreateVeiculo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateVeiculoDto) => veiculosApi.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: VEICULOS_KEY }),
  })
}

export function useUpdateVeiculo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<CreateVeiculoDto> }) =>
      veiculosApi.update(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: VEICULOS_KEY }),
  })
}

export function useDeleteVeiculo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => veiculosApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: VEICULOS_KEY }),
  })
}
