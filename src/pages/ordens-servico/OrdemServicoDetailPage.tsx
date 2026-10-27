import { ArrowLeft, Check, Mail, Package, Plus, Trash2, Wrench, Zap, Clock } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { IconButton } from '@/components/IconButton'
import { StatusPill } from '@/components/StatusPill'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useInsumos } from '@/hooks/queries/use-insumos'
import { useAddInsumo, useAddPeca, useAddServico, useAprovarOrcamento, useOrdemServico, useRemoveInsumo, useRemovePeca, useRemoveServico, useSolicitarAprovacao, useUpdateStatusOS } from '@/hooks/queries/use-ordens-servico'
import { usePecas } from '@/hooks/queries/use-pecas'
import { useServicos } from '@/hooks/queries/use-servicos'
import { toast } from '@/hooks/use-toast'
import { formatCurrency, formatDate, STATUS_LABEL, STATUS_ORDER } from '@/lib/utils'
import type { Status } from '@/types'

const PROXIMO_PASSO: Record<Status, { msg: string; btn?: string } | null> = {
  recebida:             { msg: 'Inicie o diagnóstico do veículo.', btn: 'Iniciar diagnóstico' },
  em_diagnostico:       { msg: 'Adicione serviços, peças e insumos do diagnóstico e envie o orçamento ao cliente.', btn: 'Solicitar aprovação do cliente' },
  aguardando_aprovacao: { msg: 'Aguardando aprovação do cliente. Quando ele aceitar, registre aqui.', btn: 'Aprovar orçamento' },
  em_execucao:          { msg: 'Execute os serviços aprovados e finalize quando concluir.', btn: 'Finalizar OS' },
  finalizada:           { msg: 'Serviço concluído. Registre a entrega ao cliente.', btn: 'Marcar como entregue' },
  entregue:             null,
  rejeitada:            null,
}

