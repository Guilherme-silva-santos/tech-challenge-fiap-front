import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Clock,
  Mail,
  Package,
  Plus,
  Trash2,
  Wrench,
  Zap,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useInsumos } from '@/hooks/queries/use-insumos'
import { useAddInsumo, useAddPeca, useAddServico, useAprovarOrcamento, useOrdemServico, useRemoveInsumo, useRemovePeca, useRemoveServico, useSolicitarAprovacao, useUpdateStatusOS } from '@/hooks/queries/use-ordens-servico'
import { usePecas } from '@/hooks/queries/use-pecas'
import { useServicos } from '@/hooks/queries/use-servicos'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/hooks/use-toast'
import { cn, formatCurrency, formatDate, STATUS_COLOR, STATUS_LABEL, STATUS_ORDER } from '@/lib/utils'
import type { Status } from '@/types'

function StatusTimeline({ current }: { current: Status }) {
  const currentIdx = STATUS_ORDER.indexOf(current)
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {STATUS_ORDER.map((s, i) => {
        const done = i <= currentIdx
        const active = s === current
        return (
          <div key={s} className="flex items-center gap-1">
            <div className={cn(
              'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all',
              active ? 'bg-blue-600 text-white shadow-md' : done ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400',
            )}>
              {done && !active && <CheckCircle2 className="h-3 w-3" />}
              {STATUS_LABEL[s]}
            </div>
            {i < STATUS_ORDER.length - 1 && (
              <ChevronRight className={cn('h-3 w-3', i < currentIdx ? 'text-green-400' : 'text-slate-300')} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function AddServicoDialog({ osId, onClose }: { osId: string; onClose: () => void }) {
  const [servicoId, setServicoId] = useState('')
  const [quantidade, setQuantidade] = useState(1)
  const { data: servicos = [] } = useServicos()
  const mutation = useAddServico(osId)

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Adicionar Serviço</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Serviço</Label>
            <Select onValueChange={setServicoId}>
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                {servicos.map((s) => (
                  <SelectItem key={s.servicoId} value={String(s.servicoId)}>{s.descricao} — {formatCurrency(s.valor)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Quantidade</Label>
            <Input type="number" min={1} value={quantidade} onChange={(e) => setQuantidade(Number(e.target.value))} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button
            disabled={!servicoId || mutation.isPending}
            onClick={() => mutation.mutate({ servicoId: Number(servicoId), quantidade }, {
              onSuccess: () => { toast({ title: 'Serviço adicionado', variant: 'success' }); onClose() },
              onError: () => toast({ title: 'Erro ao adicionar serviço', variant: 'destructive' }),
            })}
          >
            {mutation.isPending ? 'Adicionando...' : 'Adicionar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function AddPecaDialog({ osId, onClose }: { osId: string; onClose: () => void }) {
  const [pecaId, setPecaId] = useState('')
  const [qtd, setQtd] = useState(1)
  const { data: pecas = [] } = usePecas()
  const mutation = useAddPeca(osId)

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Adicionar Peça</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Peça</Label>
            <Select onValueChange={setPecaId}>
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                {pecas.map((p) => (
                  <SelectItem key={p.pecaId} value={String(p.pecaId)}>{p.nome} — {formatCurrency(p.valorUn)} (estoque: {p.qtdEstoque})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Quantidade</Label>
            <Input type="number" min={1} value={qtd} onChange={(e) => setQtd(Number(e.target.value))} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button
            disabled={!pecaId || mutation.isPending}
            onClick={() => mutation.mutate({ pecaId: Number(pecaId), qtd }, {
              onSuccess: () => { toast({ title: 'Peça adicionada', variant: 'success' }); onClose() },
              onError: () => toast({ title: 'Erro ao adicionar peça', variant: 'destructive' }),
            })}
          >
            {mutation.isPending ? 'Adicionando...' : 'Adicionar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function AddInsumoDialog({ osId, onClose }: { osId: string; onClose: () => void }) {
  const [insumoId, setInsumoId] = useState('')
  const [qtdConsumida, setQtdConsumida] = useState(1)
  const { data: insumos = [] } = useInsumos()
  const mutation = useAddInsumo(osId)

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Adicionar Insumo</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Insumo</Label>
            <Select onValueChange={setInsumoId}>
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                {insumos.map((i) => (
                  <SelectItem key={i.insumoId} value={String(i.insumoId)}>{i.nome} — {formatCurrency(i.valorUn)} (estoque: {i.qtdEstoque})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Quantidade consumida</Label>
            <Input type="number" min={1} value={qtdConsumida} onChange={(e) => setQtdConsumida(Number(e.target.value))} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button
            disabled={!insumoId || mutation.isPending}
            onClick={() => mutation.mutate({ insumoId: Number(insumoId), qtdConsumida }, {
              onSuccess: () => { toast({ title: 'Insumo adicionado', variant: 'success' }); onClose() },
              onError: () => toast({ title: 'Erro ao adicionar insumo', variant: 'destructive' }),
            })}
          >
            {mutation.isPending ? 'Adicionando...' : 'Adicionar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type AddDialog = 'servico' | 'peca' | 'insumo' | null

export function OrdemServicoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [addDialog, setAddDialog] = useState<AddDialog>(null)

  const { data: os, isLoading } = useOrdemServico(id!)
  const statusMutation = useUpdateStatusOS(id!)
  const aprovarMutation = useAprovarOrcamento(id!)
  const solicitarAprovacaoMutation = useSolicitarAprovacao(id!)
  const removeServicoMutation = useRemoveServico(id!)
  const removePecaMutation = useRemovePeca(id!)
  const removeInsumoMutation = useRemoveInsumo(id!)

  if (isLoading) return <div className="p-8 text-slate-500">Carregando...</div>
  if (!os) return <div className="p-8 text-slate-500">OS não encontrada.</div>

  const currentIdx = STATUS_ORDER.indexOf(os.status)
  const nextStatus = STATUS_ORDER[currentIdx + 1] as Status | undefined
  const canAprovar = os.status === 'aguardando_aprovacao'
  const canSolicitarAprovacao = os.status === 'em_diagnostico'

  return (
    <div className="p-8 max-w-5xl">
      {/* Voltar */}
      <Link to="/ordens-servico" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 mb-6">
        <ArrowLeft className="h-4 w-4" /> Voltar às OS
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-900">Ordem de Serviço</h1>
            <Badge className={STATUS_COLOR[os.status]}>{STATUS_LABEL[os.status]}</Badge>
          </div>
          <p className="text-xs text-slate-400 font-mono">{os.osId}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">Valor Final</p>
          <p className="text-3xl font-bold text-slate-900">{formatCurrency(os.valorFinal)}</p>
        </div>
      </div>

      {/* Timeline de status */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <StatusTimeline current={os.status} />
          <div className="flex gap-2 mt-4">
            {canAprovar && (
              <Button
                onClick={() => aprovarMutation.mutate(undefined, {
                  onSuccess: () => toast({ title: 'Orçamento aprovado', variant: 'success' }),
                  onError: () => toast({ title: 'Erro ao aprovar orçamento', variant: 'destructive' }),
                })}
                disabled={aprovarMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="h-4 w-4" /> Aprovar Orçamento
              </Button>
            )}
            {canSolicitarAprovacao && (
              <Button
                onClick={() => solicitarAprovacaoMutation.mutate(undefined, {
                  onSuccess: () => toast({ title: 'E-mail enviado ao cliente', description: 'Status alterado para Aguardando Aprovação.', variant: 'success' }),
                  onError: (err: unknown) => {
                    const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
                    toast({ title: 'Erro ao solicitar aprovação', description: msg ?? 'Verifique se o cliente possui e-mail cadastrado.', variant: 'destructive' })
                  },
                })}
                disabled={solicitarAprovacaoMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Mail className="h-4 w-4" /> {solicitarAprovacaoMutation.isPending ? 'Enviando...' : 'Solicitar Aprovação do Cliente'}
              </Button>
            )}
            {nextStatus && !canAprovar && !canSolicitarAprovacao && (
              <Button
                variant="outline"
                onClick={() => statusMutation.mutate(nextStatus, {
                  onSuccess: () => toast({ title: 'Status atualizado', variant: 'success' }),
                  onError: () => toast({ title: 'Erro ao atualizar status', variant: 'destructive' }),
                })}
                disabled={statusMutation.isPending}
              >
                Avançar para: {STATUS_LABEL[nextStatus]}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Informações */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">Cliente</CardTitle></CardHeader>
          <CardContent>
            <p className="font-semibold text-slate-900">{os.cliente.nome}</p>
            <p className="text-xs text-slate-500 font-mono">{os.cliente.numDocumento}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">Veículo</CardTitle></CardHeader>
          <CardContent>
            <p className="font-mono font-bold text-slate-900">{os.veiculo.placa}</p>
            <p className="text-xs text-slate-500">{os.veiculo.marca} {os.veiculo.modelo}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">Mecânico</CardTitle></CardHeader>
          <CardContent>
            <p className="font-semibold text-slate-900">{os.mecanico.nome}</p>
            <p className="text-xs text-slate-500">Criado em {formatDate(os.criadoEm)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de itens */}
      <Tabs defaultValue="servicos">
        <TabsList>
          <TabsTrigger value="servicos"><Wrench className="h-3.5 w-3.5 mr-1" />Serviços ({os.servicosRealizados.length})</TabsTrigger>
          <TabsTrigger value="pecas"><Package className="h-3.5 w-3.5 mr-1" />Peças ({os.pecasUtilizadas.length})</TabsTrigger>
          <TabsTrigger value="insumos"><Zap className="h-3.5 w-3.5 mr-1" />Insumos ({os.insumosConsumidos.length})</TabsTrigger>
          <TabsTrigger value="historico"><Clock className="h-3.5 w-3.5 mr-1" />Histórico</TabsTrigger>
        </TabsList>

        {/* Serviços */}
        <TabsContent value="servicos">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base">Serviços realizados</CardTitle>
              <Button size="sm" onClick={() => setAddDialog('servico')}><Plus className="h-4 w-4" /> Adicionar</Button>
            </CardHeader>
            <CardContent className="p-0">
              {os.servicosRealizados.length === 0 ? (
                <p className="text-sm text-slate-400 px-6 pb-4">Nenhum serviço adicionado.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="text-left px-6 py-2 font-medium text-slate-500">Descrição</th>
                      <th className="text-left px-4 py-2 font-medium text-slate-500">Qtd</th>
                      <th className="text-left px-4 py-2 font-medium text-slate-500">Valor</th>
                      <th className="px-4 py-2" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {os.servicosRealizados.map((s) => (
                      <tr key={s.servicoId} className="hover:bg-slate-50">
                        <td className="px-6 py-3">{s.descricao}</td>
                        <td className="px-4 py-3">{s.quantidade}</td>
                        <td className="px-4 py-3 font-semibold">{formatCurrency(s.valor)}</td>
                        <td className="px-4 py-3">
                          <ConfirmDialog
                            trigger={<Button size="icon" variant="ghost" className="text-red-500"><Trash2 className="h-4 w-4" /></Button>}
                            description={`Remover "${s.descricao}" da OS?`}
                            onConfirm={() => removeServicoMutation.mutate(s.servicoId)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Peças */}
        <TabsContent value="pecas">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base">Peças utilizadas</CardTitle>
              <Button size="sm" onClick={() => setAddDialog('peca')}><Plus className="h-4 w-4" /> Adicionar</Button>
            </CardHeader>
            <CardContent className="p-0">
              {os.pecasUtilizadas.length === 0 ? (
                <p className="text-sm text-slate-400 px-6 pb-4">Nenhuma peça adicionada.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="text-left px-6 py-2 font-medium text-slate-500">Peça</th>
                      <th className="text-left px-4 py-2 font-medium text-slate-500">Qtd</th>
                      <th className="text-left px-4 py-2 font-medium text-slate-500">Valor</th>
                      <th className="px-4 py-2" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {os.pecasUtilizadas.map((p) => (
                      <tr key={p.pecaId} className="hover:bg-slate-50">
                        <td className="px-6 py-3">{p.nome}</td>
                        <td className="px-4 py-3">{p.qtd}</td>
                        <td className="px-4 py-3 font-semibold">{formatCurrency(p.valor)}</td>
                        <td className="px-4 py-3">
                          <ConfirmDialog
                            trigger={<Button size="icon" variant="ghost" className="text-red-500"><Trash2 className="h-4 w-4" /></Button>}
                            description={`Remover "${p.nome}" da OS?`}
                            onConfirm={() => removePecaMutation.mutate(p.pecaId)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insumos */}
        <TabsContent value="insumos">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base">Insumos consumidos</CardTitle>
              <Button size="sm" onClick={() => setAddDialog('insumo')}><Plus className="h-4 w-4" /> Adicionar</Button>
            </CardHeader>
            <CardContent className="p-0">
              {os.insumosConsumidos.length === 0 ? (
                <p className="text-sm text-slate-400 px-6 pb-4">Nenhum insumo adicionado.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="text-left px-6 py-2 font-medium text-slate-500">Insumo</th>
                      <th className="text-left px-4 py-2 font-medium text-slate-500">Qtd</th>
                      <th className="text-left px-4 py-2 font-medium text-slate-500">Valor</th>
                      <th className="px-4 py-2" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {os.insumosConsumidos.map((i) => (
                      <tr key={i.insumoId} className="hover:bg-slate-50">
                        <td className="px-6 py-3">{i.nome}</td>
                        <td className="px-4 py-3">{i.qtdConsumida}</td>
                        <td className="px-4 py-3 font-semibold">{formatCurrency(i.valor)}</td>
                        <td className="px-4 py-3">
                          <ConfirmDialog
                            trigger={<Button size="icon" variant="ghost" className="text-red-500"><Trash2 className="h-4 w-4" /></Button>}
                            description={`Remover "${i.nome}" da OS?`}
                            onConfirm={() => removeInsumoMutation.mutate(i.insumoId)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Histórico */}
        <TabsContent value="historico">
          <Card>
            <CardHeader><CardTitle className="text-base">Histórico de Status</CardTitle></CardHeader>
            <CardContent>
              {(os.historicoStatus ?? []).length === 0 ? (
                <p className="text-sm text-slate-400">Sem histórico.</p>
              ) : (
                <div className="space-y-3">
                  {(os.historicoStatus ?? []).map((h) => (
                    <div key={h.id} className="flex items-center gap-3 text-sm">
                      <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                      <div className="flex-1">
                        {h.statusAnterior ? (
                          <span>
                            <Badge className={STATUS_COLOR[h.statusAnterior]}>{STATUS_LABEL[h.statusAnterior]}</Badge>
                            {' '}<span className="text-slate-400">→</span>{' '}
                            <Badge className={STATUS_COLOR[h.statusNovo]}>{STATUS_LABEL[h.statusNovo]}</Badge>
                          </span>
                        ) : (
                          <span>OS criada com status <Badge className={STATUS_COLOR[h.statusNovo]}>{STATUS_LABEL[h.statusNovo]}</Badge></span>
                        )}
                      </div>
                      <span className="text-slate-400 text-xs">{formatDate(h.criadoEm)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add dialogs */}
      {addDialog === 'servico' && <AddServicoDialog osId={os.osId} onClose={() => setAddDialog(null)} />}
      {addDialog === 'peca' && <AddPecaDialog osId={os.osId} onClose={() => setAddDialog(null)} />}
      {addDialog === 'insumo' && <AddInsumoDialog osId={os.osId} onClose={() => setAddDialog(null)} />}
    </div>
  )
}
