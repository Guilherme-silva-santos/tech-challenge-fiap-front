import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { type CreateServicoDto } from '@/api/servicos'
import { useCreateServico, useDeleteServico, useServicos, useUpdateServico } from '@/hooks/queries/use-servicos'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Servico } from '@/types'

const schema = z.object({
  descricao: z.string().min(1, 'Descrição obrigatória'),
  valor: z.coerce.number().min(0, 'Valor inválido'),
})
type FormValues = z.infer<typeof schema>

function ServicoDialog({ open, onClose, editing }: { open: boolean; onClose: () => void; editing: Servico | null }) {
  const createMutation = useCreateServico()
  const updateMutation = useUpdateServico()
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
        toast({ title: 'Serviço atualizado', variant: 'success' })
      } else {
        await createMutation.mutateAsync(dto)
        toast({ title: 'Serviço criado', variant: 'success' })
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
        <DialogHeader><DialogTitle>{editing ? 'Editar Serviço' : 'Novo Serviço'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Descrição</Label>
            <Input placeholder="Troca de óleo e filtro" {...register('descricao')} />
            {errors.descricao && <p className="text-xs text-red-500">{errors.descricao.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Valor (R$)</Label>
            <Input type="number" step="0.01" min={0} {...register('valor')} />
            {errors.valor && <p className="text-xs text-red-500">{errors.valor.message}</p>}
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

export function ServicosPage() {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Servico | null>(null)
  const [search, setSearch] = useState('')

  const { data: servicos = [], isLoading } = useServicos()
  const deleteMutation = useDeleteServico()

  const filtered = servicos.filter((s) => s.descricao.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="p-8">
      <PageHeader
        title="Serviços"
        description="Tabela de preços de serviços"
        action={<Button onClick={() => { setEditing(null); setOpen(true) }}><Plus className="h-4 w-4" /> Novo Serviço</Button>}
      />
      <div className="mb-4">
        <Input placeholder="Buscar serviço..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
      </div>
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Descrição</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Valor</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Atualizado em</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">Carregando...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">Nenhum serviço encontrado.</td></tr>
            ) : (
              filtered.map((s) => (
                <tr key={s.servicoId} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{s.descricao}</td>
                  <td className="px-4 py-3 font-semibold text-green-700">{formatCurrency(s.valor)}</td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(s.atualizadoEm)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button size="icon" variant="ghost" onClick={() => { setEditing(s); setOpen(true) }}><Pencil className="h-4 w-4" /></Button>
                      <ConfirmDialog
                        trigger={<Button size="icon" variant="ghost" className="text-red-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></Button>}
                        description={`Remover o serviço "${s.descricao}"?`}
                        onConfirm={() => deleteMutation.mutate(s.servicoId, {
                          onSuccess: () => toast({ title: 'Serviço removido', variant: 'success' }),
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
      <ServicoDialog open={open} onClose={() => setOpen(false)} editing={editing} />
    </div>
  )
}
