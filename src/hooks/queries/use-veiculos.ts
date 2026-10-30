import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type CreateVeiculoDto, type UpdateVeiculoDto, veiculosApi } from '@/api/veiculos'
import { CLIENTES_KEY } from '@/hooks/queries/use-clientes'

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

// GET /clientes traz os veículos de cada cliente, então ele também precisa ser recarregado
function useInvalidateVeiculos() {
  const qc = useQueryClient()
  return () => Promise.all([
    qc.invalidateQueries({ queryKey: VEICULOS_KEY }),
    qc.invalidateQueries({ queryKey: CLIENTES_KEY }),
  ])
}

export function useCreateVeiculo() {
  const invalidate = useInvalidateVeiculos()
  return useMutation({
    mutationFn: (dto: CreateVeiculoDto) => veiculosApi.create(dto),
    onSuccess: invalidate,
  })
}

export function useUpdateVeiculo() {
  const invalidate = useInvalidateVeiculos()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<UpdateVeiculoDto> }) =>
      veiculosApi.update(id, dto),
    onSuccess: invalidate,
  })
}

export function useDeleteVeiculo() {
  const invalidate = useInvalidateVeiculos()
  return useMutation({
    mutationFn: (id: string) => veiculosApi.remove(id),
    onSuccess: invalidate,
  })
}
