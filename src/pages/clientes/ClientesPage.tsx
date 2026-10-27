import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { type CreateClienteDto } from '@/api/clientes'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { IconButton } from '@/components/IconButton'
import { PageHeader } from '@/components/PageHeader'
import { SearchInput } from '@/components/SearchInput'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useClientes, useCreateCliente, useDeleteCliente, useUpdateCliente } from '@/hooks/queries/use-clientes'
import { toast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/utils'
import type { Cliente, Tipo } from '@/types'

const schema = z.object({
  numDocumento: z.string().min(11, 'CPF/CNPJ inválido'),
  nome: z.string().min(1, 'Nome obrigatório'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  telefone: z.string().min(10, 'Telefone inválido'),
  tipo: z.enum(['pessoa_fisica', 'pessoa_juridica']),
})
type FormValues = z.infer<typeof schema>

function getInitials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('')
}

function ClienteDialog({ open, onClose, editing }: { open: boolean; onClose: () => void; editing: Cliente | null }) {
  const createMutation = useCreateCliente()
  const updateMutation = useUpdateCliente()
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
        toast({ title: 'Cliente atualizado', variant: 'success' })
      } else {
        await createMutation.mutateAsync(dto)
        toast({ title: 'Cliente criado', variant: 'success' })
      }
      onClose()
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message
      toast({ title: 'Erro', description: Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Tente novamente.'), variant: 'destructive' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent style={{ maxWidth: 520, borderRadius: 16, padding: 0, overflow: 'hidden', animation: 'pop .45s .08s cubic-bezier(.2,.8,.2,1) both' }}>
        <div style={{ padding: '24px 28px 8px' }}>
          <span style={{ fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--accent-hover)', display: 'block', marginBottom: 4 }}>Cadastros</span>
          <DialogTitle style={{ margin: 0, fontFamily: 'Barlow, sans-serif', fontWeight: 700, fontSize: 26 }}>
            {editing ? 'Editar cliente' : 'Novo cliente'}
          </DialogTitle>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} style={{ padding: '16px 28px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Label>Tipo</Label>
              <Select defaultValue={editing?.tipo ?? 'pessoa_fisica'} onValueChange={(v) => setValue('tipo', v as FormValues['tipo'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pessoa_fisica">Pessoa Física</SelectItem>
                  <SelectItem value="pessoa_juridica">Pessoa Jurídica</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Label>CPF / CNPJ</Label>
              <Input placeholder="111.444.777-35" {...register('numDocumento')} />
              {errors.numDocumento && <p style={{ margin: 0, fontSize: 13, color: 'var(--danger)' }}>{errors.numDocumento.message}</p>}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Label>Nome</Label>
            <Input placeholder="João da Silva" {...register('nome')} />
            {errors.nome && <p style={{ margin: 0, fontSize: 13, color: 'var(--danger)' }}>{errors.nome.message}</p>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Label>E-mail <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 400 }}>(opcional — necessário para envio de orçamento)</span></Label>
            <Input placeholder="joao@email.com" type="email" {...register('email')} />
            {errors.email && <p style={{ margin: 0, fontSize: 13, color: 'var(--danger)' }}>{errors.email.message}</p>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Label>Telefone</Label>
            <Input placeholder="11999998888" {...register('telefone')} />
            {errors.telefone && <p style={{ margin: 0, fontSize: 13, color: 'var(--danger)' }}>{errors.telefone.message}</p>}
          </div>
          <DialogFooter style={{ paddingTop: 8, borderTop: '1px solid var(--line-soft)', marginTop: 4 }}>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Salvando…' : 'Salvar'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

type TipoFilter = 'todos' | 'pf' | 'pj'
const SEGS: { id: TipoFilter; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'pf', label: 'Pessoa física' },
  { id: 'pj', label: 'Pessoa jurídica' },
]

export function ClientesPage() {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Cliente | null>(null)
  const [search, setSearch] = useState('')
  const [tipoFilter, setTipoFilter] = useState<TipoFilter>('todos')

  const { data: clientes = [], isLoading } = useClientes()
  const deleteMutation = useDeleteCliente()

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
        {pj ? 'PJ' : 'PF'}
      </span>
    )
  }

  return (
    <div className="page-body">
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

        <PageHeader
          className="anim-rise anim-d1"
          eyebrow="Cadastros"
          title="Clientes"
          description="Pessoas e empresas atendidas pela oficina."
          action={
            <button
              type="button"
              onClick={() => { setEditing(null); setOpen(true) }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 44, padding: '0 18px', borderRadius: 8, background: 'var(--accent)', color: '#fff', fontWeight: 600, fontSize: 14, border: 0, fontFamily: 'inherit', cursor: 'pointer', transition: 'background .2s, transform .2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-hover)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.transform = 'none' }}
            >
              <Plus size={18} aria-hidden="true" />
              Novo cliente
            </button>
          }
        />

        <div className="anim-rise anim-d2" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <SearchInput
            label="Buscar por nome ou documento"
            placeholder="Buscar por nome ou documento"
            value={search}
            onChange={setSearch}
            style={{ flex: '1 1 240px', maxWidth: 340 } as React.CSSProperties}
          />
          <div role="group" aria-label="Tipo de cliente" style={{ display: 'inline-flex', padding: 3, borderRadius: 10, background: '#EAE8E2', gap: 2 }}>
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

        <section className="anim-rise anim-d3" aria-label="Lista de clientes" style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden' }}>
          {isLoading ? (
            <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--muted)' }}>Carregando…</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--muted)' }}>
              <strong style={{ display: 'block', fontSize: 16, color: 'var(--ink)', marginBottom: 4 }}>Nenhum cliente encontrado</strong>
              {search ? `Nenhum resultado para "${search}".` : 'Cadastre o primeiro cliente.'}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: 820, borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr>
                    {['Nome', 'Documento', 'Telefone', 'Tipo', 'Cadastrado em', ''].map((h, i) => (
                      <th key={i} scope={i < 5 ? 'col' : undefined} style={{ textAlign: 'left', fontWeight: 600, fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', padding: '14px 20px', borderBottom: '1px solid var(--line)', background: 'var(--surface-muted)' }}>
                        {i === 5 ? <span className="sr-only">Ações</span> : h}
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
                            <span style={{ width: 36, height: 36, borderRadius: '50%', background: pj ? 'var(--sidebar)' : '#ECEAE4', color: pj ? '#F28C28' : 'var(--ink-2)', fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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
                            <IconButton aria-label={`Editar ${c.nome}`} onClick={() => { setEditing(c); setOpen(true) }}>
                              <Pencil size={18} aria-hidden="true" />
                            </IconButton>
                            <ConfirmDialog
                              trigger={<IconButton variant="danger" aria-label={`Excluir ${c.nome}`}><Trash2 size={18} aria-hidden="true" /></IconButton>}
                              description={`Remover o cliente "${c.nome}"?`}
                              onConfirm={() => deleteMutation.mutate(c.clienteId, {
                                onSuccess: () => toast({ title: 'Cliente removido', variant: 'success' }),
                                onError: () => toast({ title: 'Erro ao remover', variant: 'destructive' }),
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
