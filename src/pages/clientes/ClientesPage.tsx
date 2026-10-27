import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { type CreateClienteDto } from '@/api/clientes'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { IconButton } from '@/components/IconButton'
import { PageHeader } from '@/components/PageHeader'
import { SearchInput } from '@/components/SearchInput'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useClientes, useCreateCliente, useDeleteCliente, useUpdateCliente } from '@/hooks/queries/use-clientes'
import { toast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/utils'
import type { Cliente, Tipo } from '@/types'

const schema = z.object({
  numDocumento: z.string().min(11),
  nome: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')),
  telefone: z.string().min(10),
  tipo: z.enum(['pessoa_fisica', 'pessoa_juridica']),
})
type FormValues = z.infer<typeof schema>

function getInitials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('')
}

function ClienteDialog({ open, onClose, editing }: { open: boolean; onClose: () => void; editing: Cliente | null }) {
  const { t } = useTranslation()
  const createMutation = useCreateCliente()
  const updateMutation = useUpdateCliente()
  const docErrId = useId()
  const nomeErrId = useId()
  const emailErrId = useId()
  const telefoneErrId = useId()
  const { register, handleSubmit, setValue, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { tipo: 'pessoa_fisica' },
  })

  useEffect(() => {
    if (editing) reset({ numDocumento: editing.numDocumento, nome: editing.nome, email: editing.email ?? '', telefone: editing.telefone, tipo: editing.tipo })
    else reset({ numDocumento: '', nome: '', email: '', telefone: '', tipo: 'pessoa_fisica' })
  }, [editing, reset])

  const onSubmit = async (values: FormValues) => {
    try {
      const dto: CreateClienteDto = { ...values, email: values.email || undefined }
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.clienteId, dto })
        toast({ title: t('clients.updated'), variant: 'success' })
      } else {
        await createMutation.mutateAsync(dto)
        toast({ title: t('clients.created'), variant: 'success' })
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
          <span style={{ fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--accent-hover)', display: 'block', marginBottom: 4 }}>{t('clients.formEyebrow')}</span>
          <DialogTitle style={{ margin: 0, fontFamily: 'Barlow, sans-serif', fontWeight: 700, fontSize: 26 }}>
            {editing ? t('clients.editTitle') : t('clients.newTitle')}
          </DialogTitle>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ padding: '16px 28px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Label>{t('clients.formType')}</Label>
              <Select defaultValue={editing?.tipo ?? 'pessoa_fisica'} onValueChange={(v) => setValue('tipo', v as FormValues['tipo'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pessoa_fisica">{t('clients.typePessoaFisica')}</SelectItem>
                  <SelectItem value="pessoa_juridica">{t('clients.typePessoaJuridica')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Label>{t('clients.formDocument')}</Label>
              <Input
                placeholder="111.444.777-35"
                aria-invalid={!!errors.numDocumento}
                aria-describedby={errors.numDocumento ? docErrId : undefined}
                {...register('numDocumento')}
              />
              {errors.numDocumento && <p id={docErrId} role="alert" style={{ margin: 0, fontSize: 13, color: 'var(--danger)' }}>{t('validation.cpfCnpjInvalid')}</p>}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Label>{t('clients.formName')}</Label>
            <Input
              placeholder="João da Silva"
              aria-invalid={!!errors.nome}
              aria-describedby={errors.nome ? nomeErrId : undefined}
              {...register('nome')}
            />
            {errors.nome && <p id={nomeErrId} role="alert" style={{ margin: 0, fontSize: 13, color: 'var(--danger)' }}>{t('validation.nameRequired')}</p>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Label>
              {t('clients.formEmail')}{' '}
              <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 400 }}>{t('clients.formEmailHint')}</span>
            </Label>
            <Input
              placeholder="joao@email.com"
              type="email"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? emailErrId : undefined}
              {...register('email')}
            />
            {errors.email && <p id={emailErrId} role="alert" style={{ margin: 0, fontSize: 13, color: 'var(--danger)' }}>{t('validation.emailInvalid')}</p>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Label>{t('clients.formPhone')}</Label>
            <Input
              placeholder="11999998888"
              aria-invalid={!!errors.telefone}
              aria-describedby={errors.telefone ? telefoneErrId : undefined}
              {...register('telefone')}
            />
            {errors.telefone && <p id={telefoneErrId} role="alert" style={{ margin: 0, fontSize: 13, color: 'var(--danger)' }}>{t('validation.phoneInvalid')}</p>}
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

type TipoFilter = 'todos' | 'pf' | 'pj'

export function ClientesPage() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Cliente | null>(null)
  const [search, setSearch] = useState('')
  const [tipoFilter, setTipoFilter] = useState<TipoFilter>('todos')

  const { data: clientes = [], isLoading } = useClientes()
  const deleteMutation = useDeleteCliente()

  const SEGS: { id: TipoFilter; label: string }[] = [
    { id: 'todos', label: t('clients.filterAll') },
    { id: 'pf', label: t('clients.filterIndividual') },
    { id: 'pj', label: t('clients.filterCompany') },
  ]

  const filtered = clientes.filter((c) => {
    const matchSearch = !search || c.nome.toLowerCase().includes(search.toLowerCase()) || c.numDocumento.includes(search)
    const matchTipo = tipoFilter === 'todos'
      || (tipoFilter === 'pf' && c.tipo === 'pessoa_fisica')
      || (tipoFilter === 'pj' && c.tipo === 'pessoa_juridica')
    return matchSearch && matchTipo
  })

  function tipoPill(tipo: Tipo) {
    const pj = tipo === 'pessoa_juridica'
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600, background: pj ? 'var(--sidebar)' : '#ECEAE4', color: pj ? '#fff' : 'var(--ink-2)', whiteSpace: 'nowrap' }}>
        {pj ? t('clients.typePJ') : t('clients.typePF')}
      </span>
    )
  }

  return (
    <div className="page-body">
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

        <PageHeader
          className="anim-rise anim-d1"
          eyebrow={t('clients.eyebrow')}
          title={t('clients.title')}
          description={t('clients.description')}
          action={
            <button
              type="button"
              onClick={() => { setEditing(null); setOpen(true) }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 44, padding: '0 18px', borderRadius: 8, background: 'var(--accent)', color: '#fff', fontWeight: 600, fontSize: 14, border: 0, fontFamily: 'inherit', cursor: 'pointer', transition: 'background .2s, transform .2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-hover)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.transform = 'none' }}
            >
              <Plus size={18} aria-hidden="true" />
              {t('clients.new')}
            </button>
          }
        />

        <div className="anim-rise anim-d2" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <SearchInput
            label={t('clients.searchLabel')}
            placeholder={t('clients.searchPlaceholder')}
            value={search}
            onChange={setSearch}
            style={{ flex: '1 1 240px', maxWidth: 340 } as React.CSSProperties}
          />
          <div role="group" aria-label={t('clients.filterGroup')} style={{ display: 'inline-flex', padding: 3, borderRadius: 10, background: '#EAE8E2', gap: 2 }}>
            {SEGS.map(({ id, label }) => {
              const active = tipoFilter === id
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setTipoFilter(id)}
                  style={{ minHeight: 38, padding: '0 14px', border: 0, borderRadius: 8, background: active ? '#fff' : 'transparent', fontFamily: 'inherit', fontSize: 13, fontWeight: active ? 600 : 500, color: active ? 'var(--ink)' : 'var(--ink-2)', cursor: 'pointer', boxShadow: active ? '0 1px 2px rgba(0,0,0,.08)' : 'none', transition: 'background .2s, color .2s, box-shadow .2s' }}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        <section
          className="anim-rise anim-d3"
          aria-label={t('clients.sectionLabel')}
          aria-busy={isLoading}
          aria-live="polite"
          style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden' }}
        >
          {isLoading ? (
            <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--muted)' }}>{t('common.loading')}</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--muted)' }}>
              <strong style={{ display: 'block', fontSize: 16, color: 'var(--ink)', marginBottom: 4 }}>{t('clients.noFound')}</strong>
              {search ? t('clients.noFoundSearch', { query: search }) : t('clients.firstRegister')}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: 820, borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr>
                    {([t('clients.colName'), t('clients.colDocument'), t('clients.colPhone'), t('clients.colType'), t('clients.colDate'), ''] as const).map((h, i) => (
                      <th key={i} scope={i < 5 ? 'col' : undefined} style={{ textAlign: 'left', fontWeight: 600, fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', padding: '14px 20px', borderBottom: '1px solid var(--line)', background: 'var(--surface-muted)' }}>
                        {i === 5 ? <span className="sr-only">{t('common.actions')}</span> : h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, i) => {
                    const pj = c.tipo === 'pessoa_juridica'
                    return (
                      <tr
                        key={c.clienteId}
                        className="anim-fade"
                        style={{ borderBottom: '1px solid var(--line-soft)', transition: 'background .15s', animationDelay: `${0.22 + i * 0.08}s` }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-muted)'; const acts = e.currentTarget.querySelector('.row-acts') as HTMLElement; if (acts) acts.style.opacity = '1' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = ''; const acts = e.currentTarget.querySelector('.row-acts') as HTMLElement; if (acts) acts.style.opacity = '.75' }}
                      >
                        <td style={{ padding: '12px 20px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
                            <span aria-hidden="true" style={{ width: 36, height: 36, borderRadius: '50%', background: pj ? 'var(--sidebar)' : '#ECEAE4', color: pj ? '#F28C28' : 'var(--ink-2)', fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              {getInitials(c.nome)}
                            </span>
                            <strong>{c.nome}</strong>
                          </span>
                        </td>
                        <td style={{ padding: '12px 20px', fontFamily: "'IBM Plex Mono', monospace", fontSize: 13 }}>{c.numDocumento}</td>
                        <td style={{ padding: '12px 20px' }}>{c.telefone}</td>
                        <td style={{ padding: '12px 20px' }}>{tipoPill(c.tipo)}</td>
                        <td style={{ padding: '12px 20px', fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: 'var(--muted)' }}>{formatDate(c.criadoEm)}</td>
                        <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                          <div className="row-acts" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, opacity: .75, transition: 'opacity .2s' }}>
                            <IconButton aria-label={t('clients.editBtn', { name: c.nome })} onClick={() => { setEditing(c); setOpen(true) }}>
                              <Pencil size={18} aria-hidden="true" />
                            </IconButton>
                            <ConfirmDialog
                              trigger={<IconButton variant="danger" aria-label={t('clients.deleteBtn', { name: c.nome })}><Trash2 size={18} aria-hidden="true" /></IconButton>}
                              description={t('clients.deleteDesc', { name: c.nome })}
                              onConfirm={() => deleteMutation.mutate(c.clienteId, {
                                onSuccess: () => toast({ title: t('clients.deleted'), variant: 'success' }),
                                onError: () => toast({ title: t('common.error'), variant: 'destructive' }),
                              })}
                            />
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </div>
      <ClienteDialog open={open} onClose={() => setOpen(false)} editing={editing} />
    </div>
  )
}
