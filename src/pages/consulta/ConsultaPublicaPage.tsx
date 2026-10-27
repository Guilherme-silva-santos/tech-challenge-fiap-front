import { ArrowLeft, Search } from 'lucide-react'
import logoOficina from '@/assets/logo-oficina.png'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { StatusPill } from '@/components/StatusPill'
import { useOrdemServicoPublica } from '@/hooks/queries/use-ordens-servico'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { OrdemServico } from '@/types'

function FieldStyle({ id, value, onChange, placeholder, mono }: { id: string; value: string; onChange: (v: string) => void; placeholder: string; mono?: boolean }) {
  return (
    <input
      id={id}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: '100%', minHeight: 48, padding: '0 14px',
        border: '1px solid var(--field-border)', borderRadius: 8,
        background: 'var(--surface)', fontFamily: mono ? "'IBM Plex Mono', monospace" : 'inherit',
        fontSize: 15, color: 'var(--ink)', outline: 'none', boxSizing: 'border-box',
        transition: 'border-color .2s, box-shadow .2s',
      }}
      onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(194,65,12,.14)' }}
      onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--field-border)'; e.currentTarget.style.boxShadow = 'none' }}
    />
  )
}

function ResultPanel({ result }: { result: OrdemServico }) {
  const { t } = useTranslation()
  return (
    <div className="anim-rise" style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, padding: 28, display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 560 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: 20 }}>{t('consulta.resultTitle')}</span>
        <StatusPill status={result.status} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)' }}>{t('consulta.vehicle')}</span>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 500, fontSize: 15 }}>{result.veiculo.placa}</span>
          <span style={{ fontSize: 14, color: 'var(--ink-2)' }}>{result.veiculo.marca} {result.veiculo.modelo}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)' }}>{t('consulta.estimatedValue')}</span>
          <span style={{ fontFamily: 'Barlow, sans-serif', fontWeight: 700, fontSize: 28, color: 'var(--ink)' }}>{formatCurrency(result.valorFinal)}</span>
        </div>
      </div>

      {result.historicoStatus.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--muted)' }}>{t('consulta.history')}</span>
          {result.historicoStatus.map((h) => (
            <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14 }}>
              <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
              <span style={{ flex: 1, color: 'var(--ink-2)' }}>
                {h.statusAnterior
                  ? t('consulta.transition', { from: t(`status.${h.statusAnterior}`), to: t(`status.${h.statusNovo}`) })
                  : t('consulta.createdAs', { status: t(`status.${h.statusNovo}`) })}
              </span>
              <span style={{ fontSize: 13, color: 'var(--muted)', fontFamily: "'IBM Plex Mono', monospace" }}>
                {formatDate(h.criadoEm)}
              </span>
            </div>
          ))}
        </div>
      )}

      <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)', textAlign: 'center' }}>
        {t('consulta.question')}{' '}
        <Link to="/login" style={{ color: 'var(--accent)' }}>{t('consulta.contact')}</Link>
      </p>
    </div>
  )
}

