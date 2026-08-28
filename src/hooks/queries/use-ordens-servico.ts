import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type CreateOSDto, ordensServicoApi } from '@/api/ordens-servico'
import type { Status } from '@/types'

export const OS_KEY = ['ordens-servico'] as const
export const osKey = (id: string) => ['os', id] as const

export function useOrdensServico(params?: { status?: Status; clienteId?: string }) {
  return useQuery({
    queryKey: [...OS_KEY, params],
    queryFn: () => ordensServicoApi.findAll(params),
  })
}

export function useOrdemServico(id: string) {
  return useQuery({
    queryKey: osKey(id),
    queryFn: () => ordensServicoApi.findOne(id),
    enabled: !!id,
  })
}

export function useTempoMedio() {
  return useQuery({
    queryKey: ['tempo-medio'],
    queryFn: ordensServicoApi.getTempoMedio,
  })
}

export function useOrdemServicoPublica() {
  return useMutation({
    mutationFn: ({ id, numDocumento }: { id: string; numDocumento: string }) =>
      ordensServicoApi.findPublico(id, numDocumento),
  })
}

export function useCreateOrdemServico() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateOSDto) => ordensServicoApi.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: OS_KEY }),
  })
}

export function useUpdateStatusOS(osId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (status: Status) => ordensServicoApi.updateStatus(osId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: osKey(osId) }),
  })
}

export function useAprovarOrcamento(osId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => ordensServicoApi.aprovarOrcamento(osId),
    onSuccess: () => qc.invalidateQueries({ queryKey: osKey(osId) }),
  })
}

export function useSolicitarAprovacao(osId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => ordensServicoApi.solicitarAprovacao(osId),
    onSuccess: () => qc.invalidateQueries({ queryKey: osKey(osId) }),
  })
}

export function useDeleteOS() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => ordensServicoApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: OS_KEY }),
  })
}

export function useAddServico(osId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ servicoId, quantidade }: { servicoId: number; quantidade: number }) =>
      ordensServicoApi.addServico(osId, servicoId, quantidade),
    onSuccess: () => qc.invalidateQueries({ queryKey: osKey(osId) }),
  })
}

export function useRemoveServico(osId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (servicoId: number) => ordensServicoApi.removeServico(osId, servicoId),
    onSuccess: () => qc.invalidateQueries({ queryKey: osKey(osId) }),
  })
}

export function useAddPeca(osId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ pecaId, qtd }: { pecaId: number; qtd: number }) =>
      ordensServicoApi.addPeca(osId, pecaId, qtd),
    onSuccess: () => qc.invalidateQueries({ queryKey: osKey(osId) }),
  })
}

export function useRemovePeca(osId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (pecaId: number) => ordensServicoApi.removePeca(osId, pecaId),
    onSuccess: () => qc.invalidateQueries({ queryKey: osKey(osId) }),
  })
}

export function useAddInsumo(osId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ insumoId, qtdConsumida }: { insumoId: number; qtdConsumida: number }) =>
      ordensServicoApi.addInsumo(osId, insumoId, qtdConsumida),
    onSuccess: () => qc.invalidateQueries({ queryKey: osKey(osId) }),
  })
}

export function useRemoveInsumo(osId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (insumoId: number) => ordensServicoApi.removeInsumo(osId, insumoId),
    onSuccess: () => qc.invalidateQueries({ queryKey: osKey(osId) }),
  })
}
