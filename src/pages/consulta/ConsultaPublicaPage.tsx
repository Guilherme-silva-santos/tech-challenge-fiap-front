import { useState } from 'react'
import { useOrdemServicoPublica } from '@/hooks/queries/use-ordens-servico'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatCurrency, formatDate, STATUS_COLOR, STATUS_LABEL } from '@/lib/utils'
import type { OrdemServico } from '@/types'
import { CheckCircle2, ChevronRight, Wrench } from 'lucide-react'
import { STATUS_ORDER } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { Status } from '@/types'

function StatusBar({ current }: { current: Status }) {
  const currentIdx = STATUS_ORDER.indexOf(current)
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {STATUS_ORDER.map((s, i) => {
        const done = i <= currentIdx
        const active = s === current
        return (
          <div key={s} className="flex items-center gap-1">
            <div className={cn(
              'flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
              active ? 'bg-blue-600 text-white' : done ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400',
            )}>
              {done && !active && <CheckCircle2 className="h-3 w-3" />}
              {STATUS_LABEL[s]}
            </div>
            {i < STATUS_ORDER.length - 1 && <ChevronRight className={cn('h-3 w-3', i < currentIdx ? 'text-green-400' : 'text-slate-300')} />}
          </div>
        )
      })}
    </div>
  )
}

export function ConsultaPublicaPage() {
  const [osId, setOsId] = useState('')
  const [numDocumento, setNumDocumento] = useState('')
  const [result, setResult] = useState<OrdemServico | null>(null)
  const [error, setError] = useState('')

  const consultaMutation = useOrdemServicoPublica()

  const handleSearch = () => {
    if (!osId.trim() || !numDocumento.trim()) {
      setError('Preencha o ID da OS e o CPF/CNPJ.')
      return
    }
    setError('')
    setResult(null)
    consultaMutation.mutate(
      { id: osId.trim(), numDocumento: numDocumento.trim() },
      {
        onSuccess: (data) => setResult(data),
        onError: () => setError('OS não encontrada ou CPF/CNPJ incorreto.'),
      },
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 flex items-start justify-center p-6 pt-16">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg mb-4">
            <Wrench className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Consulta de Ordem de Serviço</h1>
          <p className="text-slate-400 text-sm mt-1">Acompanhe o status do seu veículo sem precisar fazer login</p>
        </div>

        {/* Form */}
        <Card className="mb-6">
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-1.5">
              <Label>ID da Ordem de Serviço</Label>
              <Input
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                value={osId}
                onChange={(e) => setOsId(e.target.value)}
                className="font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label>CPF / CNPJ do titular</Label>
              <Input
                placeholder="111.444.777-35 ou 00.000.000/0001-00"
                value={numDocumento}
                onChange={(e) => setNumDocumento(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button className="w-full" onClick={handleSearch} disabled={consultaMutation.isPending}>
              {consultaMutation.isPending ? 'Consultando...' : 'Consultar'}
            </Button>
          </CardContent>
        </Card>

        {/* Result */}
        {result && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Resultado</CardTitle>
                <Badge className={STATUS_COLOR[result.status]}>{STATUS_LABEL[result.status]}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status timeline */}
              <StatusBar current={result.status} />

              {/* Dados */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 text-xs">Veículo</p>
                  <p className="font-mono font-bold">{result.veiculo.placa}</p>
                  <p className="text-slate-600">{result.veiculo.marca} {result.veiculo.modelo}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Valor Estimado</p>
                  <p className="text-2xl font-bold text-slate-900">{formatCurrency(result.valorFinal)}</p>
                </div>
              </div>

              {/* Histórico */}
              {result.historicoStatus.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Histórico</p>
                  <div className="space-y-2">
                    {result.historicoStatus.map((h) => (
                      <div key={h.id} className="flex items-center gap-3 text-sm">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                        <span className="flex-1">
                          {h.statusAnterior
                            ? `${STATUS_LABEL[h.statusAnterior]} → ${STATUS_LABEL[h.statusNovo]}`
                            : `Criado como: ${STATUS_LABEL[h.statusNovo]}`}
                        </span>
                        <span className="text-slate-400 text-xs">{formatDate(h.criadoEm)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-slate-400 text-center">
                Tem alguma dúvida?{' '}
                <a href="/login" className="text-blue-600 hover:underline">Acesse o sistema</a>
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
