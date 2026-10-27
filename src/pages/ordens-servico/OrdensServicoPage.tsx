import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { type CreateOSDto } from '@/api/ordens-servico'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { IconButton } from '@/components/IconButton'
import { PageHeader } from '@/components/PageHeader'
import { SearchInput } from '@/components/SearchInput'
import { StatusPill } from '@/components/StatusPill'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useClientes } from '@/hooks/queries/use-clientes'
import { useCreateOrdemServico, useDeleteOS, useOrdensServico } from '@/hooks/queries/use-ordens-servico'
import { useUsuarios } from '@/hooks/queries/use-usuarios'
import { useVeiculos } from '@/hooks/queries/use-veiculos'
import { toast } from '@/hooks/use-toast'
import { formatCurrency, formatDate, STATUS_LABEL, STATUS_ORDER } from '@/lib/utils'
import type { Status } from '@/types'

const schema = z.object({
  mecanicoId: z.coerce.number().min(1),
  clienteId: z.string().uuid('Selecione um cliente'),
  veiculoId: z.string().uuid('Selecione um veículo'),
})
type FormValues = z.infer<typeof schema>

function NovaOSDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const createMutation = useCreateOrdemServico()
  const { register, handleSubmit, setValue, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) })
  const { data: mecanicos = [] } = useUsuarios()
  const { data: clientes = [] } = useClientes()
  const { data: veiculos = [] } = useVeiculos()

  const onSubmit = async (values: FormValues) => {
    try {
      const dto: CreateOSDto = values
      await createMutation.mutateAsync(dto)
      toast({ title: 'Ordem de serviço criada', variant: 'success' })
      reset()
      onClose()
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast({ title: 'Erro', description: msg ?? 'Tente novamente.', variant: 'destructive' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { reset(); onClose() } }}>
      <DialogContent style={{ maxWidth: 520, borderRadius: 16, padding: 0, overflow: 'hidden', animation: 'pop .45s .08s cubic-bezier(.2,.8,.2,1) both' }}>
        <div style={{ padding: '24px 28px 8px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--accent-hover)' }}>Etapa inicial: Recebida</span>
            <DialogTitle style={{ margin: 0, fontFamily: 'Barlow, sans-serif', fontWeight: 700, fontSize: 28 }}>Nova ordem de serviço</DialogTitle>
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} style={{ padding: '16px 28px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="anim-rise anim-d2" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Label htmlFor="clienteId" style={{ fontSize: 14, fontWeight: 600 }}>Cliente</Label>
            <Select onValueChange={(v) => setValue('clienteId', v)}>
              <SelectTrigger id="clienteId"><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
              <SelectContent>{clientes.map((c) => <SelectItem key={c.clienteId} value={c.clienteId}>{c.nome} — {c.numDocumento}</SelectItem>)}</SelectContent>
            </Select>
            {errors.clienteId && <p style={{ margin: 0, fontSize: 13, color: 'var(--danger)' }}>{errors.clienteId.message}</p>}
          </div>
          <div className="anim-rise anim-d3" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Label htmlFor="veiculoId" style={{ fontSize: 14, fontWeight: 600 }}>Veículo</Label>
            <Select onValueChange={(v) => setValue('veiculoId', v)}>
              <SelectTrigger id="veiculoId"><SelectValue placeholder="Selecione o veículo" /></SelectTrigger>
              <SelectContent>{veiculos.map((v) => <SelectItem key={v.veiculoId} value={v.veiculoId}>{v.placa} — {v.marca} {v.modelo}</SelectItem>)}</SelectContent>
            </Select>
            {errors.veiculoId && <p style={{ margin: 0, fontSize: 13, color: 'var(--danger)' }}>{errors.veiculoId.message}</p>}
          </div>
          <div className="anim-rise anim-d4" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Label htmlFor="mecanicoId" style={{ fontSize: 14, fontWeight: 600 }}>Mecânico responsável</Label>
            <Select onValueChange={(v) => setValue('mecanicoId', Number(v))}>
              <SelectTrigger id="mecanicoId"><SelectValue placeholder="Selecione o mecânico" /></SelectTrigger>
              <SelectContent>{mecanicos.filter(m => m.roles === 'mecanico').map((m) => <SelectItem key={m.idUsuario} value={String(m.idUsuario)}>{m.nome}</SelectItem>)}</SelectContent>
            </Select>
            {errors.mecanicoId && <p style={{ margin: 0, fontSize: 13, color: 'var(--danger)' }}>Selecione um mecânico</p>}
          </div>
          <input type="hidden" {...register('mecanicoId')} />
          <DialogFooter style={{ paddingTop: 8, borderTop: '1px solid var(--line-soft)', marginTop: 4 }}>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Criando…' : 'Criar OS'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

const ALL_STATUS: { id: Status | 'todas'; label: string }[] = [
  { id: 'todas', label: 'Todas' },
  ...STATUS_ORDER.map(s => ({ id: s, label: STATUS_LABEL[s] })),
]

export function OrdensServicoPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const statusFilter = searchParams.get('status') as Status | null
  const { data: ordens = [], isLoading } = useOrdensServico(statusFilter ? { status: statusFilter } : undefined)
  const { data: all = [] } = useOrdensServico()
  const deleteMutation = useDeleteOS()

  const countFor = (s: Status | 'todas') =>
    s === 'todas' ? all.length : all.filter(o => o.status === s).length

  const filtered = ordens.filter(o =>
    !search || o.cliente.nome.toLowerCase().includes(search.toLowerCase()) || o.veiculo.placa.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="page-body">
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

        <PageHeader
          className="anim-rise anim-d1"
          eyebrow="Operação"
          title="Ordens de serviço"
          description="Todas as OS da oficina, da entrada à entrega."
          action={
            <button
              type="button"
              onClick={() => setOpen(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 44, padding: '0 18px', borderRadius: 8, background: 'var(--accent)', color: '#fff', fontWeight: 600, fontSize: 14, border: 0, fontFamily: 'inherit', cursor: 'pointer', transition: 'background .2s, transform .2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-hover)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.transform = 'none' }}
            >
              <Plus size={18} aria-hidden="true" style={{ transition: 'transform .3s' }} />
              Nova OS
            </button>
          }
        />

        <div className="anim-rise anim-d2" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
          <SearchInput
            placeholder="Buscar cliente ou placa"
            value={search}
            onChange={setSearch}
            label="Buscar cliente ou placa"
            style={{ flex: '1 1 240px', maxWidth: 340 } as React.CSSProperties}
          />
          <div role="group" aria-label="Filtrar por status" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {ALL_STATUS.map(({ id, label }) => {
              const active = id === 'todas' ? !statusFilter : statusFilter === id
              const count = countFor(id)
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => id === 'todas' ? setSearchParams({}) : setSearchParams({ status: id })}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 44, padding: '0 14px',
                    borderRadius: 999, border: `1px solid ${active ? 'var(--sidebar)' : 'var(--field-border)'}`,
                    background: active ? 'var(--sidebar)' : 'var(--surface)',
                    fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
                    color: active ? '#fff' : 'var(--ink-2)', cursor: 'pointer',
                    transition: 'background .2s, border-color .2s, color .2s',
                  }}
                >
                  {label}
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, padding: '1px 6px', borderRadius: 999, background: active ? 'var(--accent)' : 'var(--line-soft)', color: active ? '#fff' : 'var(--ink-2)' }}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <section className="anim-rise anim-d3" aria-label="Lista de ordens de serviço" style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden' }}>
          {isLoading ? (
            <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--muted)' }}>Carregando…</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--muted)', animation: 'rise .5s both' }}>
              <strong style={{ display: 'block', fontSize: 16, color: 'var(--ink)', marginBottom: 4 }}>Nenhuma OS nesta etapa</strong>
              {statusFilter ? `Quando uma ordem chegar em "${STATUS_LABEL[statusFilter]}", ela aparece aqui.` : 'Nenhuma ordem de serviço cadastrada.'}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: 860, borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr>
                    {['Cliente', 'Veículo', 'Mecânico', 'Status', 'Valor final', 'Criada em', ''].map((h, i) => (
                      <th key={i} scope="col" style={{ textAlign: i === 4 ? 'right' : 'left', fontWeight: 600, fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', padding: '14px 20px', borderBottom: '1px solid var(--line)', background: 'var(--surface-muted)' }}>
                        {i === 6 ? <span className="sr-only">Ações</span> : h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((os, i) => (
                    <tr
                      key={os.osId}
                      className="anim-fade"
                      style={{ borderBottom: '1px solid var(--line-soft)', transition: 'background .15s', animationDelay: `${0.25 + i * 0.05}s` }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-muted)'; const acts = e.currentTarget.querySelector('.row-acts') as HTMLElement; if (acts) acts.style.opacity = '1' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = ''; const acts = e.currentTarget.querySelector('.row-acts') as HTMLElement; if (acts) acts.style.opacity = '.75' }}
                    >
                      <td style={{ padding: '14px 20px' }}><strong>{os.cliente.nome}</strong></td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, padding: '3px 8px', border: '1.5px solid var(--ink)', borderRadius: 5, background: 'var(--surface)', letterSpacing: '.04em' }}>{os.veiculo.placa}</span>
                          <span style={{ color: 'var(--ink-2)' }}>{os.veiculo.marca} {os.veiculo.modelo}</span>
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', color: 'var(--ink-2)' }}>{os.mecanico.nome}</td>
                      <td style={{ padding: '14px 20px' }}><StatusPill status={os.status} /></td>
                      <td style={{ padding: '14px 20px', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(os.valorFinal)}</td>
                      <td style={{ padding: '14px 20px', fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: 'var(--muted)' }}>{formatDate(os.criadoEm)}</td>
                      <td style={{ padding: '14px 20px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div className="row-acts" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, opacity: .75, transition: 'opacity .2s' }}>
                          <Link
                            to={`/ordens-servico/${os.osId}`}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, minHeight: 44, padding: '0 14px', borderRadius: 8, border: '1px solid var(--field-border)', fontSize: 13, fontWeight: 600, textDecoration: 'none', color: 'var(--ink)', transition: 'border-color .2s, color .2s' }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--field-border)'; e.currentTarget.style.color = 'var(--ink)' }}
                          >
                            Abrir <ArrowRight size={16} aria-hidden="true" />
                          </Link>
                          <ConfirmDialog
                            trigger={
                              <IconButton variant="danger" aria-label={`Excluir OS de ${os.cliente.nome}`}>
                                <Trash2 size={18} aria-hidden="true" />
                              </IconButton>
                            }
                            description={`Remover a OS de ${os.cliente.nome}?`}
                            onConfirm={() => deleteMutation.mutate(os.osId, {
                              onSuccess: () => toast({ title: 'OS removida', variant: 'success' }),
                              onError: () => toast({ title: 'Erro ao remover', variant: 'destructive' }),
                            })}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </div>
      <NovaOSDialog open={open} onClose={() => setOpen(false)} />
    </div>
  )
}
