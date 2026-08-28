import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { type CreateClienteDto } from '@/api/clientes';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useClientes, useCreateCliente, useDeleteCliente, useUpdateCliente } from '@/hooks/queries/use-clientes';
import { toast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/utils';
import type { Cliente } from '@/types';

const schema = z.object({
  numDocumento: z.string().min(11, 'CPF/CNPJ inválido'),
  nome: z.string().min(1, 'Nome obrigatório'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  telefone: z.string().min(10, 'Telefone inválido'),
  tipo: z.enum(['pessoa_fisica', 'pessoa_juridica']),
});
type FormValues = z.infer<typeof schema>;

function ClienteDialog({
  open,
  onClose,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  editing: Cliente | null;
}) {
  const createMutation = useCreateCliente();
  const updateMutation = useUpdateCliente();
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { tipo: 'pessoa_fisica' },
  });

  useEffect(() => {
    if (editing) {
      reset({ numDocumento: editing.numDocumento, nome: editing.nome, email: editing.email ?? '', telefone: editing.telefone, tipo: editing.tipo });
    } else {
      reset({ numDocumento: '', nome: '', email: '', telefone: '', tipo: 'pessoa_fisica' });
    }
  }, [editing, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      const dto: CreateClienteDto = { ...values, email: values.email || undefined };
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.clienteId, dto });
        toast({ title: 'Cliente atualizado', variant: 'success' });
      } else {
        await createMutation.mutateAsync(dto);
        toast({ title: 'Cliente criado', variant: 'success' });
      }
      onClose();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast({ title: 'Erro', description: Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Tente novamente.'), variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editing ? 'Editar Cliente' : 'Novo Cliente'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select
                defaultValue={editing?.tipo ?? 'pessoa_fisica'}
                onValueChange={(v) => setValue('tipo', v as FormValues['tipo'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pessoa_fisica">Pessoa Física</SelectItem>
                  <SelectItem value="pessoa_juridica">
                    Pessoa Jurídica
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>CPF / CNPJ</Label>
              <Input
                placeholder="111.444.777-35"
                {...register('numDocumento')}
              />
              {errors.numDocumento && (
                <p className="text-xs text-red-500">
                  {errors.numDocumento.message}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Nome</Label>
            <Input placeholder="João da Silva" {...register('nome')} />
            {errors.nome && (
              <p className="text-xs text-red-500">{errors.nome.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>E-mail <span className="text-slate-400 text-xs">(opcional — necessário para envio de orçamento)</span></Label>
            <Input placeholder="joao@email.com" type="email" {...register('email')} />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Telefone</Label>
            <Input placeholder="11999998888" {...register('telefone')} />
            {errors.telefone && (
              <p className="text-xs text-red-500">{errors.telefone.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ClientesPage() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Cliente | null>(null);
  const [search, setSearch] = useState('');

  const { data: clientes = [], isLoading } = useClientes();
  const deleteMutation = useDeleteCliente();

  const filtered = clientes.filter(
    (c) =>
      c.nome.toLowerCase().includes(search.toLowerCase()) ||
      c.numDocumento.includes(search),
  );

  return (
    <div className="p-8">
      <PageHeader
        title="Clientes"
        description="Gerencie os clientes da oficina"
        action={
          <Button
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> Novo Cliente
          </Button>
        }
      />

      <div className="mb-4">
        <Input
          placeholder="Buscar por nome ou documento..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-600">
                Nome
              </th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">
                Documento
              </th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">
                Telefone
              </th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">
                Tipo
              </th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">
                Cadastrado em
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-slate-400"
                >
                  Carregando...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-slate-400"
                >
                  Nenhum cliente encontrado.
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.clienteId} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {c.nome}
                  </td>
                  <td className="px-4 py-3 text-slate-600 font-mono text-xs">
                    {c.numDocumento}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{c.telefone}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${c.tipo === 'pessoa_fisica' ? 'bg-green-50 text-green-700' : 'bg-purple-50 text-purple-700'}`}
                    >
                      {c.tipo === 'pessoa_fisica' ? 'PF' : 'PJ'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {formatDate(c.criadoEm)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditing(c);
                          setOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <ConfirmDialog
                        trigger={
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        }
                        description={`Remover o cliente "${c.nome}"?`}
                        onConfirm={() => deleteMutation.mutate(c.clienteId, {
                          onSuccess: () => toast({ title: 'Cliente removido', variant: 'success' }),
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
      <ClienteDialog
        open={open}
        onClose={() => setOpen(false)}
        editing={editing}
      />
    </div>
  );
}
