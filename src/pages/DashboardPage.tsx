import { Car, CheckCircle, Clock, ClipboardList, Timer, Wrench } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useOrdensServico, useTempoMedio } from '@/hooks/queries/use-ordens-servico'
import { formatCurrency, formatDate, STATUS_COLOR, STATUS_LABEL } from '@/lib/utils'
import type { Status } from '@/types'

const STATUS_COUNTS: { status: Status; label: string; icon: React.ElementType; color: string }[] = [
  { status: 'recebida', label: 'Recebidas', icon: ClipboardList, color: 'text-slate-600' },
  { status: 'em_diagnostico', label: 'Em Diagnóstico', icon: Wrench, color: 'text-blue-600' },
  { status: 'aguardando_aprovacao', label: 'Aguardando Aprovação', icon: Clock, color: 'text-yellow-600' },
  { status: 'em_execucao', label: 'Em Execução', icon: Car, color: 'text-orange-600' },
  { status: 'finalizada', label: 'Finalizadas', icon: CheckCircle, color: 'text-green-600' },
  { status: 'entregue', label: 'Entregues', icon: CheckCircle, color: 'text-emerald-600' },
]

export function DashboardPage() {
  const { data: ordens = [] } = useOrdensServico()
  const { data: tempoMedio } = useTempoMedio()

  const countByStatus = (status: Status) => ordens.filter((o) => o.status === status).length
  const recent = [...ordens].sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()).slice(0, 5)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Visão geral da oficina</p>
      </div>

      {/* Tempo médio */}
      {tempoMedio && (
        <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
            <Timer className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">Tempo médio de execução</p>
            <p className="text-xl font-bold text-blue-900">
              {tempoMedio.tempoMedioHoras.toFixed(1)}h
              <span className="text-sm font-normal text-blue-600 ml-2">
                ({tempoMedio.tempoMedioMinutos.toFixed(0)} min)
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Cards por status */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {STATUS_COUNTS.map(({ status, label, icon: Icon, color }) => (
          <Link key={status} to={`/ordens-servico?status=${status}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-500">{label}</CardTitle>
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-slate-900">{countByStatus(status)}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Total geral */}
      <div className="mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total de OS</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{ordens.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ordens de Serviço Recentes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recent.length === 0 ? (
            <p className="text-sm text-slate-500 px-6 pb-6">Nenhuma OS encontrada.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {recent.map((os) => (
                <Link
                  key={os.osId}
                  to={`/ordens-servico/${os.osId}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">{os.cliente.nome}</p>
                    <p className="text-xs text-slate-500">
                      {os.veiculo.placa} · {os.veiculo.marca} {os.veiculo.modelo}
                    </p>
                    <p className="text-xs text-slate-400">{formatDate(os.criadoEm)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge className={STATUS_COLOR[os.status]}>{STATUS_LABEL[os.status]}</Badge>
                    <span className="text-sm font-semibold text-slate-700">{formatCurrency(os.valorFinal)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
