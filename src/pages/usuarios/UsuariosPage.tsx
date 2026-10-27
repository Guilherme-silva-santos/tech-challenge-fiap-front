import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { type CreateUsuarioDto } from '@/api/usuarios'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { IconButton } from '@/components/IconButton'
import { PageHeader } from '@/components/PageHeader'
import { SearchInput } from '@/components/SearchInput'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCreateUsuario, useDeleteUsuario, useUpdateUsuario, useUsuarios } from '@/hooks/queries/use-usuarios'
import { toast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/utils'
import type { Roles, Usuario } from '@/types'

const schema = z.object({
  nome: z.string().min(1),
  email: z.string().email(),
  senha: z.string().optional(),
  roles: z.enum(['admin', 'funcionario', 'mecanico']),
})
type FormValues = z.infer<typeof schema>

function getInitials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('')
}

function parseCurrentUserId(): number | null {
  try {
    const token = localStorage.getItem('accessToken')
    if (!token) return null
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.sub ? Number(payload.sub) : null
  } catch {
    return null
  }
}

const ROLE_STYLE: Record<Roles, { bg: string; color: string }> = {
  admin:       { bg: 'var(--sidebar)', color: '#fff' },
  funcionario: { bg: '#EAE8E2',        color: 'var(--ink-2)' },
  mecanico:    { bg: '#FBE9DD',        color: '#9A3412' },
}

