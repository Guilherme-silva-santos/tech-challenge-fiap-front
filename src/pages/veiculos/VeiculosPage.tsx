import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { type CreateVeiculoDto } from '@/api/veiculos'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { IconButton } from '@/components/IconButton'
import { PageHeader } from '@/components/PageHeader'
import { SearchInput } from '@/components/SearchInput'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateVeiculo, useDeleteVeiculo, useUpdateVeiculo, useVeiculos } from '@/hooks/queries/use-veiculos'
import { toast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/utils'
import type { Veiculo } from '@/types'

const schema = z.object({
  placa: z.string().min(7, 'Placa inválida'),
  marca: z.string().min(1, 'Marca obrigatória'),
  modelo: z.string().min(1, 'Modelo obrigatório'),
  ano: z.string().min(4, 'Ano inválido'),
  cor: z.string().min(1, 'Cor obrigatória'),
})
type FormValues = z.infer<typeof schema>

function VeiculoDialog({ open, onClose, editing }: { open: boolean; onClose: () => void; editing: Veiculo | null }) {
  const createMutation = useCreateVeiculo()
  const updateMutation = useUpdateVeiculo()
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
        toast({ title: 'Veículo atualizado', variant: 'success' })
      } else {
        await createMutation.mutateAsync(dto)
        toast({ title: 'Veículo criado', variant: 'success' })
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
            {editing ? 'Editar veículo' : 'Novo veículo'}
          </DialogTitle>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} style={{ padding: '16px 28px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Label>Placa</Label>
            <Input placeholder="ABC1D23" style={{ textTransform: 'uppercase' }} {...register('placa')} />
            {errors.placa && <p style={{ margin: 0, fontSize: 13, color: 'var(--danger)' }}>{errors.placa.message}</p>}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Label>Marca</Label>
              <Input placeholder="Toyota" {...register('marca')} />
              {errors.marca && <p style={{ margin: 0, fontSize: 13, color: 'var(--danger)' }}>{errors.marca.message}</p>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Label>Modelo</Label>
              <Input placeholder="Corolla" {...register('modelo')} />
              {errors.modelo && <p style={{ margin: 0, fontSize: 13, color: 'var(--danger)' }}>{errors.modelo.message}</p>}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Label>Ano</Label>
              <Input placeholder="2020" maxLength={4} {...register('ano')} />
              {errors.ano && <p style={{ margin: 0, fontSize: 13, color: 'var(--danger)' }}>{errors.ano.message}</p>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Label>Cor</Label>
              <Input placeholder="Preto" {...register('cor')} />
              {errors.cor && <p style={{ margin: 0, fontSize: 13, color: 'var(--danger)' }}>{errors.cor.message}</p>}
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

function PlateCell({ placa }: { placa: string }) {
  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'stretch', border: '1.5px solid var(--ink)', borderRadius: 6, background: '#fff', overflow: 'hidden', minWidth: 108, transition: 'transform .2s' }}>
      <i style={{ display: 'block', height: 6, background: '#1E4E8C' }} />
      <b style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 500, fontSize: 15, letterSpacing: '.08em', padding: '4px 10px', textAlign: 'center' }}>{placa}</b>
    </span>
  )
}

export function VeiculosPage() {
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
          eyebrow="Cadastros"
          title="Veículos"
          description="Frota cadastrada na oficina."
          action={
            <button
              type="button"
              onClick={() => { setEditing(null); setOpen(true) }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 44, padding: '0 18px', borderRadius: 8, background: 'var(--accent)', color: '#fff', fontWeight: 600, fontSize: 14, border: 0, fontFamily: 'inherit', cursor: 'pointer', transition: 'background .2s, transform .2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-hover)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.transform = 'none' }}
            >
              <Plus size={18} aria-hidden="true" />
              Novo veículo
            </button>
          }
        />

        <div className="anim-rise anim-d2">
          <SearchInput
            label="Buscar por placa, marca ou modelo"
            placeholder="Buscar por placa, marca ou modelo"
            value={search}
            onChange={setSearch}
            style={{ flex: '1 1 240px', maxWidth: 340 } as React.CSSProperties}
          />
        </div>

        <section className="anim-rise anim-d3" aria-label="Lista de veículos" style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden' }}>
          {isLoading ? (
            <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--muted)' }}>Carregando…</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--muted)' }}>
              <strong style={{ display: 'block', fontSize: 16, color: 'var(--ink)', marginBottom: 4 }}>Nenhum veículo encontrado</strong>
              {search ? `Nenhum resultado para "${search}".` : 'Cadastre o primeiro veículo.'}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: 780, borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr>
                    {['Placa', 'Marca / modelo', 'Ano', 'Cor', 'Cadastrado em', ''].map((h, i) => (
                      <th key={i} scope={i < 5 ? 'col' : undefined} style={{ textAlign: 'left', fontWeight: 600, fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--muted)', padding: '14px 20px', borderBottom: '1px solid var(--line)', background: 'var(--surface-muted)' }}>
                        {i === 5 ? <span className="sr-only">Ações</span> : h}
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
                          <i style={{ display: 'block', height: 6, background: '#1E4E8C' }} />
                          <b style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 500, fontSize: 15, letterSpacing: '.08em', padding: '4px 10px', textAlign: 'center' }}>{v.placa}</b>
                        </span>
                      </td>
                      <td style={{ padding: '12px 20px' }}><strong>{v.marca}</strong> {v.modelo}</td>
                      <td style={{ padding: '12px 20px', fontFamily: "'IBM Plex Mono', monospace", fontSize: 13 }}>{v.ano}</td>
                      <td style={{ padding: '12px 20px', color: 'var(--ink-2)' }}>{v.cor}</td>
                      <td style={{ padding: '12px 20px', fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: 'var(--muted)' }}>{formatDate(v.criadoEm)}</td>
                      <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                        <div className="row-acts" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, opacity: .75, transition: 'opacity .2s' }}>
                          <IconButton aria-label={`Editar ${v.placa}`} onClick={() => { setEditing(v); setOpen(true) }}>
                            <Pencil size={18} aria-hidden="true" />
                          </IconButton>
                          <ConfirmDialog
                            trigger={<IconButton variant="danger" aria-label={`Excluir ${v.placa}`}><Trash2 size={18} aria-hidden="true" /></IconButton>}
                            description={`Remover o veículo "${v.placa}"?`}
                            onConfirm={() => deleteMutation.mutate(v.veiculoId, {
                              onSuccess: () => toast({ title: 'Veículo removido', variant: 'success' }),
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
      <VeiculoDialog open={open} onClose={() => setOpen(false)} editing={editing} />
    </div>
  )
}
