import { ArrowRight, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import { StatusPill } from '@/components/StatusPill'
import { useOrdensServico, useTempoMedio } from '@/hooks/queries/use-ordens-servico'
import { formatCurrency, formatDate, STATUS_ORDER } from '@/lib/utils'
import type { Status } from '@/types'

type EsteirastageKey = 'recebida' | 'em_diagnostico' | 'aguardando_aprovacao' | 'em_execucao' | 'finalizada' | 'entregue'

const ESTEIRA_NUMS: Record<EsteirastageKey, string> = {
  recebida: '01',
  em_diagnostico: '02',
  aguardando_aprovacao: '03',
  em_execucao: '04',
  finalizada: '05',
  entregue: '06',
}

export function DashboardPage() {
  const { t } = useTranslation()
  const { data: ordens = [] } = useOrdensServico()
  const { data: tempoMedio } = useTempoMedio()

  const countByStatus = (s: Status) => ordens.filter((o) => o.status === s).length

  const emAndamento = ordens.filter(
    (o) => !['finalizada', 'entregue', 'rejeitada'].includes(o.status),
  ).length

  const aguardando = countByStatus('aguardando_aprovacao')
  const entregues  = countByStatus('entregue')

  const esteiraKeys = STATUS_ORDER.slice(0, 6) as EsteirastageKey[]
  const esteraCounts = esteiraKeys.map((s) => countByStatus(s as Status))
  const maxCount = Math.max(...esteraCounts, 1)

  const recent = [...ordens]
    .sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime())
    .slice(0, 6)

  const tempoLabel = tempoMedio
    ? `${tempoMedio.tempoMedioHoras.toFixed(1)} h`
    : '—'
  const tempoSub = tempoMedio
    ? t('dashboard.kpiAvgTimeDetail', { min: tempoMedio.tempoMedioMinutos.toFixed(0) })
    : t('dashboard.kpiNoFinalized')

  const kpis = [
    { label: t('dashboard.kpiInProgress'), value: emAndamento, sub: t('dashboard.kpiOfTotal', { count: ordens.length }) },
    { label: t('dashboard.kpiAvgTime'), value: tempoLabel, sub: tempoSub },
    { label: t('dashboard.kpiAwaiting'), value: aguardando, sub: aguardando === 0 ? t('dashboard.kpiNoPending') : t('dashboard.kpiQuoteAwaiting') },
    { label: t('dashboard.kpiDelivered'), value: entregues, sub: t('dashboard.kpiCarsReturn') },
  ]

  return (
    <div className="page-body">
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>

        <PageHeader
          className="anim-rise anim-d1"
          eyebrow={t('dashboard.eyebrow')}
          title={t('dashboard.title')}
          description={t('dashboard.description')}
          action={
            <Link
              to="/ordens-servico"
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 44, padding: '0 18px', borderRadius: 8, background: 'var(--accent)', color: '#fff', fontWeight: 600, fontSize: 14, textDecoration: 'none', transition: 'background .2s, transform .2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-hover)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.transform = 'none' }}
            >
              <Plus size={18} aria-hidden="true" style={{ transition: 'transform .3s' }} />
              {t('dashboard.newWO')}
            </Link>
          }
        />

        <div className="anim-rise anim-d2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {kpis.map(({ label, value, sub }) => (
            <div
              key={label}
              style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, padding: 22, display: 'flex', flexDirection: 'column', gap: 6, transition: 'transform .25s, border-color .25s', cursor: 'default' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = '#CFCAC0' }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'var(--line)' }}
            >
              <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 500 }}>{label}</span>
              <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 700, fontSize: 40, lineHeight: 1.1, letterSpacing: '-0.01em', color: 'var(--ink)' }}>{value}</span>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>{sub}</span>
            </div>
          ))}
        </div>

        <section
          className="anim-rise anim-d3"
          aria-labelledby="esteira-titulo"
          style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h2 id="esteira-titulo" style={{ margin: 0, fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: 22 }}>{t('dashboard.pipeline')}</h2>
              <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse-accent 1.8s infinite', flexShrink: 0 }} />
            </div>
            <Link
              to="/ordens-servico"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, minHeight: 44, fontSize: 14, fontWeight: 600, textDecoration: 'none', color: 'var(--accent)', transition: 'color .2s' }}
            >
              {t('dashboard.viewAll')}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
            {esteiraKeys.map((status, i) => {
              const count = esteraCounts[i]
              const active = count > 0
              const pct = `${Math.round((count / maxCount) * 100)}%`
              return (
                <Link
                  key={status}
                  to={`/ordens-servico?status=${status}`}
                  style={{
                    display: 'flex', flexDirection: 'column', gap: 10, padding: 16,
                    border: `1px solid ${active ? 'var(--accent)' : 'var(--line)'}`,
                    borderRadius: 10, textDecoration: 'none', color: 'var(--ink)',
                    background: active ? 'var(--accent-soft-bg)' : 'transparent',
                    minHeight: 44, transition: 'border-color .2s, transform .2s, background .2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; if (!active) e.currentTarget.style.borderColor = 'var(--accent)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; if (!active) e.currentTarget.style.borderColor = 'var(--line)' }}
                >
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: active ? 'var(--accent-hover)' : 'var(--muted)' }}>
                    {ESTEIRA_NUMS[status]} · {t(`dashboard.stages.${status}`)}
                  </span>
                  <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 700, fontSize: 34, lineHeight: 1, color: 'var(--ink)' }}>
                    {count}
                  </span>
                  <div style={{ height: 4, background: 'var(--line-soft)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: 'var(--accent)', width: pct, transformOrigin: 'left', animation: 'grow 1.1s .5s cubic-bezier(.2,.7,.2,1) both' }} />
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {recent.length > 0 && (
          <section
            className="anim-rise anim-d4"
            aria-labelledby="recentes-titulo"
            style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden' }}
          >
            <div style={{ padding: '20px 20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 id="recentes-titulo" style={{ margin: 0, fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: 22 }}>{t('dashboard.recentOrders')}</h2>
            </div>
            {recent.map((os, i) => (
              <Link
                key={os.osId}
                to={`/ordens-servico/${os.osId}`}
                className="dashboard-row"
                style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px 24px', padding: '14px 20px', textDecoration: 'none', color: 'var(--ink)', borderTop: '1px solid var(--line-soft)', transition: 'background .15s', animationDelay: `${0.47 + i * 0.06}s` }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-muted)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{ flex: '1 1 180px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <strong style={{ fontSize: 15 }}>{os.cliente.nome}</strong>
                  <span style={{ fontSize: 13, color: 'var(--muted)' }}>{t('dashboard.mechanic')} {os.mecanico.nome}</span>
                </span>
                <span style={{ flex: '1 1 160px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, padding: '2px 8px', border: '1.5px solid var(--ink)', borderRadius: 5, background: 'var(--surface)', letterSpacing: '.04em' }}>
                    {os.veiculo.placa}
                  </span>
                  <span style={{ fontSize: 14, color: 'var(--ink-2)' }}>{os.veiculo.marca} {os.veiculo.modelo}</span>
                </span>
                <StatusPill status={os.status} />
                <span style={{ flex: '0 1 140px', fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: 'var(--muted)' }}>
                  {formatDate(os.criadoEm)}
                </span>
                <strong style={{ flex: '0 0 90px', textAlign: 'right', fontSize: 15 }}>{formatCurrency(os.valorFinal)}</strong>
                <ArrowRight size={18} aria-hidden="true" style={{ color: 'var(--muted)', transition: 'transform .25s, color .25s', flexShrink: 0 }} />
              </Link>
            ))}
          </section>
        )}

      </div>
    </div>
  )
}