function UsuarioDialog({ open, onClose, editing }: { open: boolean; onClose: () => void; editing: Usuario | null }) {
  const { t } = useTranslation()
  const createMutation = useCreateUsuario()
  const updateMutation = useUpdateUsuario()
  const nomeErrId = useId()
  const emailErrId = useId()
  const { register, handleSubmit, setValue, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { roles: 'funcionario' },
  })

  useEffect(() => {
    if (editing) reset({ nome: editing.nome, email: editing.email, roles: editing.roles, senha: '' })
    else reset({ nome: '', email: '', senha: '', roles: 'funcionario' })
  }, [editing, reset])

  const onSubmit = async (values: FormValues) => {
    try {
      if (editing) {
        const update: Partial<CreateUsuarioDto> = { nome: values.nome, email: values.email, roles: values.roles }
        if (values.senha) update.senha = values.senha
        await updateMutation.mutateAsync({ id: editing.idUsuario, dto: update })
        toast({ title: t('users.updated'), variant: 'success' })
      } else {
        await createMutation.mutateAsync({ nome: values.nome, email: values.email, senha: values.senha ?? '', roles: values.roles })
        toast({ title: t('users.created'), variant: 'success' })
      }
      onClose()
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast({ title: t('common.error'), description: msg ?? t('common.tryAgain'), variant: 'destructive' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent style={{ maxWidth: 520, borderRadius: 16, padding: 0, overflow: 'hidden', animation: 'pop .45s .08s cubic-bezier(.2,.8,.2,1) both' }}>
        <div style={{ padding: '24px 28px 8px' }}>
          <span style={{ fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--accent-hover)', display: 'block', marginBottom: 4 }}>{t('users.formEyebrow')}</span>
          <DialogTitle style={{ margin: 0, fontFamily: 'Barlow, sans-serif', fontWeight: 700, fontSize: 26 }}>
            {editing ? t('users.editTitle') : t('users.newTitle')}
          </DialogTitle>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ padding: '16px 28px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Label>{t('users.formName')}</Label>
            <Input
              placeholder="João Silva"
              aria-invalid={!!errors.nome}
              aria-describedby={errors.nome ? nomeErrId : undefined}
              {...register('nome')}
            />
            {errors.nome && <p id={nomeErrId} role="alert" style={{ margin: 0, fontSize: 13, color: 'var(--danger)' }}>{t('validation.nameRequired')}</p>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Label>{t('users.formEmail')}</Label>
            <Input
              type="email"
              placeholder="joao@oficina.com"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? emailErrId : undefined}
              {...register('email')}
            />
            {errors.email && <p id={emailErrId} role="alert" style={{ margin: 0, fontSize: 13, color: 'var(--danger)' }}>{t('validation.emailInvalid')}</p>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Label>
              {editing ? `${t('users.formPassword')} ${t('users.formPasswordHint')}` : t('users.formPassword')}
            </Label>
            <Input type="password" placeholder="••••••••" {...register('senha')} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Label>{t('users.formRole')}</Label>
            <Select defaultValue={editing?.roles ?? 'funcionario'} onValueChange={(v) => setValue('roles', v as FormValues['roles'])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">{t('users.roleAdmin')}</SelectItem>
                <SelectItem value="funcionario">{t('users.roleEmployee')}</SelectItem>
                <SelectItem value="mecanico">{t('users.roleMechanic')}</SelectItem>
              </SelectContent>
            </Select>
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

export function UsuariosPage() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Usuario | null>(null)
  const [search, setSearch] = useState('')

  const { data: usuarios = [], isLoading } = useUsuarios()
  const deleteMutation = useDeleteUsuario()
  const currentUserId = parseCurrentUserId()

  const filtered = usuarios.filter(
    (u) => !search || u.nome.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="page-body">
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

        <PageHeader
          className="anim-rise anim-d1"
          eyebrow={t('users.eyebrow')}
          title={t('users.title')}
          description={t('users.description')}
          action={
            <button
              type="button"
              onClick={() => { setEditing(null); setOpen(true) }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 44, padding: '0 18px', borderRadius: 8, background: 'var(--accent)', color: '#fff', fontWeight: 600, fontSize: 14, border: 0, fontFamily: 'inherit', cursor: 'pointer', transition: 'background .2s, transform .2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-hover)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.transform = 'none' }}
            >
              <Plus size={18} aria-hidden="true" />
              {t('users.new')}
            </button>
          }
        />

        <div className="anim-rise anim-d2">
          <SearchInput
            label={t('users.searchLabel')}
            placeholder={t('users.searchPlaceholder')}
            value={search}
            onChange={setSearch}
            style={{ flex: '1 1 240px', maxWidth: 340 } as React.CSSProperties}
          />
        </div>

        <section
          className="anim-rise anim-d3"
          aria-label={t('users.sectionLabel')}
          aria-busy={isLoading}
          aria-live="polite"
          style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden' }}
        >
          {isLoading ? (
            <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--muted)' }}>{t('common.loading')}</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--muted)' }}>
              <strong style={{ display: 'block', fontSize: 16, color: 'var(--ink)', marginBottom: 4 }}>{t('users.noFound')}</strong>
              {search ? t('common.noResults', { query: search }) : t('users.firstRegister')}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: 780, borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr>
                    {([t('users.colName'), t('users.colEmail'), t('users.colRole'), t('users.colDate'), ''] as const).map((h, i) => (
                      <th key={i} scope={i < 4 ? 'col' : undefined} style={{ textAlign: 'left', fontWeight: 600, fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', padding: '14px 20px', borderBottom: '1px solid var(--line)', background: 'var(--surface-muted)' }}>
                        {i === 4 ? <span className="sr-only">{t('common.actions')}</span> : h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u, i) => {
                    const isAdmin = u.roles === 'admin'
                    const isMe = u.idUsuario === currentUserId
                    const style = ROLE_STYLE[u.roles]
                    return (
                      <tr
                        key={u.idUsuario}
                        className="anim-fade"
                        style={{ borderBottom: '1px solid var(--line-soft)', transition: 'background .15s', animationDelay: `${0.22 + i * 0.08}s` }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-muted)'; const acts = e.currentTarget.querySelector('.row-acts') as HTMLElement; if (acts) acts.style.opacity = '1' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = ''; const acts = e.currentTarget.querySelector('.row-acts') as HTMLElement; if (acts) acts.style.opacity = '.75' }}
                      >
                        <td style={{ padding: '12px 20px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
                            <span aria-hidden="true" style={{ width: 36, height: 36, borderRadius: '50%', background: isAdmin ? 'var(--sidebar)' : '#ECEAE4', color: isAdmin ? '#F28C28' : 'var(--ink-2)', fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              {getInitials(u.nome)}
                            </span>
                            <strong>{u.nome}</strong>
                            {isMe && (
                              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', border: '1px solid var(--field-border)', borderRadius: 999, padding: '1px 8px' }}>você</span>
                            )}
                          </span>
                        </td>
                        <td style={{ padding: '12px 20px', color: 'var(--ink-2)' }}>{u.email}</td>
                        <td style={{ padding: '12px 20px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600, background: style.bg, color: style.color, whiteSpace: 'nowrap' }}>
                            {t(`roles.${u.roles}`)}
                          </span>
                        </td>
                        <td style={{ padding: '12px 20px', fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: 'var(--muted)' }}>{formatDate(u.criadoEm)}</td>
                        <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                          <div className="row-acts" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, opacity: .75, transition: 'opacity .2s' }}>
                            <IconButton aria-label={t('users.editBtn', { name: u.nome })} onClick={() => { setEditing(u); setOpen(true) }}>
                              <Pencil size={18} aria-hidden="true" />
                            </IconButton>
                            <ConfirmDialog
                              trigger={<IconButton variant="danger" aria-label={t('users.deleteBtn', { name: u.nome })}><Trash2 size={18} aria-hidden="true" /></IconButton>}
                              description={t('users.deleteDesc', { name: u.nome })}
                              onConfirm={() => deleteMutation.mutate(u.idUsuario, {
                                onSuccess: () => toast({ title: t('users.deleted'), variant: 'success' }),
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
      <UsuarioDialog open={open} onClose={() => setOpen(false)} editing={editing} />
    </div>
  )
}
