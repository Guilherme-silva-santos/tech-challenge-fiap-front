import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { type CreateVeiculoDto } from '@/api/veiculos'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { PageHeader } from '@/components/PageHeader'
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
      <DialogContent>
        <DialogHeader><DialogTitle>{editing ? 'Editar Veículo' : 'Novo Veículo'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Placa</Label>
            <Input placeholder="ABC1D23" className="uppercase" {...register('placa')} />
            {errors.placa && <p className="text-xs text-red-500">{errors.placa.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Marca</Label>
              <Input placeholder="Toyota" {...register('marca')} />
              {errors.marca && <p className="text-xs text-red-500">{errors.marca.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Modelo</Label>
              <Input placeholder="Corolla" {...register('modelo')} />
              {errors.modelo && <p className="text-xs text-red-500">{errors.modelo.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Ano</Label>
              <Input placeholder="2020" maxLength={4} {...register('ano')} />
              {errors.ano && <p className="text-xs text-red-500">{errors.ano.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Cor</Label>
              <Input placeholder="Preto" {...register('cor')} />
              {errors.cor && <p className="text-xs text-red-500">{errors.cor.message}</p>}
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

export function VeiculosPage() {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Veiculo | null>(null)
  const [search, setSearch] = useState('')

  const { data: veiculos = [], isLoading } = useVeiculos()
  const deleteMutation = useDeleteVeiculo()

  const filtered = veiculos.filter(
    (v) => v.placa.toLowerCase().includes(search.toLowerCase()) || v.marca.toLowerCase().includes(search.toLowerCase()) || v.modelo.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="p-8">
      <PageHeader
        title="Veículos"
        description="Gerencie os veículos cadastrados"
        action={<Button onClick={() => { setEditing(null); setOpen(true) }}><Plus className="h-4 w-4" /> Novo Veículo</Button>}
      />
      <div className="mb-4">
        <Input placeholder="Buscar por placa, marca ou modelo..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
      </div>
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Placa</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Marca / Modelo</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Ano</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Cor</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Cadastrado em</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Carregando...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Nenhum veículo encontrado.</td></tr>
            ) : (
              filtered.map((v) => (
                <tr key={v.veiculoId} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono font-bold text-slate-900">{v.placa}</td>
                  <td className="px-4 py-3 text-slate-700">{v.marca} {v.modelo}</td>
                  <td className="px-4 py-3 text-slate-600">{v.ano}</td>
                  <td className="px-4 py-3 text-slate-600">{v.cor}</td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(v.criadoEm)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button size="icon" variant="ghost" onClick={() => { setEditing(v); setOpen(true) }}><Pencil className="h-4 w-4" /></Button>
                      <ConfirmDialog
                        trigger={<Button size="icon" variant="ghost" className="text-red-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></Button>}
                        description={`Remover o veículo "${v.placa}"?`}
                        onConfirm={() => deleteMutation.mutate(v.veiculoId, {
                          onSuccess: () => toast({ title: 'Veículo removido', variant: 'success' }),
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
      <VeiculoDialog open={open} onClose={() => setOpen(false)} editing={editing} />
    </div>
  )
}