function Stepper({ current }: { current: Status }) {
  const currentIdx = STATUS_ORDER.indexOf(current)
  const steps = STATUS_ORDER.slice(0, 6)
  return (
    <div style={{ overflowX: 'auto', padding: '6px 4px 2px' }}>
      <ol style={{ display: 'grid', gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))`, gap: 0, listStyle: 'none', margin: 0, padding: 0, minWidth: 640 }}>
        {steps.map((s, i) => {
          const done = i < currentIdx
          const cur  = i === currentIdx
          const isLast = i === steps.length - 1
          return (
            <li key={s} style={{ display: 'flex', flexDirection: 'column', gap: 10, position: 'relative' }}>
              {!isLast && (
                <span style={{ position: 'absolute', top: 14, left: 30, right: 0, height: 2, background: 'var(--line)' }}>
                  {done && <i style={{ display: 'block', height: '100%', background: 'var(--accent)', transformOrigin: 'left', animation: `grow .8s ${0.3 + i * 0.1}s cubic-bezier(.2,.7,.2,1) both` }} />}
                </span>
              )}
              <span style={{
                width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, position: 'relative', zIndex: 1,
                border: `1.5px solid ${done ? 'var(--sidebar)' : cur ? 'var(--accent)' : 'var(--field-border)'}`,
                background: done ? 'var(--sidebar)' : cur ? 'var(--accent)' : 'var(--surface)',
                color: done ? 'var(--accent-bright)' : cur ? '#fff' : 'var(--muted)',
                animation: cur ? 'ring 1.8s infinite' : undefined,
              }}>
                {done ? <Check size={14} strokeWidth={3} aria-hidden="true" /> : String(i + 1).padStart(2, '0')}
              </span>
              <span style={{ fontSize: 13, color: (done || cur) ? 'var(--ink)' : 'var(--muted)', fontWeight: cur ? 600 : undefined, paddingRight: 12 }}>
                {STATUS_LABEL[s]}
              </span>
            </li>
          )
        })}
      </ol>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Label>Serviço</Label>
            <Select onValueChange={setServicoId}>
              <SelectTrigger><SelectValue placeholder="Selecione…" /></SelectTrigger>
              <SelectContent>{servicos.map((s) => <SelectItem key={s.servicoId} value={String(s.servicoId)}>{s.descricao} — {formatCurrency(s.valor)}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Label>Quantidade</Label>
            <Input type="number" min={1} value={quantidade} onChange={(e) => setQuantidade(Number(e.target.value))} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button disabled={!servicoId || mutation.isPending} onClick={() => mutation.mutate({ servicoId: Number(servicoId), quantidade }, { onSuccess: () => { toast({ title: 'Serviço adicionado', variant: 'success' }); onClose() }, onError: () => toast({ title: 'Erro ao adicionar serviço', variant: 'destructive' }) })}>
            {mutation.isPending ? 'Adicionando…' : 'Adicionar'}
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Label>Peça</Label>
            <Select onValueChange={setPecaId}>
              <SelectTrigger><SelectValue placeholder="Selecione…" /></SelectTrigger>
              <SelectContent>{pecas.map((p) => <SelectItem key={p.pecaId} value={String(p.pecaId)}>{p.nome} — {formatCurrency(p.valorUn)} (estoque: {p.qtdEstoque})</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Label>Quantidade</Label>
            <Input type="number" min={1} value={qtd} onChange={(e) => setQtd(Number(e.target.value))} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button disabled={!pecaId || mutation.isPending} onClick={() => mutation.mutate({ pecaId: Number(pecaId), qtd }, { onSuccess: () => { toast({ title: 'Peça adicionada', variant: 'success' }); onClose() }, onError: () => toast({ title: 'Erro ao adicionar peça', variant: 'destructive' }) })}>
            {mutation.isPending ? 'Adicionando…' : 'Adicionar'}
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Label>Insumo</Label>
            <Select onValueChange={setInsumoId}>
              <SelectTrigger><SelectValue placeholder="Selecione…" /></SelectTrigger>
              <SelectContent>{insumos.map((i) => <SelectItem key={i.insumoId} value={String(i.insumoId)}>{i.nome} — {formatCurrency(i.valorUn)} (estoque: {i.qtdEstoque})</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Label>Quantidade consumida</Label>
            <Input type="number" min={1} value={qtdConsumida} onChange={(e) => setQtdConsumida(Number(e.target.value))} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button disabled={!insumoId || mutation.isPending} onClick={() => mutation.mutate({ insumoId: Number(insumoId), qtdConsumida }, { onSuccess: () => { toast({ title: 'Insumo adicionado', variant: 'success' }); onClose() }, onError: () => toast({ title: 'Erro ao adicionar insumo', variant: 'destructive' }) })}>
            {mutation.isPending ? 'Adicionando…' : 'Adicionar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type AddDialog = 'servico' | 'peca' | 'insumo' | null

function ItemTable({ rows, onRemove }: { rows: { id: number; nome: string; qty: number; valor: string }[]; onRemove: (id: number) => void }) {
  if (rows.length === 0) return null
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
      <thead>
        <tr>
          {['Item', 'Qtd', 'Valor', ''].map((h, i) => (
            <th key={i} style={{ textAlign: i === 2 ? 'right' : 'left', fontWeight: 600, fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', padding: '12px 20px', borderBottom: '1px solid var(--line)', background: 'var(--surface-muted)' }}>
              {h || <span className="sr-only">Remover</span>}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id} style={{ borderBottom: '1px solid var(--line-soft)', transition: 'background .15s' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-muted)' }} onMouseLeave={(e) => { e.currentTarget.style.background = '' }}>
            <td style={{ padding: '12px 20px' }}>{r.nome}</td>
            <td style={{ padding: '12px 20px' }}>{r.qty}</td>
            <td style={{ padding: '12px 20px', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(r.valor)}</td>
            <td style={{ padding: '12px 20px', textAlign: 'right' }}>
              <ConfirmDialog trigger={<IconButton variant="danger" aria-label={`Remover ${r.nome}`}><Trash2 size={18} aria-hidden="true" /></IconButton>} description={`Remover "${r.nome}" da OS?`} onConfirm={() => onRemove(r.id)} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function EmptyState({ title, desc }: { title: string; desc: string }) {
  return (
    <div style={{ border: '1.5px dashed var(--field-border)', borderRadius: 10, padding: '36px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, textAlign: 'center', margin: '0 20px 20px' }}>
      <strong style={{ fontSize: 15 }}>{title}</strong>
      <span style={{ fontSize: 14, color: 'var(--muted)', maxWidth: 380 }}>{desc}</span>
    </div>
  )
}

export function OrdemServicoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [addDialog, setAddDialog] = useState<AddDialog>(null)

  const { data: os, isLoading } = useOrdemServico(id!)
  const statusMutation = useUpdateStatusOS(id!)
  const aprovarMutation = useAprovarOrcamento(id!)
  const solicitarMutation = useSolicitarAprovacao(id!)
  const removeServicoMutation = useRemoveServico(id!)
  const removePecaMutation = useRemovePeca(id!)
  const removeInsumoMutation = useRemoveInsumo(id!)

  if (isLoading) return <div style={{ padding: '48px 40px', color: 'var(--muted)' }}>Carregando…</div>
  if (!os) return <div style={{ padding: '48px 40px', color: 'var(--muted)' }}>OS não encontrada.</div>

  const shortId = os.osId.slice(0, 8).toUpperCase()
  const currentIdx = STATUS_ORDER.indexOf(os.status)
  const nextStatus = STATUS_ORDER[currentIdx + 1] as Status | undefined
  const proximo = PROXIMO_PASSO[os.status]

  const totalServicos = os.servicosRealizados.reduce((s, r) => s + Number(r.valor) * r.quantidade, 0)
  const totalPecas    = os.pecasUtilizadas.reduce((s, p) => s + Number(p.valor) * p.qtd, 0)
  const totalInsumos  = os.insumosConsumidos.reduce((s, i) => s + Number(i.valor) * i.qtdConsumida, 0)

  function handleProximoPasso() {
    if (os!.status === 'em_diagnostico') {
      solicitarMutation.mutate(undefined, {
        onSuccess: () => toast({ title: 'E-mail enviado', description: 'Status alterado para Aguardando Aprovação.', variant: 'success' }),
        onError: (err: unknown) => {
          const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
          toast({ title: 'Erro ao solicitar aprovação', description: msg ?? 'Verifique se o cliente possui e-mail cadastrado.', variant: 'destructive' })
        },
      })
    } else if (os!.status === 'aguardando_aprovacao') {
      aprovarMutation.mutate(undefined, {
        onSuccess: () => toast({ title: 'Orçamento aprovado', variant: 'success' }),
        onError: () => toast({ title: 'Erro ao aprovar orçamento', variant: 'destructive' }),
      })
    } else if (nextStatus) {
      statusMutation.mutate(nextStatus, {
        onSuccess: () => toast({ title: 'Status atualizado', variant: 'success' }),
        onError: () => toast({ title: 'Erro ao atualizar status', variant: 'destructive' }),
      })
    }
  }

  const isPending = statusMutation.isPending || aprovarMutation.isPending || solicitarMutation.isPending

  return (
    <div className="page-body">
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

        <Link
          to="/ordens-servico"
          className="anim-rise anim-d1"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 44, textDecoration: 'none', color: 'var(--ink-2)', fontWeight: 500, fontSize: 14, transition: 'color .2s', width: 'fit-content' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ink-2)')}
        >
          <ArrowLeft size={18} aria-hidden="true" /> Ordens de serviço
        </Link>

        <header className="anim-rise anim-d1" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
              <h1 style={{ margin: 0, fontFamily: 'Barlow, sans-serif', fontWeight: 700, fontSize: 38, letterSpacing: '-0.01em' }}>
                OS <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 500, fontSize: 30 }}>#{shortId}</span>
              </h1>
              <StatusPill status={os.status} />
            </div>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'var(--muted)' }}>
              {os.osId} · aberta em {formatDate(os.criadoEm)}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
            <span style={{ fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--muted)' }}>Valor final</span>
            <strong style={{ fontFamily: 'Barlow, sans-serif', fontSize: 38, lineHeight: 1 }}>{formatCurrency(os.valorFinal)}</strong>
          </div>
        </header>

        <section className="anim-rise anim-d2" aria-label="Andamento da OS" style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Stepper current={os.status} />
          {proximo && (
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '16px 18px', borderRadius: 10, background: 'var(--accent-soft-bg)', border: '1px solid var(--accent-soft-border)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <strong style={{ fontSize: 15 }}>Próximo passo</strong>
                <span style={{ fontSize: 14, color: 'var(--muted)' }}>{proximo.msg}</span>
              </div>
              {proximo.btn && (
                <button
                  type="button"
                  onClick={handleProximoPasso}
                  disabled={isPending}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 44, padding: '0 18px', borderRadius: 8, background: 'var(--accent)', color: '#fff', fontWeight: 600, fontSize: 14, border: 0, fontFamily: 'inherit', cursor: isPending ? 'not-allowed' : 'pointer', opacity: isPending ? .7 : 1, transition: 'background .2s, transform .2s', whiteSpace: 'nowrap' }}
                  onMouseEnter={(e) => { if (!isPending) { e.currentTarget.style.background = 'var(--accent-hover)'; e.currentTarget.style.transform = 'translateY(-1px)' } }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.transform = 'none' }}
                >
                  {os.status === 'em_diagnostico' && <Mail size={18} aria-hidden="true" />}
                  {isPending ? 'Aguarde…' : proximo.btn}
                </button>
              )}
            </div>
          )}
        </section>

        <div className="anim-rise anim-d3" style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'flex-start' }}>

          <section style={{ flex: '999 1 520px', minWidth: 0, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden' }}>
            <Tabs defaultValue="servicos">
              <TabsList>
                <TabsTrigger value="servicos"><Wrench size={14} aria-hidden="true" style={{ marginRight: 6 }} />Serviços ({os.servicosRealizados.length})</TabsTrigger>
                <TabsTrigger value="pecas"><Package size={14} aria-hidden="true" style={{ marginRight: 6 }} />Peças ({os.pecasUtilizadas.length})</TabsTrigger>
                <TabsTrigger value="insumos"><Zap size={14} aria-hidden="true" style={{ marginRight: 6 }} />Insumos ({os.insumosConsumidos.length})</TabsTrigger>
                <TabsTrigger value="historico"><Clock size={14} aria-hidden="true" style={{ marginRight: 6 }} />Histórico</TabsTrigger>
              </TabsList>

              <TabsContent value="servicos">
                <div style={{ padding: '20px 20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h2 style={{ margin: 0, fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: 20 }}>Serviços realizados</h2>
                  <Button size="sm" onClick={() => setAddDialog('servico')}><Plus size={16} />Adicionar</Button>
                </div>
                {os.servicosRealizados.length === 0
                  ? <EmptyState title="Nenhum serviço adicionado" desc="Escolha na tabela de serviços o que será feito neste carro." />
                  : <ItemTable rows={os.servicosRealizados.map(s => ({ id: s.servicoId, nome: s.descricao, qty: s.quantidade, valor: s.valor }))} onRemove={(id) => removeServicoMutation.mutate(id)} />
                }
              </TabsContent>

              <TabsContent value="pecas">
                <div style={{ padding: '20px 20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h2 style={{ margin: 0, fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: 20 }}>Peças utilizadas</h2>
                  <Button size="sm" onClick={() => setAddDialog('peca')}><Plus size={16} />Adicionar</Button>
                </div>
                {os.pecasUtilizadas.length === 0
                  ? <EmptyState title="Nenhuma peça adicionada" desc="Selecione no estoque as peças usadas no reparo." />
                  : <ItemTable rows={os.pecasUtilizadas.map(p => ({ id: p.pecaId, nome: p.nome, qty: p.qtd, valor: p.valor }))} onRemove={(id) => removePecaMutation.mutate(id)} />
                }
              </TabsContent>

              <TabsContent value="insumos">
                <div style={{ padding: '20px 20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h2 style={{ margin: 0, fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: 20 }}>Insumos consumidos</h2>
                  <Button size="sm" onClick={() => setAddDialog('insumo')}><Plus size={16} />Adicionar</Button>
                </div>
                {os.insumosConsumidos.length === 0
                  ? <EmptyState title="Nenhum insumo adicionado" desc="Óleos, fluidos e materiais de consumo usados no serviço." />
                  : <ItemTable rows={os.insumosConsumidos.map(i => ({ id: i.insumoId, nome: i.nome, qty: i.qtdConsumida, valor: i.valor }))} onRemove={(id) => removeInsumoMutation.mutate(id)} />
                }
              </TabsContent>

              <TabsContent value="historico">
                <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {(os.historicoStatus ?? []).length === 0 ? (
                    <p style={{ margin: 0, color: 'var(--muted)', fontSize: 14 }}>Sem histórico.</p>
                  ) : (
                    (os.historicoStatus ?? []).map((h) => (
                      <div key={h.id} style={{ display: 'grid', gridTemplateColumns: '12px 1fr', gap: 14 }}>
                        <span style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--sidebar)', marginTop: 4, flexShrink: 0 }} />
                        <div>
                          <strong style={{ fontSize: 14 }}>
                            {h.statusAnterior
                              ? `${STATUS_LABEL[h.statusAnterior]} → ${STATUS_LABEL[h.statusNovo]}`
                              : `OS criada · ${STATUS_LABEL[h.statusNovo]}`}
                          </strong>
                          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{formatDate(h.criadoEm)}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </section>

          <aside aria-label="Dados da OS" style={{ flex: '1 1 300px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden' }}>
            {[
              { key: 'Cliente', content: <><strong style={{ fontSize: 16 }}>{os.cliente.nome}</strong><span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: 'var(--muted)' }}>{os.cliente.numDocumento}</span></> },
              { key: 'Veículo', content: <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}><span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, padding: '3px 8px', border: '1.5px solid var(--ink)', borderRadius: 5 }}>{os.veiculo.placa}</span><span style={{ fontSize: 14 }}>{os.veiculo.marca} {os.veiculo.modelo}</span></span> },
              { key: 'Mecânico', content: <strong style={{ fontSize: 16 }}>{os.mecanico.nome}</strong> },
            ].map(({ key, content }, i) => (
              <div key={key} style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 6, borderTop: i === 0 ? 0 : '1px solid var(--line-soft)' }}>
                <span style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--muted)' }}>{key}</span>
                {content}
              </div>
            ))}
            <div style={{ padding: '18px 20px', borderTop: '1px solid var(--line-soft)', background: 'var(--surface-muted)' }}>
              <span style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 10 }}>Resumo</span>
              {[['Serviços', totalServicos], ['Peças', totalPecas], ['Insumos', totalInsumos]].map(([label, val]) => (
                <div key={label as string} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--ink-2)', padding: '5px 0' }}>
                  <span>{label as string}</span><span>{formatCurrency(val as number)}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 600, color: 'var(--ink)', padding: '10px 0 5px', borderTop: '1px solid var(--line)', marginTop: 4 }}>
                <span>Total</span><span>{formatCurrency(totalServicos + totalPecas + totalInsumos)}</span>
              </div>
            </div>
          </aside>

        </div>
      </div>

      {addDialog === 'servico' && <AddServicoDialog osId={os.osId} onClose={() => setAddDialog(null)} />}
      {addDialog === 'peca'    && <AddPecaDialog    osId={os.osId} onClose={() => setAddDialog(null)} />}
      {addDialog === 'insumo'  && <AddInsumoDialog  osId={os.osId} onClose={() => setAddDialog(null)} />}
    </div>
  )
}
