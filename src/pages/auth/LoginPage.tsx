import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight } from 'lucide-react'
import logoOficina from '@/assets/logo-oficina.png'
import { useForm } from 'react-hook-form'
import { Navigate, Link } from 'react-router-dom'
import { z } from 'zod'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'

const schema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(1, 'Senha obrigatória'),
})
type FormValues = z.infer<typeof schema>

const stages = [
  { cls: 's1', num: '01', label: 'Recebida' },
  { cls: 's2', num: '02', label: 'Em diagnóstico' },
  { cls: 's3', num: '03', label: 'Aguardando aprovação' },
  { cls: 's4', num: '04', label: 'Em execução' },
  { cls: 's5', num: '05', label: 'Finalizada' },
  { cls: 's6', num: '06', label: 'Entregue' },
]

export function LoginPage() {
  const { user, login, isLoading } = useAuth()
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
      toast({ title: 'Erro ao entrar', description: 'Email ou senha inválidos.', variant: 'destructive' })
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexWrap: 'wrap', fontFamily: "'IBM Plex Sans', system-ui, sans-serif", color: 'var(--ink)', background: 'var(--bg)' }}>

      <section style={{ flex: '1 1 420px', background: 'var(--sidebar)', color: 'var(--sidebar-text)', padding: 56, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 48 }}>
        <div className="anim-rise anim-d1" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src={logoOficina} alt="Oficina Mecânica" style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
          <span style={{ display: 'flex', flexDirection: 'column' }}>
            <strong style={{ fontFamily: 'Barlow, sans-serif', fontSize: 20, color: '#fff' }}>Oficina Mecânica</strong>
            <span style={{ fontSize: 13, color: '#A8A399' }}>Sistema de gestão</span>
          </span>
        </div>

        <div style={{ maxWidth: 540, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ height: 2, background: 'var(--accent)', width: 64, transformOrigin: 'left', animation: 'grow .9s .4s cubic-bezier(.2,.7,.2,1) both' }} />
          <h1 className="anim-rise anim-d2" style={{ margin: 0, fontFamily: 'Barlow, sans-serif', fontWeight: 700, fontSize: 52, lineHeight: 1.02, letterSpacing: '-0.01em', color: '#fff' }}>
            Cada carro, da entrada à entrega, num só lugar.
          </h1>
          <p className="anim-rise anim-d3" style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: 'var(--sidebar-text)' }}>
            Ordens de serviço, clientes, veículos e estoque de peças e insumos — com o cliente acompanhando o status sem precisar de login.
          </p>
        </div>

        <div className="anim-rise anim-d4" style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 560 }}>
          <span style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--sidebar-label)' }}>Esteira da OS</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8 }}>
            {stages.map(({ cls, num, label }) => (
              <div key={cls} className={`login-stage ${cls}`}>
                <b>{num}</b>{label}
              </div>
            ))}
          </div>
        </div>
      </section>

      <main style={{ flex: '1 1 480px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '56px 24px' }}>
        <div style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 28 }}>

          <div className="anim-rise anim-d2" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h2 style={{ margin: 0, fontFamily: 'Barlow, sans-serif', fontWeight: 700, fontSize: 34, color: 'var(--ink)' }}>Entrar</h2>
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: 15 }}>Acesso para administradores e mecânicos.</p>
          </div>

          <form className="anim-rise anim-d3" onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label htmlFor="email" style={{ fontSize: 14, fontWeight: 600 }}>E-mail</label>
              <input
                id="email"
                type="email"
                placeholder="seu@email.com"
                autoComplete="email"
                style={{ width: '100%', minHeight: 48, padding: '0 14px', border: '1px solid var(--field-border)', borderRadius: 8, background: 'var(--surface)', fontFamily: 'inherit', fontSize: 15, color: 'var(--ink)', outline: 'none', boxSizing: 'border-box', transition: 'border-color .2s, box-shadow .2s' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(194,65,12,.14)' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--field-border)'; e.currentTarget.style.boxShadow = 'none' }}
                {...register('email')}
              />
              {errors.email && <p style={{ margin: 0, fontSize: 13, color: 'var(--danger)' }}>{errors.email.message}</p>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label htmlFor="senha" style={{ fontSize: 14, fontWeight: 600 }}>Senha</label>
              <input
                id="senha"
                type="password"
                placeholder="Sua senha"
                autoComplete="current-password"
                style={{ width: '100%', minHeight: 48, padding: '0 14px', border: '1px solid var(--field-border)', borderRadius: 8, background: 'var(--surface)', fontFamily: 'inherit', fontSize: 15, color: 'var(--ink)', outline: 'none', boxSizing: 'border-box', transition: 'border-color .2s, box-shadow .2s' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 0 4px rgba(194,65,12,.14)' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--field-border)'; e.currentTarget.style.boxShadow = 'none' }}
                {...register('senha')}
              />
              {errors.senha && <p style={{ margin: 0, fontSize: 13, color: 'var(--danger)' }}>{errors.senha.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, minHeight: 48, padding: '0 18px', borderRadius: 8, background: 'var(--accent)', color: '#fff', fontWeight: 600, fontSize: 15, border: 0, fontFamily: 'inherit', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? .7 : 1, transition: 'background .2s, transform .2s' }}
              onMouseEnter={(e) => { if (!isSubmitting) { e.currentTarget.style.background = 'var(--accent-hover)'; e.currentTarget.style.transform = 'translateY(-1px)' } }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.transform = 'none' }}
            >
              {isSubmitting ? 'Entrando…' : 'Entrar'}
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
                <strong style={{ fontSize: 15 }}>É cliente?</strong>
                <span style={{ fontSize: 14, color: 'var(--muted)' }}>Acompanhe sua ordem de serviço sem login</span>
              </span>
              <ArrowRight size={20} aria-hidden="true" style={{ color: 'var(--accent)', flexShrink: 0 }} />
            </Link>
          </div>

        </div>
      </main>

    </div>
  )
}
