import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { type CreateInsumoDto } from '@/api/insumos';
import { useCreateInsumo, useDeleteInsumo, useInsumos, useUpdateInsumo } from '@/hooks/queries/use-insumos';
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
import { toast } from '@/hooks/use-toast';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Insumo } from '@/types';

const schema = z.object({
  nome: z.string().min(1, 'Nome obrigatório'),
  qtdEstoque: z.coerce.number().int().min(0, 'Quantidade inválida'),
  valorUn: z.coerce.number().min(0, 'Valor inválido'),
});
type FormValues = z.infer<typeof schema>;

function InsumoDialog({
  open,
  onClose,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  editing: Insumo | null;
}) {
  const createMutation = useCreateInsumo();
  const updateMutation = useUpdateInsumo();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (editing)
      reset({
        nome: editing.nome,
        qtdEstoque: editing.qtdEstoque,
        valorUn: Number(editing.valorUn),
      });
    else reset({ nome: '', qtdEstoque: 0, valorUn: 0 });
  }, [editing, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      const dto: CreateInsumoDto = values;
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.insumoId, dto });
        toast({ title: 'Insumo atualizado', variant: 'success' });
      } else {
        await createMutation.mutateAsync(dto);
        toast({ title: 'Insumo criado', variant: 'success' });
      }
      onClose();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      toast({
        title: 'Erro',
        description: msg ?? 'Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar Insumo' : 'Novo Insumo'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nome</Label>
            <Input placeholder="Óleo 5W30" {...register('nome')} />
            {errors.nome && (
              <p className="text-xs text-red-500">{errors.nome.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Qtd. Estoque</Label>
              <Input type="number" min={0} {...register('qtdEstoque')} />
              {errors.qtdEstoque && (
                <p className="text-xs text-red-500">
                  {errors.qtdEstoque.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Valor Unitário (R$)</Label>
              <Input
                type="number"
                step="0.01"
                min={0}
                {...register('valorUn')}
              />
              {errors.valorUn && (
                <p className="text-xs text-red-500">{errors.valorUn.message}</p>
              )}
            </div>
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

export function InsumosPage() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Insumo | null>(null);
  const [search, setSearch] = useState('');

  const { data: insumos = [], isLoading } = useInsumos();
  const deleteMutation = useDeleteInsumo();

  const filtered = insumos.filter((i) =>
    i.nome.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-8">
      <PageHeader
        title="Insumos"
        description="Gerencie o estoque de insumos"
        action={
          <Button
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> Novo Insumo
          </Button>
        }
      />
      <div className="mb-4">
        <Input
          placeholder="Buscar insumo..."
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
                Estoque
              </th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">
                Valor Un.
              </th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">
                Atualizado em
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-slate-400"
                >
                  Carregando...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-slate-400"
                >
                  Nenhum insumo encontrado.
                </td>
              </tr>
            ) : (
              filtered.map((i) => (
                <tr key={i.insumoId} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {i.nome}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`font-semibold ${i.qtdEstoque === 0 ? 'text-red-500' : i.qtdEstoque < 5 ? 'text-yellow-600' : 'text-green-600'}`}
                    >
                      {i.qtdEstoque}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {formatCurrency(i.valorUn)}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {formatDate(i.atualizadoEm)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditing(i);
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
                        description={`Remover o insumo "${i.nome}"?`}
                        onConfirm={() => deleteMutation.mutate(i.insumoId, {
                          onSuccess: () => toast({ title: 'Insumo removido', variant: 'success' }),
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
      <InsumoDialog
        open={open}
        onClose={() => setOpen(false)}
        editing={editing}
      />
    </div>
  );
}
