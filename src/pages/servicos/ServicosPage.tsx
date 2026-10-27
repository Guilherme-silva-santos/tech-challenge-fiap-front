import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { type CreateServicoDto } from '@/api/servicos'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { IconButton } from '@/components/IconButton'
import { PageHeader } from '@/components/PageHeader'
import { SearchInput } from '@/components/SearchInput'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateServico, useDeleteServico, useServicos, useUpdateServico } from '@/hooks/queries/use-servicos'
import { toast } from '@/hooks/use-toast'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Servico } from '@/types'

const schema = z.object({
  descricao: z.string().min(1),
  valor: z.coerce.number().min(0),
})
type FormValues = z.infer<typeof schema>

function ServicoDialog({ open, onClose, editing }: { open: boolean; onClose: () => void; editing: Servico | null }) {
  const { t } = useTranslation()
  const createMutation = useCreateServico()
  const updateMutation = useUpdateServico()
  const descErrId = useId()
  const valorErrId = useId()
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (editing) reset({ descricao: editing.descricao, valor: Number(editing.valor) })
    else reset({ descricao: '', valor: 0 })
  }, [editing, reset])

  const onSubmit = async (values: FormValues) => {
    try {
      const dto: CreateServicoDto = values
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.servicoId, dto })
        toast({ title: t('services.updated'), variant: 'success' })
      } else {
        await createMutation.mutateAsync(dto)
        toast({ title: t('services.created'), variant: 'success' })
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
          <span style={{ fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--accent-hover)', display: 'block', marginBottom: 4 }}>{t('services.formEyebrow')}</span>
          <DialogTitle style={{ margin: 0, fontFamily: 'Barlow, sans-serif', fontWeight: 700, fontSize: 26 }}>
            {editing ? t('services.editTitle') : t('services.newTitle')}
          </DialogTitle>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ padding: '16px 28px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Label>{t('services.formName')}</Label>
            <Input
              placeholder="Troca de óleo e filtro"
              aria-invalid={!!errors.descricao}
              aria-describedby={errors.descricao ? descErrId : undefined}
              {...register('descricao')}
            />
            {errors.descricao && <p id={descErrId} role="alert" style={{ margin: 0, fontSize: 13, color: 'var(--danger)' }}>{t('validation.descRequired')}</p>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Label>{t('services.formPrice')}</Label>
            <Input
              type="number"
              step="0.01"
              min={0}
              aria-invalid={!!errors.valor}
              aria-describedby={errors.valor ? valorErrId : undefined}
              {...register('valor')}
            />
            {errors.valor && <p id={valorErrId} role="alert" style={{ margin: 0, fontSize: 13, color: 'var(--danger)' }}>{t('validation.valueInvalid')}</p>}
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

export function ServicosPage() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Servico | null>(null)
  const [search, setSearch] = useState('')

  const { data: servicos = [], isLoading } = useServicos()
  const deleteMutation = useDeleteServico()

  const filtered = servicos.filter((s) => !search || s.descricao.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="page-body">
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

        <PageHeader
          className="anim-rise anim-d1"
          eyebrow={t('services.eyebrow')}
          title={t('services.title')}
          description={t('services.description')}
          action={
            <button
              type="button"
              onClick={() => { setEditing(null); setOpen(true) }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 44, padding: '0 18px', borderRadius: 8, background: 'var(--accent)', color: '#fff', fontWeight: 600, fontSize: 14, border: 0, fontFamily: 'inherit', cursor: 'pointer', transition: 'background .2s, transform .2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-hover)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.transform = 'none' }}
            >
              <Plus size={18} aria-hidden="true" />
              {t('services.new')}
            </button>
          }
        />

        <div className="anim-rise anim-d2">
          <SearchInput
            label={t('services.searchLabel')}
            placeholder={t('services.searchPlaceholder')}
            value={search}
            onChange={setSearch}
            style={{ flex: '1 1 240px', maxWidth: 340 } as React.CSSProperties}
          />
        </div>

        <section
          className="anim-rise anim-d3"
          aria-label={t('services.sectionLabel')}
          aria-busy={isLoading}
          aria-live="polite"
          style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden' }}
        >
          {isLoading ? (
            <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--muted)' }}>{t('common.loading')}</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--muted)' }}>
              <strong style={{ display: 'block', fontSize: 16, color: 'var(--ink)', marginBottom: 4 }}>{t('services.noFound')}</strong>
              {search ? t('common.noResults', { query: search }) : t('services.firstRegister')}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: 640, borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr>
                    {([t('services.colName'), t('services.colPrice'), t('services.colDate'), ''] as const).map((h, i) => (
                      <th key={i} scope={i < 3 ? 'col' : undefined} style={{ textAlign: i === 1 ? 'right' : 'left', fontWeight: 600, fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', padding: '14px 20px', borderBottom: '1px solid var(--line)', background: 'var(--surface-muted)' }}>
                        {i === 3 ? <span className="sr-only">{t('common.actions')}</span> : h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, i) => (
                    <tr
                      key={s.servicoId}
                      className="anim-fade"
                      style={{ borderBottom: '1px solid var(--line-soft)', transition: 'background .15s', animationDelay: `${0.22 + i * 0.08}s` }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-muted)'; const acts = e.currentTarget.querySelector('.row-acts') as HTMLElement; if (acts) acts.style.opacity = '1' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = ''; const acts = e.currentTarget.querySelector('.row-acts') as HTMLElement; if (acts) acts.style.opacity = '.75' }}
                    >
                      <td style={{ padding: '14px 20px' }}><strong>{s.descricao}</strong></td>
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 700, fontSize: 17, color: 'var(--accent)' }}>{formatCurrency(s.valor)}</span>
                      </td>
                      <td style={{ padding: '14px 20px', fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: 'var(--muted)' }}>{formatDate(s.atualizadoEm)}</td>
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <div className="row-acts" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, opacity: .75, transition: 'opacity .2s' }}>
                          <IconButton aria-label={t('services.editBtn', { name: s.descricao })} onClick={() => { setEditing(s); setOpen(true) }}>
                            <Pencil size={18} aria-hidden="true" />
                          </IconButton>
                          <ConfirmDialog
                            trigger={<IconButton variant="danger" aria-label={t('services.deleteBtn', { name: s.descricao })}><Trash2 size={18} aria-hidden="true" /></IconButton>}
                            description={t('services.deleteDesc', { name: s.descricao })}
                            onConfirm={() => deleteMutation.mutate(s.servicoId, {
                              onSuccess: () => toast({ title: t('services.deleted'), variant: 'success' }),
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
      <ServicoDialog open={open} onClose={() => setOpen(false)} editing={editing} />
    </div>
  )
}
