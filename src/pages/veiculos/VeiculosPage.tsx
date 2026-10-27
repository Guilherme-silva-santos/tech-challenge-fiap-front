import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { type CreateVeiculoDto } from '@/api/veiculos'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { IconButton } from '@/components/IconButton'
import { PageHeader } from '@/components/PageHeader'
import { SearchInput } from '@/components/SearchInput'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateVeiculo, useDeleteVeiculo, useUpdateVeiculo, useVeiculos } from '@/hooks/queries/use-veiculos'
import { toast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/utils'
import type { Veiculo } from '@/types'

const schema = z.object({
  placa: z.string().min(7),
  marca: z.string().min(1),
  modelo: z.string().min(1),
  ano: z.string().min(4),
  cor: z.string().min(1),
})
type FormValues = z.infer<typeof schema>

function VeiculoDialog({ open, onClose, editing }: { open: boolean; onClose: () => void; editing: Veiculo | null }) {
  const { t } = useTranslation()
  const createMutation = useCreateVeiculo()
  const updateMutation = useUpdateVeiculo()
  const placaErrId = useId()
  const marcaErrId = useId()
  const modeloErrId = useId()
  const anoErrId = useId()
  const corErrId = useId()
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (editing) reset({ placa: editing.placa, marca: editing.marca, modelo: editing.modelo, ano: editing.ano, cor: editing.cor })
    else reset({ placa: '', marca: '', modelo: '', ano: '', cor: '' })
  }, [editing, reset])

  const onSubmit = async (values: FormValues) => {
    try {
      const dto: CreateVeiculoDto = { ...values, placa: values.placa.toUpperCase().replace(/-/g, '') }
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.veiculoId, dto })
        toast({ title: t('vehicles.updated'), variant: 'success' })
      } else {
        await createMutation.mutateAsync(dto)
        toast({ title: t('vehicles.created'), variant: 'success' })
      }
      onClose()
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message
      toast({ title: t('common.error'), description: Array.isArray(msg) ? msg.join(', ') : (msg ?? t('common.tryAgain')), variant: 'destructive' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent style={{ maxWidth: 520, borderRadius: 16, padding: 0, overflow: 'hidden', animation: 'pop .45s .08s cubic-bezier(.2,.8,.2,1) both' }}>
        <div style={{ padding: '24px 28px 8px' }}>
          <span style={{ fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--accent-hover)', display: 'block', marginBottom: 4 }}>{t('vehicles.formEyebrow')}</span>
          <DialogTitle style={{ margin: 0, fontFamily: 'Barlow, sans-serif', fontWeight: 700, fontSize: 26 }}>
            {editing ? t('vehicles.editTitle') : t('vehicles.newTitle')}
          </DialogTitle>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ padding: '16px 28px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Label>{t('vehicles.formPlate')}</Label>
            <Input
              placeholder="ABC1D23"
              style={{ textTransform: 'uppercase' }}
              aria-invalid={!!errors.placa}
              aria-describedby={errors.placa ? placaErrId : undefined}
              {...register('placa')}
            />
            {errors.placa && <p id={placaErrId} role="alert" style={{ margin: 0, fontSize: 13, color: 'var(--danger)' }}>{t('validation.plateInvalid')}</p>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Label>{t('vehicles.formBrand')}</Label>
              <Input
                placeholder="Toyota"
                aria-invalid={!!errors.marca}
                aria-describedby={errors.marca ? marcaErrId : undefined}
                {...register('marca')}
              />
              {errors.marca && <p id={marcaErrId} role="alert" style={{ margin: 0, fontSize: 13, color: 'var(--danger)' }}>{t('validation.brandRequired')}</p>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Label>{t('vehicles.formModel')}</Label>
              <Input
                placeholder="Corolla"
                aria-invalid={!!errors.modelo}
                aria-describedby={errors.modelo ? modeloErrId : undefined}
                {...register('modelo')}
              />
              {errors.modelo && <p id={modeloErrId} role="alert" style={{ margin: 0, fontSize: 13, color: 'var(--danger)' }}>{t('validation.modelRequired')}</p>}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Label>{t('vehicles.formYear')}</Label>
              <Input
                placeholder="2020"
                maxLength={4}
                aria-invalid={!!errors.ano}
                aria-describedby={errors.ano ? anoErrId : undefined}
                {...register('ano')}
              />
              {errors.ano && <p id={anoErrId} role="alert" style={{ margin: 0, fontSize: 13, color: 'var(--danger)' }}>{t('validation.yearInvalid')}</p>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Label>{t('vehicles.formColor')}</Label>
              <Input
                placeholder="Preto"
                aria-invalid={!!errors.cor}
                aria-describedby={errors.cor ? corErrId : undefined}
                {...register('cor')}
              />
              {errors.cor && <p id={corErrId} role="alert" style={{ margin: 0, fontSize: 13, color: 'var(--danger)' }}>{t('validation.colorRequired')}</p>}
            </div>
          </div>
          <DialogFooter style={{ paddingTop: 8, borderTop: '1px solid var(--line-soft)', marginTop: 4 }}>
            <Button type="button" variant="outline" onClick={onClose}>{t('common.cancel')}</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? t('common.saving') : t('common.save')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function VeiculosPage() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Veiculo | null>(null)
  const [search, setSearch] = useState('')

  const { data: veiculos = [], isLoading } = useVeiculos()
  const deleteMutation = useDeleteVeiculo()

  const filtered = veiculos.filter(
    (v) => !search || v.placa.toLowerCase().includes(search.toLowerCase()) || v.marca.toLowerCase().includes(search.toLowerCase()) || v.modelo.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="page-body">
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

        <PageHeader
          className="anim-rise anim-d1"
          eyebrow={t('vehicles.eyebrow')}
          title={t('vehicles.title')}
          description={t('vehicles.description')}
          action={
            <button
              type="button"
              onClick={() => { setEditing(null); setOpen(true) }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 44, padding: '0 18px', borderRadius: 8, background: 'var(--accent)', color: '#fff', fontWeight: 600, fontSize: 14, border: 0, fontFamily: 'inherit', cursor: 'pointer', transition: 'background .2s, transform .2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-hover)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.transform = 'none' }}
            >
              <Plus size={18} aria-hidden="true" />
              {t('vehicles.new')}
            </button>
          }
        />

        <div className="anim-rise anim-d2">
          <SearchInput
            label={t('vehicles.searchLabel')}
            placeholder={t('vehicles.searchPlaceholder')}
            value={search}
            onChange={setSearch}
            style={{ flex: '1 1 240px', maxWidth: 340 } as React.CSSProperties}
          />
        </div>

        <section
          className="anim-rise anim-d3"
          aria-label={t('vehicles.sectionLabel')}
          aria-busy={isLoading}
          aria-live="polite"
          style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden' }}
        >
          {isLoading ? (
            <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--muted)' }}>{t('common.loading')}</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--muted)' }}>
              <strong style={{ display: 'block', fontSize: 16, color: 'var(--ink)', marginBottom: 4 }}>{t('vehicles.noFound')}</strong>
              {search ? t('vehicles.noFoundSearch', { query: search }) : t('vehicles.firstRegister')}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: 780, borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr>
                    {([t('vehicles.colPlate'), `${t('vehicles.colBrand')} / ${t('vehicles.colModel')}`, t('vehicles.colYear'), t('vehicles.colColor'), t('vehicles.colDate'), ''] as const).map((h, i) => (
                      <th key={i} scope={i < 5 ? 'col' : undefined} style={{ textAlign: 'left', fontWeight: 600, fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', padding: '14px 20px', borderBottom: '1px solid var(--line)', background: 'var(--surface-muted)' }}>
                        {i === 5 ? <span className="sr-only">{t('common.actions')}</span> : h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((v, i) => (
                    <tr
                      key={v.veiculoId}
                      className="anim-fade"
                      style={{ borderBottom: '1px solid var(--line-soft)', transition: 'background .15s', animationDelay: `${0.22 + i * 0.08}s` }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-muted)'; const acts = e.currentTarget.querySelector('.row-acts') as HTMLElement; if (acts) acts.style.opacity = '1'; const plate = e.currentTarget.querySelector('.plate-cell') as HTMLElement; if (plate) plate.style.transform = 'translateX(3px)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = ''; const acts = e.currentTarget.querySelector('.row-acts') as HTMLElement; if (acts) acts.style.opacity = '.75'; const plate = e.currentTarget.querySelector('.plate-cell') as HTMLElement; if (plate) plate.style.transform = '' }}
                    >
                      <td style={{ padding: '12px 20px' }}>
                        <span className="plate-cell" style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'stretch', border: '1.5px solid var(--ink)', borderRadius: 6, background: '#fff', overflow: 'hidden', minWidth: 108, transition: 'transform .2s' }}>
                          <i aria-hidden="true" style={{ display: 'block', height: 6, background: '#1E4E8C' }} />
                          <b style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 500, fontSize: 15, letterSpacing: '.08em', padding: '4px 10px', textAlign: 'center' }}>{v.placa}</b>
                        </span>
                      </td>
                      <td style={{ padding: '12px 20px' }}><strong>{v.marca}</strong> {v.modelo}</td>
                      <td style={{ padding: '12px 20px', fontFamily: "'IBM Plex Mono', monospace", fontSize: 13 }}>{v.ano}</td>
                      <td style={{ padding: '12px 20px', color: 'var(--ink-2)' }}>{v.cor}</td>
                      <td style={{ padding: '12px 20px', fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: 'var(--muted)' }}>{formatDate(v.criadoEm)}</td>
                      <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                        <div className="row-acts" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, opacity: .75, transition: 'opacity .2s' }}>
                          <IconButton aria-label={t('vehicles.editBtn', { plate: v.placa })} onClick={() => { setEditing(v); setOpen(true) }}>
                            <Pencil size={18} aria-hidden="true" />
                          </IconButton>
                          <ConfirmDialog
                            trigger={<IconButton variant="danger" aria-label={t('vehicles.deleteBtn', { plate: v.placa })}><Trash2 size={18} aria-hidden="true" /></IconButton>}
                            description={t('vehicles.deleteDesc', { plate: v.placa })}
                            onConfirm={() => deleteMutation.mutate(v.veiculoId, {
                              onSuccess: () => toast({ title: t('vehicles.deleted'), variant: 'success' }),
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
      <VeiculoDialog open={open} onClose={() => setOpen(false)} editing={editing} />
    </div>
  )
}
