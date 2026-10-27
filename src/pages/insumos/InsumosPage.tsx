import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { type CreateInsumoDto } from '@/api/insumos'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { IconButton } from '@/components/IconButton'
import { PageHeader } from '@/components/PageHeader'
import { SearchInput } from '@/components/SearchInput'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateInsumo, useDeleteInsumo, useInsumos, useUpdateInsumo } from '@/hooks/queries/use-insumos'
import { toast } from '@/hooks/use-toast'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Insumo } from '@/types'

const schema = z.object({
  nome: z.string().min(1),
  qtdEstoque: z.coerce.number().int().min(0),
  valorUn: z.coerce.number().min(0),
})
type FormValues = z.infer<typeof schema>

function StockBadge({ qty }: { qty: number }) {
  const { bg, color } = qty === 0
    ? { bg: 'var(--danger-bg)', color: 'var(--danger)' }
    : qty < 5
      ? { bg: '#FBE4D2', color: '#9A3412' }
      : { bg: '#DDF0E3', color: '#1C5E33' }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace", background: bg, color, whiteSpace: 'nowrap' }}>
      {qty}
    </span>
  )
}

function InsumoDialog({ open, onClose, editing }: { open: boolean; onClose: () => void; editing: Insumo | null }) {
  const { t } = useTranslation()
  const createMutation = useCreateInsumo()
  const updateMutation = useUpdateInsumo()
  const nomeErrId = useId()
  const qtyErrId = useId()
  const valorErrId = useId()
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (editing) reset({ nome: editing.nome, qtdEstoque: editing.qtdEstoque, valorUn: Number(editing.valorUn) })
    else reset({ nome: '', qtdEstoque: 0, valorUn: 0 })
  }, [editing, reset])

  const onSubmit = async (values: FormValues) => {
    try {
      const dto: CreateInsumoDto = values
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.insumoId, dto })
        toast({ title: t('supplies.updated'), variant: 'success' })
      } else {
        await createMutation.mutateAsync(dto)
        toast({ title: t('supplies.created'), variant: 'success' })
      }
      onClose()
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast({ title: t('common.error'), description: msg ?? t('common.tryAgain'), variant: 'destructive' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent style={{ maxWidth: 480, borderRadius: 16, padding: 0, overflow: 'hidden', animation: 'pop .45s .08s cubic-bezier(.2,.8,.2,1) both' }}>
        <div style={{ padding: '24px 28px 8px' }}>
          <span style={{ fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--accent-hover)', display: 'block', marginBottom: 4 }}>{t('supplies.formEyebrow')}</span>
          <DialogTitle style={{ margin: 0, fontFamily: 'Barlow, sans-serif', fontWeight: 700, fontSize: 26 }}>
            {editing ? t('supplies.editTitle') : t('supplies.newTitle')}
          </DialogTitle>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ padding: '16px 28px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Label>{t('supplies.formName')}</Label>
            <Input
              placeholder="Óleo 5W30"
              aria-invalid={!!errors.nome}
              aria-describedby={errors.nome ? nomeErrId : undefined}
              {...register('nome')}
            />
            {errors.nome && <p id={nomeErrId} role="alert" style={{ margin: 0, fontSize: 13, color: 'var(--danger)' }}>{t('validation.nameRequired')}</p>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Label>{t('supplies.formQty')}</Label>
              <Input
                type="number"
                min={0}
                aria-invalid={!!errors.qtdEstoque}
                aria-describedby={errors.qtdEstoque ? qtyErrId : undefined}
                {...register('qtdEstoque')}
              />
              {errors.qtdEstoque && <p id={qtyErrId} role="alert" style={{ margin: 0, fontSize: 13, color: 'var(--danger)' }}>{t('validation.qtyInvalid')}</p>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Label>{t('supplies.formPrice')}</Label>
              <Input
                type="number"
                step="0.01"
                min={0}
                aria-invalid={!!errors.valorUn}
                aria-describedby={errors.valorUn ? valorErrId : undefined}
                {...register('valorUn')}
              />
              {errors.valorUn && <p id={valorErrId} role="alert" style={{ margin: 0, fontSize: 13, color: 'var(--danger)' }}>{t('validation.valueInvalid')}</p>}
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

export function InsumosPage() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Insumo | null>(null)
  const [search, setSearch] = useState('')

  const { data: insumos = [], isLoading } = useInsumos()
  const deleteMutation = useDeleteInsumo()

  const filtered = insumos.filter((i) => !search || i.nome.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="page-body">
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

        <PageHeader
          className="anim-rise anim-d1"
          eyebrow={t('supplies.eyebrow')}
          title={t('supplies.title')}
          description={t('supplies.description')}
          action={
            <button
              type="button"
              onClick={() => { setEditing(null); setOpen(true) }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 44, padding: '0 18px', borderRadius: 8, background: 'var(--accent)', color: '#fff', fontWeight: 600, fontSize: 14, border: 0, fontFamily: 'inherit', cursor: 'pointer', transition: 'background .2s, transform .2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-hover)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.transform = 'none' }}
            >
              <Plus size={18} aria-hidden="true" />
              {t('supplies.new')}
            </button>
          }
        />

        <div className="anim-rise anim-d2">
          <SearchInput
            label={t('supplies.searchLabel')}
            placeholder={t('supplies.searchPlaceholder')}
            value={search}
            onChange={setSearch}
            style={{ flex: '1 1 240px', maxWidth: 340 } as React.CSSProperties}
          />
        </div>

        <section
          className="anim-rise anim-d3"
          aria-label={t('supplies.sectionLabel')}
          aria-busy={isLoading}
          aria-live="polite"
          style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden' }}
        >
          {isLoading ? (
            <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--muted)' }}>{t('common.loading')}</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--muted)' }}>
              <strong style={{ display: 'block', fontSize: 16, color: 'var(--ink)', marginBottom: 4 }}>{t('supplies.noFound')}</strong>
              {search ? t('common.noResults', { query: search }) : t('supplies.firstRegister')}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: 640, borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr>
                    {([t('supplies.colName'), t('supplies.colQty'), t('supplies.colPrice'), t('supplies.colDate'), ''] as const).map((h, i) => (
                      <th key={i} scope={i < 4 ? 'col' : undefined} style={{ textAlign: i === 2 ? 'right' : 'left', fontWeight: 600, fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', padding: '14px 20px', borderBottom: '1px solid var(--line)', background: 'var(--surface-muted)' }}>
                        {i === 4 ? <span className="sr-only">{t('common.actions')}</span> : h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item, i) => (
                    <tr
                      key={item.insumoId}
                      className="anim-fade"
                      style={{ borderBottom: '1px solid var(--line-soft)', transition: 'background .15s', animationDelay: `${0.22 + i * 0.08}s` }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-muted)'; const acts = e.currentTarget.querySelector('.row-acts') as HTMLElement; if (acts) acts.style.opacity = '1' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = ''; const acts = e.currentTarget.querySelector('.row-acts') as HTMLElement; if (acts) acts.style.opacity = '.75' }}
                    >
                      <td style={{ padding: '14px 20px' }}><strong>{item.nome}</strong></td>
                      <td style={{ padding: '14px 20px' }}><StockBadge qty={item.qtdEstoque} /></td>
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 700, fontSize: 17, color: 'var(--accent)' }}>{formatCurrency(item.valorUn)}</span>
                      </td>
                      <td style={{ padding: '14px 20px', fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: 'var(--muted)' }}>{formatDate(item.atualizadoEm)}</td>
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <div className="row-acts" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, opacity: .75, transition: 'opacity .2s' }}>
                          <IconButton aria-label={t('supplies.editBtn', { name: item.nome })} onClick={() => { setEditing(item); setOpen(true) }}>
                            <Pencil size={18} aria-hidden="true" />
                          </IconButton>
                          <ConfirmDialog
                            trigger={<IconButton variant="danger" aria-label={t('supplies.deleteBtn', { name: item.nome })}><Trash2 size={18} aria-hidden="true" /></IconButton>}
                            description={t('supplies.deleteDesc', { name: item.nome })}
                            onConfirm={() => deleteMutation.mutate(item.insumoId, {
                              onSuccess: () => toast({ title: t('supplies.deleted'), variant: 'success' }),
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
      <InsumoDialog open={open} onClose={() => setOpen(false)} editing={editing} />
    </div>
  )
}
