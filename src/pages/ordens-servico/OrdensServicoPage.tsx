import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Plus, Trash2, TriangleAlert } from 'lucide-react'
import { useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { type CreateOSDto } from '@/api/ordens-servico'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { IconButton } from '@/components/IconButton'
import { PageHeader } from '@/components/PageHeader'
import { SearchInput } from '@/components/SearchInput'
import { StatusPill } from '@/components/StatusPill'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useClientes } from '@/hooks/queries/use-clientes'
import { useCreateOrdemServico, useDeleteOS, useOrdensServico } from '@/hooks/queries/use-ordens-servico'
import { useUsuarios } from '@/hooks/queries/use-usuarios'
import { toast } from '@/hooks/use-toast'
import { formatCurrency, formatDate, STATUS_ORDER } from '@/lib/utils'
import type { Status } from '@/types'

const schema = z.object({
  mecanicoId: z.coerce.number().min(1),
  clienteId: z.string().uuid(),
  veiculoId: z.string().uuid(),
})
type FormValues = z.infer<typeof schema>

function NovaOSDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation()
  const createMutation = useCreateOrdemServico()
  const clienteErrId = useId()
  const veiculoErrId = useId()
  const semVeiculoId = useId()
  const mecanicoErrId = useId()
  const { register, handleSubmit, setValue, reset, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) })
  const { data: mecanicos = [] } = useUsuarios()
  const { data: clientes = [] } = useClientes()
  const clienteId = watch('clienteId')
  const veiculoId = watch('veiculoId')
  const veiculos = clientes.find((c) => c.clienteId === clienteId)?.veiculos ?? []
  const semVeiculo = !!clienteId && veiculos.length === 0
  const veiculoPlaceholder = !clienteId
    ? t('workOrders.selectClientFirst')
    : veiculos.length === 0 ? t('workOrders.noVehiclesForClient') : t('workOrders.selectVehicle')

  const handleClose = () => {
    reset()
    onClose()
  }

  const onSubmit = async (values: FormValues) => {
    try {
      const dto: CreateOSDto = values
      await createMutation.mutateAsync(dto)
      toast({ title: t('workOrders.created'), variant: 'success' })
      handleClose()
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast({ title: t('common.error'), description: msg ?? t('common.tryAgain'), variant: 'destructive' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
      <DialogContent style={{ maxWidth: 520, borderRadius: 16, padding: 0, overflow: 'hidden', animation: 'pop .45s .08s cubic-bezier(.2,.8,.2,1) both' }}>
        <div style={{ padding: '24px 28px 8px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--accent-hover)' }}>{t('workOrders.initialStage')}</span>
            <DialogTitle style={{ margin: 0, fontFamily: 'Barlow, sans-serif', fontWeight: 700, fontSize: 28 }}>{t('workOrders.dialogTitle')}</DialogTitle>
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ padding: '16px 28px 28px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="anim-rise anim-d2" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Label htmlFor="clienteId" style={{ fontSize: 14, fontWeight: 600 }}>{t('workOrders.formClient')}</Label>
            <Select value={clienteId ?? ''} onValueChange={(v) => { setValue('clienteId', v); setValue('veiculoId', '') }}>
              <SelectTrigger id="clienteId"><SelectValue placeholder={t('workOrders.selectClient')} /></SelectTrigger>
              <SelectContent>{clientes.map((c) => <SelectItem key={c.clienteId} value={c.clienteId}>{c.nome} — {c.numDocumento}</SelectItem>)}</SelectContent>
            </Select>
            {errors.clienteId && <p id={clienteErrId} role="alert" style={{ margin: 0, fontSize: 13, color: 'var(--danger)' }}>{t('validation.selectClient')}</p>}
          </div>
          <div className="anim-rise anim-d3" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Label htmlFor="veiculoId" style={{ fontSize: 14, fontWeight: 600 }}>{t('workOrders.formVehicle')}</Label>
            <Select value={veiculoId ?? ''} onValueChange={(v) => setValue('veiculoId', v)} disabled={veiculos.length === 0}>
              <SelectTrigger id="veiculoId" aria-describedby={semVeiculo ? semVeiculoId : undefined}><SelectValue placeholder={veiculoPlaceholder} /></SelectTrigger>
              <SelectContent>{veiculos.map((v) => <SelectItem key={v.veiculoId} value={v.veiculoId}>{v.placa} — {v.marca} {v.modelo}</SelectItem>)}</SelectContent>
            </Select>
            {semVeiculo && (
              <div id={semVeiculoId} role="alert" style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', borderRadius: 10, background: 'var(--accent-soft-bg)', border: '1px solid var(--accent-soft-border)', fontSize: 13, lineHeight: 1.5, color: 'var(--ink-2)' }}>
                <TriangleAlert size={18} aria-hidden="true" style={{ flex: 'none', marginTop: 1, color: 'var(--accent)' }} />
                <span>
                  {t('workOrders.noVehicleWarning')}{' '}
                  <Link to={`/veiculos?cliente=${clienteId}`} style={{ color: 'var(--accent-hover)', fontWeight: 600 }}>{t('workOrders.registerVehicle')}</Link>
                </span>
              </div>
            )}
            {errors.veiculoId && <p id={veiculoErrId} role="alert" style={{ margin: 0, fontSize: 13, color: 'var(--danger)' }}>{t('validation.selectVehicle')}</p>}
          </div>
          <div className="anim-rise anim-d4" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Label htmlFor="mecanicoId" style={{ fontSize: 14, fontWeight: 600 }}>{t('workOrders.formMechanic')}</Label>
            <Select onValueChange={(v) => setValue('mecanicoId', Number(v))}>
              <SelectTrigger id="mecanicoId"><SelectValue placeholder={t('workOrders.selectMechanic')} /></SelectTrigger>
              <SelectContent>{mecanicos.filter(m => m.roles === 'mecanico').map((m) => <SelectItem key={m.idUsuario} value={String(m.idUsuario)}>{m.nome}</SelectItem>)}</SelectContent>
            </Select>
            {errors.mecanicoId && <p id={mecanicoErrId} role="alert" style={{ margin: 0, fontSize: 13, color: 'var(--danger)' }}>{t('workOrders.selectMechanicErr')}</p>}
          </div>
          <input type="hidden" {...register('mecanicoId')} />
          <DialogFooter style={{ paddingTop: 8, borderTop: '1px solid var(--line-soft)', marginTop: 4 }}>
            <Button type="button" variant="outline" onClick={handleClose}>{t('common.cancel')}</Button>
            <Button type="submit" disabled={isSubmitting || semVeiculo}>{isSubmitting ? t('workOrders.creating') : t('workOrders.createBtn')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function OrdensServicoPage() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const statusFilter = searchParams.get('status') as Status | null
  const { data: ordens = [], isLoading } = useOrdensServico(statusFilter ? { status: statusFilter } : undefined)
  const { data: all = [] } = useOrdensServico()
  const deleteMutation = useDeleteOS()

  const ALL_STATUS: { id: Status | 'todas'; label: string }[] = [
    { id: 'todas', label: t('workOrders.filterAll') },
    ...STATUS_ORDER.map(s => ({ id: s, label: t(`status.${s}`) })),
  ]

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
          eyebrow={t('workOrders.eyebrow')}
          title={t('workOrders.title')}
          description={t('workOrders.description')}
          action={
            <button
              type="button"
              onClick={() => setOpen(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 44, padding: '0 18px', borderRadius: 8, background: 'var(--accent)', color: '#fff', fontWeight: 600, fontSize: 14, border: 0, fontFamily: 'inherit', cursor: 'pointer', transition: 'background .2s, transform .2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-hover)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.transform = 'none' }}
            >
              <Plus size={18} aria-hidden="true" style={{ transition: 'transform .3s' }} />
              {t('workOrders.new')}
            </button>
          }
        />

        <div className="anim-rise anim-d2" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
          <SearchInput
            placeholder={t('workOrders.searchPlaceholder')}
            value={search}
            onChange={setSearch}
            label={t('workOrders.searchLabel')}
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

        <section
          className="anim-rise anim-d3"
          aria-label={t('workOrders.sectionLabel')}
          aria-busy={isLoading}
          aria-live="polite"
          style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden' }}
        >
          {isLoading ? (
            <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--muted)' }}>{t('common.loading')}</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--muted)', animation: 'rise .5s both' }}>
              <strong style={{ display: 'block', fontSize: 16, color: 'var(--ink)', marginBottom: 4 }}>{t('workOrders.noFound')}</strong>
              {statusFilter
                ? t('common.noResults', { query: t(`status.${statusFilter}`) })
                : t('workOrders.firstRegister')}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: 860, borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr>
                    {([t('workOrders.colClient'), t('workOrders.colVehicle'), t('workOrders.mechanic').replace(':', ''), t('workOrders.colStatus'), t('workOrders.colTotal'), t('workOrders.colDate'), ''] as const).map((h, i) => (
                      <th key={i} scope="col" style={{ textAlign: i === 4 ? 'right' : 'left', fontWeight: 600, fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', padding: '14px 20px', borderBottom: '1px solid var(--line)', background: 'var(--surface-muted)' }}>
                        {i === 6 ? <span className="sr-only">{t('common.actions')}</span> : h}
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
                            aria-label={`Abrir OS de ${os.cliente.nome}`}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, minHeight: 44, padding: '0 14px', borderRadius: 8, border: '1px solid var(--field-border)', fontSize: 13, fontWeight: 600, textDecoration: 'none', color: 'var(--ink)', transition: 'border-color .2s, color .2s' }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--field-border)'; e.currentTarget.style.color = 'var(--ink)' }}
                          >
                            Abrir <ArrowRight size={16} aria-hidden="true" />
                          </Link>
                          <ConfirmDialog
                            trigger={
                              <IconButton variant="danger" aria-label={t('workOrders.deleteDesc', { id: os.osId })}>
                                <Trash2 size={18} aria-hidden="true" />
                              </IconButton>
                            }
                            description={t('workOrders.deleteDesc', { id: os.osId })}
                            onConfirm={() => deleteMutation.mutate(os.osId, {
                              onSuccess: () => toast({ title: t('workOrders.deleted'), variant: 'success' }),
                              onError: () => toast({ title: t('common.error'), variant: 'destructive' }),
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
