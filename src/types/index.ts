export type Roles = 'admin' | 'funcionario' | 'mecanico'
export type Tipo = 'pessoa_fisica' | 'pessoa_juridica'
export type Status =
  | 'recebida'
  | 'em_diagnostico'
  | 'aguardando_aprovacao'
  | 'em_execucao'
  | 'finalizada'
  | 'entregue'
  | 'rejeitada'

export interface Usuario {
  idUsuario: number
  nome: string
  email: string
  roles: Roles
  criadoEm: string
  atualizadoEm: string
}

export interface Cliente {
  clienteId: string
  numDocumento: string
  nome: string
  email: string | null
  telefone: string
  tipo: Tipo
  criadoEm: string
  atualizadoEm: string
}

export interface Veiculo {
  veiculoId: string
  placa: string
  marca: string
  modelo: string
  ano: string
  cor: string
  criadoEm: string
  atualizadoEm: string
}

export interface Insumo {
  insumoId: number
  nome: string
  qtdEstoque: number
  valorUn: string
  criadoEm: string
  atualizadoEm: string
}

export interface Peca {
  pecaId: number
  nome: string
  qtdEstoque: number
  valorUn: string
  criadoEm: string
  atualizadoEm: string
}

export interface Servico {
  servicoId: number
  descricao: string
  valor: string
  criadoEm: string
  atualizadoEm: string
}

export interface HistoricoStatus {
  id: number
  osId: string
  statusAnterior: Status | null
  statusNovo: Status
  usuarioId: number | null
  criadoEm: string
}

export interface InsumoConsumido {
  insumoId: number
  nome: string
  qtdConsumida: number
  valor: string
}

export interface PecaUtilizada {
  pecaId: number
  nome: string
  qtd: number
  valor: string
}

export interface ServicoRealizado {
  servicoId: number
  descricao: string
  quantidade: number
  valor: string
}

export interface OrdemServico {
  osId: string
  status: Status
  valorFinal: string
  criadoEm: string
  atualizadoEm: string
  mecanico: { idUsuario: number; nome: string }
  cliente: { clienteId: string; nome: string; numDocumento: string }
  veiculo: { veiculoId: string; placa: string; marca: string; modelo: string }
  insumosConsumidos: InsumoConsumido[]
  pecasUtilizadas: PecaUtilizada[]
  servicosRealizados: ServicoRealizado[]
  historicoStatus: HistoricoStatus[]
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

export interface TempoMedio {
  tempoMedioMs: number
  tempoMedioMinutos: number
  tempoMedioHoras: number
}
