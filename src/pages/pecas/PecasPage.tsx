import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { type CreatePecaDto } from '@/api/pecas'
import { useCreatePeca, useDeletePeca, usePecas, useUpdatePeca } from '@/hooks/queries/use-pecas'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Peca } from '@/types'

const schema = z.object({
  nome: z.string().min(1, 'Nome obrigatório'),
  qtdEstoque: z.coerce.number().int().min(0),
  valorUn: z.coerce.number().min(0),
})
type FormValues = z.infer<typeof schema>

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
      <DialogContent>
        <DialogHeader><DialogTitle>{editing ? 'Editar Peça' : 'Nova Peça'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nome</Label>
            <Input placeholder="Filtro de óleo" {...register('nome')} />
            {errors.nome && <p className="text-xs text-red-500">{errors.nome.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Qtd. Estoque</Label>
              <Input type="number" min={0} {...register('qtdEstoque')} />
            </div>
            <div className="space-y-1.5">
              <Label>Valor Unitário (R$)</Label>
              <Input type="number" step="0.01" min={0} {...register('valorUn')} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : 'Salvar'}</Button>
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

  const filtered = pecas.filter((p) => p.nome.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="p-8">
      <PageHeader
        title="Peças"
        description="Gerencie o estoque de peças"
        action={<Button onClick={() => { setEditing(null); setOpen(true) }}><Plus className="h-4 w-4" /> Nova Peça</Button>}
      />
      <div className="mb-4">
        <Input placeholder="Buscar peça..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
      </div>
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Nome</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Estoque</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Valor Un.</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Atualizado em</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">Carregando...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">Nenhuma peça encontrada.</td></tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.pecaId} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{p.nome}</td>
                  <td className="px-4 py-3">
                    <span className={`font-semibold ${p.qtdEstoque === 0 ? 'text-red-500' : p.qtdEstoque < 5 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {p.qtdEstoque}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{formatCurrency(p.valorUn)}</td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(p.atualizadoEm)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button size="icon" variant="ghost" onClick={() => { setEditing(p); setOpen(true) }}><Pencil className="h-4 w-4" /></Button>
                      <ConfirmDialog
                        trigger={<Button size="icon" variant="ghost" className="text-red-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></Button>}
                        description={`Remover a peça "${p.nome}"?`}
                        onConfirm={() => deleteMutation.mutate(p.pecaId, {
                          onSuccess: () => toast({ title: 'Peça removida', variant: 'success' }),
                          onError: () => toast({ title: 'Erro ao remover', variant: 'destructive' }),
                        })}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <PecaDialog open={open} onClose={() => setOpen(false)} editing={editing} />
    </div>
  )
}
