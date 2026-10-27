import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight } from 'lucide-react'
import logoOficina from '@/assets/logo-oficina.png'
import { useId } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Navigate, Link } from 'react-router-dom'
import { z } from 'zod'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'

const schema = z.object({
  email: z.string().email('auth.emailInvalid'),
  senha: z.string().min(1, 'auth.passwordRequired'),
})
type FormValues = z.infer<typeof schema>

const stages = [
  { cls: 's1', num: '01', key: 's1' },
  { cls: 's2', num: '02', key: 's2' },
  { cls: 's3', num: '03', key: 's3' },
  { cls: 's4', num: '04', key: 's4' },
  { cls: 's5', num: '05', key: 's5' },
  { cls: 's6', num: '06', key: 's6' },
]

export function LoginPage() {
  const { t } = useTranslation()
  const { user, login, isLoading } = useAuth()
  const emailId = useId()
  const senhaId = useId()
  const emailErrId = useId()
  const senhaErrId = useId()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  if (!isLoading && user) return <Navigate to="/" replace />

  const onSubmit = async (values: FormValues) => {
    try {
      await login(values.email, values.senha)
    } catch {
      toast({ title: t('auth.errorTitle'), description: t('auth.errorDesc'), variant: 'destructive' })
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexWrap: 'wrap', fontFamily: "'IBM Plex Sans', system-ui, sans-serif", color: 'var(--ink)', background: 'var(--bg)' }}>

      <section
        aria-label={t('auth.heroTitle')}
        style={{ flex: '1 1 420px', background: 'var(--sidebar)', color: 'var(--sidebar-text)', padding: 56, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 48 }}
      >
        <div className="anim-rise anim-d1" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src={logoOficina} alt={t('auth.logoAlt')} style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
          <span style={{ display: 'flex', flexDirection: 'column' }}>
            <strong style={{ fontFamily: 'Barlow, sans-serif', fontSize: 20, color: '#fff' }}>{t('auth.logoAlt')}</strong>
            <span style={{ fontSize: 13, color: '#A8A399' }}>{t('common.system')}</span>
          </span>
        </div>

        <div style={{ maxWidth: 540, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ height: 2, background: 'var(--accent)', width: 64, transformOrigin: 'left', animation: 'grow .9s .4s cubic-bezier(.2,.7,.2,1) both' }} />
          <h1 className="anim-rise anim-d2" style={{ margin: 0, fontFamily: 'Barlow, sans-serif', fontWeight: 700, fontSize: 52, lineHeight: 1.02, letterSpacing: '-0.01em', color: '#fff' }}>
            {t('auth.heroTitle')}
          </h1>
          <p className="anim-rise anim-d3" style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: 'var(--sidebar-text)' }}>
            {t('auth.heroDesc')}
          </p>
        </div>

        <div className="anim-rise anim-d4" style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 560 }}>
          <span style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--sidebar-label)' }}>{t('auth.pipelineLabel')}</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8 }}>
            {stages.map(({ cls, num, key }) => (
              <div key={cls} className={`login-stage ${cls}`}>
                <b>{num}</b>{t(`auth.stages.${key}`)}
              </div>
            ))}
          </div>
        </div>
      </section>

      <main style={{ flex: '1 1 480px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '56px 24px' }}>
        <div style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 28 }}>

          <div className="anim-rise anim-d2" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h2 style={{ margin: 0, fontFamily: 'Barlow, sans-serif', fontWeight: 700, fontSize: 34, color: 'var(--ink)' }}>{t('auth.title')}</h2>
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: 15 }}>{t('auth.subtitle')}</p>
          </div>

          <form className="anim-rise anim-d3" onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label htmlFor={emailId} style={{ fontSize: 14, fontWeight: 600 }}>{t('auth.email')}</label>
              <input
                id={emailId}
                type="email"
                placeholder={t('auth.emailPlaceholder')}
                autoComplete="email"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? emailErrId : undefined}
                style={{ width: '100%', minHeight: 48, padding: '0 14px', border: `1px solid ${errors.email ? 'var(--danger)' : 'var(--field-border)'}`, borderRadius: 8, background: 'var(--surface)', fontFamily: 'inherit', fontSize: 15, color: 'var(--ink)', outline: 'none', boxSizing: 'border-box', transition: 'border-color .2s, box-shadow .2s' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(194,65,12,.14)' }}
                {...register('email')}
              />
              {errors.email && <p id={emailErrId} role="alert" style={{ margin: 0, fontSize: 13, color: 'var(--danger)' }}>{t('validation.emailInvalid')}</p>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label htmlFor={senhaId} style={{ fontSize: 14, fontWeight: 600 }}>{t('auth.password')}</label>
              <input
                id={senhaId}
                type="password"
                placeholder={t('auth.passwordPlaceholder')}
                autoComplete="current-password"
                aria-invalid={!!errors.senha}
                aria-describedby={errors.senha ? senhaErrId : undefined}
                style={{ width: '100%', minHeight: 48, padding: '0 14px', border: `1px solid ${errors.senha ? 'var(--danger)' : 'var(--field-border)'}`, borderRadius: 8, background: 'var(--surface)', fontFamily: 'inherit', fontSize: 15, color: 'var(--ink)', outline: 'none', boxSizing: 'border-box', transition: 'border-color .2s, box-shadow .2s' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(194,65,12,.14)' }}
                {...register('senha')}
              />
              {errors.senha && <p id={senhaErrId} role="alert" style={{ margin: 0, fontSize: 13, color: 'var(--danger)' }}>{t('validation.passwordRequired')}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, minHeight: 48, padding: '0 18px', borderRadius: 8, background: 'var(--accent)', color: '#fff', fontWeight: 600, fontSize: 15, border: 0, fontFamily: 'inherit', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? .7 : 1, transition: 'background .2s, transform .2s' }}
              onMouseEnter={(e) => { if (!isSubmitting) { e.currentTarget.style.background = 'var(--accent-hover)'; e.currentTarget.style.transform = 'translateY(-1px)' } }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.transform = 'none' }}
            >
              {isSubmitting ? t('auth.submitting') : t('auth.submit')}
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </form>

          <div className="anim-rise anim-d5" style={{ borderTop: '1px solid var(--line)', paddingTop: 24 }}>
            <Link
              to="/consulta"
              className="login-card-link"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '16px 18px', border: '1px solid var(--line)', borderRadius: 10, background: 'var(--surface)', textDecoration: 'none', color: 'var(--ink)' }}
            >
              <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <strong style={{ fontSize: 15 }}>{t('auth.clientTitle')}</strong>
                <span style={{ fontSize: 14, color: 'var(--muted)' }}>{t('auth.clientDesc')}</span>
              </span>
              <ArrowRight size={20} aria-hidden="true" style={{ color: 'var(--accent)', flexShrink: 0 }} />
            </Link>
          </div>

        </div>
      </main>

    </div>
  )
}
