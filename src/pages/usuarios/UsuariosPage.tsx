import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { type CreateUsuarioDto } from '@/api/usuarios'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCreateUsuario, useDeleteUsuario, useUpdateUsuario, useUsuarios } from '@/hooks/queries/use-usuarios'
import { toast } from '@/hooks/use-toast'
import { formatDate, ROLES_LABEL } from '@/lib/utils'
import type { Usuario } from '@/types'

const schema = z.object({
  nome: z.string().min(1, 'Nome obrigatório'),
  email: z.string().email('Email inválido'),
  senha: z.string().optional(),
  roles: z.enum(['admin', 'funcionario', 'mecanico']),
})
type FormValues = z.infer<typeof schema>

function UsuarioDialog({
  open,
  onClose,
  editing,
}: {
  open: boolean
  onClose: () => void
  editing: Usuario | null
}) {
  const createMutation = useCreateUsuario()
  const updateMutation = useUpdateUsuario()
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { roles: 'funcionario' } })

  useEffect(() => {
    if (editing) {
      reset({ nome: editing.nome, email: editing.email, roles: editing.roles, senha: '' })
    } else {
      reset({ nome: '', email: '', senha: '', roles: 'funcionario' })
    }
  }, [editing, reset])

  const onSubmit = async (values: FormValues) => {
    try {
      if (editing) {
        const update: Partial<CreateUsuarioDto> = { nome: values.nome, email: values.email, roles: values.roles }
        if (values.senha) update.senha = values.senha
        await updateMutation.mutateAsync({ id: editing.idUsuario, dto: update })
        toast({ title: 'Usuário atualizado', variant: 'success' })
      } else {
        await createMutation.mutateAsync({ nome: values.nome, email: values.email, senha: values.senha ?? '', roles: values.roles })
        toast({ title: 'Usuário criado', variant: 'success' })
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
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nome</Label>
            <Input placeholder="João Silva" {...register('nome')} />
            {errors.nome && <p className="text-xs text-red-500">{errors.nome.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" placeholder="joao@oficina.com" {...register('email')} />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>{editing ? 'Nova senha (opcional)' : 'Senha'}</Label>
            <Input type="password" placeholder="••••••••" {...register('senha')} />
          </div>
          <div className="space-y-1.5">
            <Label>Função</Label>
            <Select defaultValue={editing?.roles ?? 'funcionario'} onValueChange={(v) => setValue('roles', v as FormValues['roles'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="funcionario">Funcionário</SelectItem>
                <SelectItem value="mecanico">Mecânico</SelectItem>
              </SelectContent>
            </Select>
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

export function UsuariosPage() {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Usuario | null>(null)
  const [search, setSearch] = useState('')

  const { data: usuarios = [], isLoading } = useUsuarios()
  const deleteMutation = useDeleteUsuario()

  const filtered = usuarios.filter(
    (u) => u.nome.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="p-8">
      <PageHeader
        title="Usuários"
        description="Gerencie os usuários do sistema"
        action={
          <Button onClick={() => { setEditing(null); setOpen(true) }}>
            <Plus className="h-4 w-4" /> Novo Usuário
          </Button>
        }
      />

      <div className="mb-4">
        <Input placeholder="Buscar por nome ou email..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Nome</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Email</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Função</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Criado em</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">Carregando...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">Nenhum usuário encontrado.</td></tr>
            ) : (
              filtered.map((u) => (
                <tr key={u.idUsuario} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{u.nome}</td>
                  <td className="px-4 py-3 text-slate-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                      {ROLES_LABEL[u.roles]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(u.criadoEm)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button size="icon" variant="ghost" onClick={() => { setEditing(u); setOpen(true) }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <ConfirmDialog
                        trigger={<Button size="icon" variant="ghost" className="text-red-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></Button>}
                        description={`Remover o usuário "${u.nome}"?`}
                        onConfirm={() => {
                          deleteMutation.mutate(u.idUsuario, {
                            onSuccess: () => toast({ title: 'Usuário removido', variant: 'success' }),
                            onError: () => toast({ title: 'Erro ao remover', variant: 'destructive' }),
                          })
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <UsuarioDialog open={open} onClose={() => setOpen(false)} editing={editing} />
    </div>
  )
}