export function ConsultaPublicaPage() {
  const { t } = useTranslation()
  const [osId, setOsId] = useState('')
  const [numDocumento, setNumDocumento] = useState('')
  const [result, setResult] = useState<OrdemServico | null>(null)
  const [error, setError] = useState('')

  const consultaMutation = useOrdemServicoPublica()

  const handleSearch = () => {
    if (!osId.trim() || !numDocumento.trim()) {
      setError(t('consulta.requiredFields'))
      return
    }
    setError('')
    setResult(null)
    consultaMutation.mutate(
      { id: osId.trim(), numDocumento: numDocumento.trim() },
      {
        onSuccess: (data) => setResult(data),
        onError: () => setError(t('consulta.notFound')),
      },
    )
  }

  const etapas = [
    { num: '01', key: 'recebida' },
    { num: '02', key: 'em_diagnostico' },
    { num: '03', key: 'aguardando_aprovacao', accent: true },
    { num: '04', key: 'em_execucao' },
    { num: '05', key: 'finalizada' },
    { num: '06', key: 'entregue' },
  ]

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'IBM Plex Sans', system-ui, sans-serif", color: 'var(--ink)', background: 'var(--bg)', padding: '32px 24px 64px' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 40 }}>

        <header className="anim-rise anim-d1" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src={logoOficina} alt={t('consulta.logoAlt')} style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
            <strong style={{ fontFamily: 'Barlow, sans-serif', fontSize: 19, color: 'var(--ink)' }}>{t('consulta.logoAlt')}</strong>
          </div>
          <Link
            to="/login"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 44, textDecoration: 'none', color: 'var(--ink-2)', fontWeight: 500, fontSize: 14, transition: 'color .2s' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ink-2)')}
          >
            <ArrowLeft size={18} aria-hidden="true" />
            {t('consulta.backLogin')}
          </Link>
        </header>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 48, alignItems: 'flex-start' }}>

          <section style={{ flex: '999 1 480px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 28 }}>
            <div className="anim-rise anim-d2" style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 560 }}>
              <span style={{ fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--accent-hover)' }}>{t('consulta.title')}</span>
              <h1 style={{ margin: 0, fontFamily: 'Barlow, sans-serif', fontWeight: 700, fontSize: 48, lineHeight: 1.04, letterSpacing: '-0.01em' }}>
                {t('consulta.subtitle')}
              </h1>
              <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: 'var(--muted)' }}>
                {t('consulta.heroDesc')}
              </p>
            </div>

            <div className="anim-rise anim-d3" style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, padding: 28, display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 560 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label htmlFor="os" style={{ fontSize: 14, fontWeight: 600 }}>{t('consulta.osLabel')}</label>
                <FieldStyle id="os" value={osId} onChange={setOsId} placeholder={t('consulta.osPlaceholder')} mono />
                <span style={{ fontSize: 13, color: 'var(--muted)' }}>{t('consulta.osHint')}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label htmlFor="doc" style={{ fontSize: 14, fontWeight: 600 }}>{t('consulta.docLabel')}</label>
                <FieldStyle id="doc" value={numDocumento} onChange={setNumDocumento} placeholder={t('consulta.docPlaceholder')} mono />
              </div>
              {error && <p role="alert" style={{ margin: 0, fontSize: 14, color: 'var(--danger)' }}>{error}</p>}
              <button
                type="button"
                onClick={handleSearch}
                disabled={consultaMutation.isPending}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, minHeight: 48, padding: '0 18px', borderRadius: 8, background: 'var(--accent)', color: '#fff', fontWeight: 600, fontSize: 15, border: 0, fontFamily: 'inherit', cursor: consultaMutation.isPending ? 'not-allowed' : 'pointer', opacity: consultaMutation.isPending ? .7 : 1, transition: 'background .2s, transform .2s' }}
                onMouseEnter={(e) => { if (!consultaMutation.isPending) { e.currentTarget.style.background = 'var(--accent-hover)'; e.currentTarget.style.transform = 'translateY(-1px)' } }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.transform = 'none' }}
              >
                {consultaMutation.isPending ? t('consulta.searching') : t('consulta.searchBtn')}
                <Search size={18} aria-hidden="true" />
              </button>
            </div>

            {result && <ResultPanel result={result} />}
          </section>

          <aside className="anim-rise anim-d4" aria-labelledby="etapas-titulo" style={{ flex: '1 1 320px', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h2 id="etapas-titulo" style={{ margin: 0, fontFamily: 'Barlow, sans-serif', fontWeight: 600, fontSize: 22 }}>{t('consulta.stagesTitle')}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {etapas.map(({ num, key, accent }) => (
                <div key={num} style={{ display: 'grid', gridTemplateColumns: '32px 1fr', gap: 14, alignItems: 'start' }}>
                  <span style={{
                    width: 32, height: 32, borderRadius: '50%',
                    border: `1px solid ${accent ? 'var(--accent)' : 'var(--line)'}`,
                    background: accent ? 'var(--accent-soft-bg)' : 'var(--surface)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: "'IBM Plex Mono', monospace", fontSize: 12,
                    color: accent ? 'var(--accent-hover)' : 'var(--muted)',
                    flexShrink: 0,
                  }}>
                    {num}
                  </span>
                  <div>
                    <strong style={{ fontSize: 15 }}>{t(`status.${key}`)}</strong>
                    <p style={{ margin: '2px 0 0', fontSize: 14, color: 'var(--muted)', lineHeight: 1.5 }}>{t(`consulta.stageDesc_${key}`)}</p>
                  </div>
                </div>
              ))}
            </div>
          </aside>

        </div>
      </div>
    </div>
  )
}
