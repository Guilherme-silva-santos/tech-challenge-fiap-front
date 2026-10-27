import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { type CreatePecaDto } from '@/api/pecas'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { IconButton } from '@/components/IconButton'
import { PageHeader } from '@/components/PageHeader'
import { SearchInput } from '@/components/SearchInput'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreatePeca, useDeletePeca, usePecas, useUpdatePeca } from '@/hooks/queries/use-pecas'
import { toast } from '@/hooks/use-toast'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Peca } from '@/types'

const schema = z.object({
  nome: z.string().min(1, 'Nome obrigatório'),
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

function PecaDialog({ open, onClose, editing }: { open: boolean; onClose: () => void; editing: Peca | null }) {
  const createMutation = useCreatePeca()
  const updateMutation = useUpdatePeca()
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (editing) reset({ nome: editing.nome, qtdEstoque: editing.qtdEstoque, valorUn: Number(editing.valorUn) })
    else reset({ nome: '', qtdEstoque: 0, valorUn: 0 })
  }, [editing, reset])

  const onSubmit = async (values: FormValues) => {
    try {
      const dto: CreatePecaDto = values
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.pecaId, dto })
        toast({ title: 'Peça atualizada', variant: 'success' })
      } else {
        await createMutation.mutateAsync(dto)
        toast({ title: 'Peça criada', variant: 'success' })
      }
      onClose()
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast({ title: 'Erro', description: msg ?? 'Tente novamente.', variant: 'destructive' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent style={{ maxWidth: 480, borderRadius: 16, padding: 0, overflow: 'hidden', animation: 'pop .45s .08s cubic-bezier(.2,.8,.2,1) both' }}>
        <div style={{ padding: '24px 28px 8px' }}>
          <span style={{ fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--accent-hover)', display: 'block', marginBottom: 4 }}>Catálogo e estoque</span>
          <DialogTitle style={{ margin: 0, fontFamily: 'Barlow, sans-serif', fontWeight: 700, fontSize: 26 }}>
            {editing ? 'Editar peça' : 'Nova peça'}
          </DialogTitle>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} style={{ padding: '16px 28px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Label>Nome</Label>
            <Input placeholder="Filtro de óleo" {...register('nome')} />
            {errors.nome && <p style={{ margin: 0, fontSize: 13, color: 'var(--danger)' }}>{errors.nome.message}</p>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Label>Qtd. estoque</Label>
              <Input type="number" min={0} {...register('qtdEstoque')} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Label>Valor unitário (R$)</Label>
              <Input type="number" step="0.01" min={0} {...register('valorUn')} />
              {errors.valorUn && <p style={{ margin: 0, fontSize: 13, color: 'var(--danger)' }}>{errors.valorUn.message}</p>}
            </div>
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

export function PecasPage() {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Peca | null>(null)
  const [search, setSearch] = useState('')

  const { data: pecas = [], isLoading } = usePecas()
  const deleteMutation = useDeletePeca()

  const filtered = pecas.filter((p) => !search || p.nome.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="page-body">
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>

        <PageHeader
          className="anim-rise anim-d1"
          eyebrow="Catálogo e estoque"
          title="Peças"
          description="Estoque de peças disponíveis na oficina."
          action={
            <button
              type="button"
              onClick={() => { setEditing(null); setOpen(true) }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 44, padding: '0 18px', borderRadius: 8, background: 'var(--accent)', color: '#fff', fontWeight: 600, fontSize: 14, border: 0, fontFamily: 'inherit', cursor: 'pointer', transition: 'background .2s, transform .2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-hover)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.transform = 'none' }}
            >
              <Plus size={18} aria-hidden="true" />
              Nova peça
            </button>
          }
        />

        <div className="anim-rise anim-d2">
          <SearchInput
            label="Buscar peça"
            placeholder="Buscar peça…"
            value={search}
            onChange={setSearch}
            style={{ flex: '1 1 240px', maxWidth: 340 } as React.CSSProperties}
          />
        </div>

        <section className="anim-rise anim-d3" aria-label="Lista de peças" style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden' }}>
          {isLoading ? (
            <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--muted)' }}>Carregando…</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--muted)' }}>
              <strong style={{ display: 'block', fontSize: 16, color: 'var(--ink)', marginBottom: 4 }}>Nenhuma peça encontrada</strong>
              {search ? `Nenhum resultado para "${search}".` : 'Cadastre a primeira peça.'}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: 640, borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr>
                    {['Nome', 'Estoque', 'Valor un.', 'Atualizado em', ''].map((h, i) => (
                      <th key={i} scope={i < 4 ? 'col' : undefined} style={{ textAlign: i === 2 ? 'right' : 'left', fontWeight: 600, fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', padding: '14px 20px', borderBottom: '1px solid var(--line)', background: 'var(--surface-muted)' }}>
                        {i === 4 ? <span className="sr-only">Ações</span> : h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => (
                    <tr
                      key={p.pecaId}
                      className="anim-fade"
                      style={{ borderBottom: '1px solid var(--line-soft)', transition: 'background .15s', animationDelay: `${0.22 + i * 0.08}s` }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-muted)'; const acts = e.currentTarget.querySelector('.row-acts') as HTMLElement; if (acts) acts.style.opacity = '1' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = ''; const acts = e.currentTarget.querySelector('.row-acts') as HTMLElement; if (acts) acts.style.opacity = '.75' }}
                    >
                      <td style={{ padding: '14px 20px' }}><strong>{p.nome}</strong></td>
                      <td style={{ padding: '14px 20px' }}><StockBadge qty={p.qtdEstoque} /></td>
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 700, fontSize: 17, color: 'var(--accent)' }}>{formatCurrency(p.valorUn)}</span>
                      </td>
                      <td style={{ padding: '14px 20px', fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: 'var(--muted)' }}>{formatDate(p.atualizadoEm)}</td>
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <div className="row-acts" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, opacity: .75, transition: 'opacity .2s' }}>
                          <IconButton aria-label={`Editar ${p.nome}`} onClick={() => { setEditing(p); setOpen(true) }}>
                            <Pencil size={18} aria-hidden="true" />
                          </IconButton>
                          <ConfirmDialog
                            trigger={<IconButton variant="danger" aria-label={`Excluir ${p.nome}`}><Trash2 size={18} aria-hidden="true" /></IconButton>}
                            description={`Remover a peça "${p.nome}"?`}
                            onConfirm={() => deleteMutation.mutate(p.pecaId, {
                              onSuccess: () => toast({ title: 'Peça removida', variant: 'success' }),
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
      <PecaDialog open={open} onClose={() => setOpen(false)} editing={editing} />
    </div>
  )
}
