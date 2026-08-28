import api from '@/lib/axios'
import type { OrdemServico, Status, TempoMedio } from '@/types'

export interface CreateOSDto {
  mecanicoId: number
  clienteId: string
  veiculoId: string
}

export const ordensServicoApi = {
  findAll: (params?: { status?: Status; clienteId?: string }) =>
    api.get<OrdemServico[]>('/ordens-servico', { params }).then((r) => r.data),

  findOne: (id: string) => api.get<OrdemServico>(`/ordens-servico/${id}`).then((r) => r.data),

  create: (dto: CreateOSDto) =>
    api.post<OrdemServico>('/ordens-servico', dto).then((r) => r.data),

  updateStatus: (id: string, status: Status, usuarioId?: number) =>
    api.patch<OrdemServico>(`/ordens-servico/${id}/status`, { status, usuarioId }).then((r) => r.data),

  aprovarOrcamento: (id: string) =>
    api.post<OrdemServico>(`/ordens-servico/${id}/aprovar-orcamento`).then((r) => r.data),

  remove: (id: string) => api.delete(`/ordens-servico/${id}`),

  addServico: (id: string, servicoId: number, quantidade: number) =>
    api.post<OrdemServico>(`/ordens-servico/${id}/servicos`, { servicoId, quantidade }).then((r) => r.data),

  removeServico: (id: string, servicoId: number) =>
    api.delete<OrdemServico>(`/ordens-servico/${id}/servicos/${servicoId}`).then((r) => r.data),

  addPeca: (id: string, pecaId: number, qtd: number) =>
    api.post<OrdemServico>(`/ordens-servico/${id}/pecas`, { pecaId, qtd }).then((r) => r.data),

  removePeca: (id: string, pecaId: number) =>
    api.delete<OrdemServico>(`/ordens-servico/${id}/pecas/${pecaId}`).then((r) => r.data),

  addInsumo: (id: string, insumoId: number, qtdConsumida: number) =>
    api.post<OrdemServico>(`/ordens-servico/${id}/insumos`, { insumoId, qtdConsumida }).then((r) => r.data),

  removeInsumo: (id: string, insumoId: number) =>
    api.delete<OrdemServico>(`/ordens-servico/${id}/insumos/${insumoId}`).then((r) => r.data),

  getTempoMedio: () =>
    api.get<TempoMedio>('/ordens-servico/metricas/tempo-medio').then((r) => r.data),

  findPublico: (id: string, numDocumento: string) =>
    api.get<OrdemServico>(`/publico/ordens-servico/${id}`, { params: { numDocumento } }).then((r) => r.data),

  solicitarAprovacao: (osId: string) =>
    api.post(`/aprovacao/${osId}/solicitar`),
}
