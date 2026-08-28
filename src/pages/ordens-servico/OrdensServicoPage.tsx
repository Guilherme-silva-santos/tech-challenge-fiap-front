import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Search, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { type CreateOSDto } from '@/api/ordens-servico'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { PageHeader } from '@/components/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useClientes } from '@/hooks/queries/use-clientes'
import { useCreateOrdemServico, useDeleteOS, useOrdensServico } from '@/hooks/queries/use-ordens-servico'
import { useUsuarios } from '@/hooks/queries/use-usuarios'
import { useVeiculos } from '@/hooks/queries/use-veiculos'
import { toast } from '@/hooks/use-toast'
import { formatCurrency, formatDate, STATUS_COLOR, STATUS_LABEL, STATUS_ORDER } from '@/lib/utils'
import type { Status } from '@/types'

const schema = z.object({
  mecanicoId: z.coerce.number().min(1),
  clienteId: z.string().uuid('Selecione um cliente'),
  veiculoId: z.string().uuid('Selecione um veículo'),
})
type FormValues = z.infer<typeof schema>

function NovaOSDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const createMutation = useCreateOrdemServico()
  const { register, handleSubmit, setValue, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const { data: mecanicos = [] } = useUsuarios()
  const { data: clientes = [] } = useClientes()
  const { data: veiculos = [] } = useVeiculos()

  const onSubmit = async (values: FormValues) => {
    try {
      const dto: CreateOSDto = values
      await createMutation.mutateAsync(dto)
      toast({ title: 'Ordem de serviço criada', variant: 'success' })
      reset()
      onClose()
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast({ title: 'Erro', description: msg ?? 'Tente novamente.', variant: 'destructive' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { reset(); onClose() } }}>
      <DialogContent>
        <DialogHeader><DialogTitle>Nova Ordem de Serviço</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Mecânico responsável</Label>
            <Select onValueChange={(v) => setValue('mecanicoId', Number(v))}>
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                {mecanicos.filter(m => m.roles === 'mecanico').map((m) => (
                  <SelectItem key={m.idUsuario} value={String(m.idUsuario)}>{m.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.mecanicoId && <p className="text-xs text-red-500">Selecione um mecânico</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Cliente</Label>
            <Select onValueChange={(v) => setValue('clienteId', v)}>
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                {clientes.map((c) => (
                  <SelectItem key={c.clienteId} value={c.clienteId}>{c.nome} — {c.numDocumento}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.clienteId && <p className="text-xs text-red-500">{errors.clienteId.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Veículo</Label>
            <Select onValueChange={(v) => setValue('veiculoId', v)}>
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                {veiculos.map((v) => (
                  <SelectItem key={v.veiculoId} value={v.veiculoId}>{v.placa} — {v.marca} {v.modelo}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.veiculoId && <p className="text-xs text-red-500">{errors.veiculoId.message}</p>}
          </div>
          {/* Hidden field */}
          <input type="hidden" {...register('mecanicoId')} />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Criando...' : 'Criar OS'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function OrdensServicoPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [open, setOpen] = useState(false)
  const [searchCliente, setSearchCliente] = useState('')

  const statusFilter = searchParams.get('status') as Status | null

  const { data: ordens = [], isLoading } = useOrdensServico(statusFilter ? { status: statusFilter } : undefined)
  const deleteMutation = useDeleteOS()

  const filtered = ordens.filter((o) =>
    !searchCliente || o.cliente.nome.toLowerCase().includes(searchCliente.toLowerCase()),
  )

  return (
    <div className="p-8">
      <PageHeader
        title="Ordens de Serviço"
        description="Gerencie todas as OS da oficina"
        action={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Nova OS</Button>}
      />

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar cliente..."
            value={searchCliente}
            onChange={(e) => setSearchCliente(e.target.value)}
            className="pl-9 w-56"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={!statusFilter ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSearchParams({})}
          >
            Todos
          </Button>
          {STATUS_ORDER.map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSearchParams({ status: s })}
            >
              {STATUS_LABEL[s]}
            </Button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Cliente</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Veículo</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Mecânico</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Valor Final</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Criado em</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">Carregando...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">Nenhuma OS encontrada.</td></tr>
            ) : (
              filtered.map((os) => (
                <tr key={os.osId} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{os.cliente.nome}</td>
                  <td className="px-4 py-3">
                    <span className="font-mono font-bold text-slate-800">{os.veiculo.placa}</span>
                    <span className="text-slate-500 ml-1 text-xs">{os.veiculo.marca} {os.veiculo.modelo}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{os.mecanico.nome}</td>
                  <td className="px-4 py-3">
                    <Badge className={STATUS_COLOR[os.status]}>{STATUS_LABEL[os.status]}</Badge>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{formatCurrency(os.valorFinal)}</td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(os.criadoEm)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link to={`/ordens-servico/${os.osId}`}>Ver detalhes</Link>
                      </Button>
                      <ConfirmDialog
                        trigger={<Button size="icon" variant="ghost" className="text-red-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></Button>}
                        description="Remover esta ordem de serviço?"
                        onConfirm={() => deleteMutation.mutate(os.osId, {
                          onSuccess: () => toast({ title: 'OS removida', variant: 'success' }),
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

      <NovaOSDialog open={open} onClose={() => setOpen(false)} />
    </div>
  )
}
