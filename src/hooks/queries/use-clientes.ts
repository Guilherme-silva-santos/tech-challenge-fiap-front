import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type CreateClienteDto, clientesApi } from '@/api/clientes'

export const CLIENTES_KEY = ['clientes'] as const

export function useClientes() {
  return useQuery({
    queryKey: CLIENTES_KEY,
    queryFn: clientesApi.findAll,
  })
}

export function useCliente(id: string) {
  return useQuery({
    queryKey: [...CLIENTES_KEY, id],
    queryFn: () => clientesApi.findOne(id),
    enabled: !!id,
  })
}

export function useCreateCliente() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateClienteDto) => clientesApi.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: CLIENTES_KEY }),
  })
}

export function useUpdateCliente() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<CreateClienteDto> }) =>
      clientesApi.update(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: CLIENTES_KEY }),
  })
}

export function useDeleteCliente() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => clientesApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: CLIENTES_KEY }),
  })
}
