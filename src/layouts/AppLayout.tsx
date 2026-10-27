import {
  Car,
  CircleUser,
  ClipboardList,
  Cog,
  Droplets,
  LayoutDashboard,
  LogOut,
  Users,
  Wrench,
} from 'lucide-react'
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import logoOficina from '@/assets/logo-oficina.png'
import { AvatarInitials } from '@/components/Avatar'
import { useAuth } from '@/hooks/use-auth'
import { cn, ROLES_LABEL } from '@/lib/utils'

function parseJwtPayload(token: string): Record<string, unknown> {
  try {
    return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
  } catch {
    return {}
  }
}

const groups = [
  {
    label: 'Operação',
    items: [
      { href: '/', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/ordens-servico', label: 'Ordens de serviço', icon: ClipboardList },
    ],
  },
  {
    label: 'Cadastros',
    items: [
      { href: '/clientes', label: 'Clientes', icon: Users },
      { href: '/veiculos', label: 'Veículos', icon: Car },
      { href: '/usuarios', label: 'Usuários', icon: CircleUser },
    ],
  },
  {
    label: 'Catálogo e estoque',
    items: [
      { href: '/servicos', label: 'Serviços', icon: Wrench },
      { href: '/pecas', label: 'Peças', icon: Cog },
      { href: '/insumos', label: 'Insumos', icon: Droplets },
    ],
  },
]

export function AppLayout() {
  const { user, logout, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: 'var(--bg)', color: 'var(--muted)' }}>
        Carregando…
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />

  const payload = parseJwtPayload(user.accessToken)
  const userName = (payload.nome as string) || (payload.name as string) || 'Usuário'
  const userRole = ROLES_LABEL[(payload.roles as string) || ''] || 'Sistema'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexWrap: 'wrap', background: 'var(--bg)' }}>
      <a href="#main-content" className="skip-link">Ir para o conteúdo</a>
      <nav
        aria-label="Menu principal"
        className="app-sidebar"
        style={{
          flex: '1 1 248px',
          background: 'var(--sidebar)',
          color: 'var(--sidebar-text)',
          padding: '20px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 8px 12px' }}>
          <img
            src={logoOficina}
            alt="Oficina Mecânica"
            style={{ width: 36, height: 36, borderRadius: 9, objectFit: 'cover', flexShrink: 0 }}
          />
          <span style={{ display: 'flex', flexDirection: 'column' }}>
            <strong style={{ fontFamily: 'Barlow, sans-serif', fontSize: 18, color: '#fff' }}>
              Oficina
            </strong>
            <span style={{ fontSize: 12, color: '#A8A399' }}>Sistema de gestão</span>
          </span>
        </div>

        {groups.map((group) => (
          <div key={group.label}>
            <div
              style={{
                fontSize: 11,
                letterSpacing: '.1em',
                textTransform: 'uppercase',
                fontWeight: 600,
                color: 'var(--sidebar-label)',
                padding: '18px 12px 6px',
              }}
            >
              {group.label}
            </div>
            {group.items.map(({ href, label, icon: Icon }) => {
              const active =
                href === '/' ? location.pathname === '/' : location.pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  to={href}
                  aria-current={active ? 'page' : undefined}
                  title={label}
                  className={cn('sidebar-nav-item', active && 'active')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    minHeight: 44,
                    padding: '0 12px',
                    borderRadius: 8,
                    textDecoration: 'none',
                    fontSize: 14,
                    fontWeight: 500,
                    color: active ? '#fff' : 'var(--sidebar-text)',
                    background: active ? 'var(--sidebar-active)' : 'transparent',
                    transition: 'background .2s, color .2s',
                  }}
                >
                  <Icon
                    size={18}
                    aria-hidden="true"
                    style={{
                      flexShrink: 0,
                      color: active ? 'var(--accent-bright)' : 'currentColor',
                      transition: 'color .2s, transform .25s',
                    }}
                  />
                  {label}
                </Link>
              )
            })}
          </div>
        ))}

        <div
          style={{
            marginTop: 'auto',
            paddingTop: 16,
            borderTop: '1px solid #34322D',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <AvatarInitials name={userName} variant="sidebar" size="sm" />
          <span style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <strong style={{ fontSize: 14, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {userName}
            </strong>
            <span style={{ fontSize: 12, color: '#A8A399' }}>{userRole}</span>
          </span>
          <button
            type="button"
            onClick={logout}
            aria-label="Sair"
            style={{
              width: 44,
              height: 44,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8,
              border: 0,
              background: 'transparent',
              color: 'var(--sidebar-text)',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'background .2s, color .2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--sidebar-hover)'
              e.currentTarget.style.color = '#fff'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = 'var(--sidebar-text)'
            }}
          >
            <LogOut size={18} aria-hidden="true" />
          </button>
        </div>
      </nav>

      <main
        id="main-content"
        style={{
          flex: '999 1 560px',
          minWidth: 0,
          overflowY: 'auto',
          minHeight: '100vh',
        }}
      >
        <Outlet />
      </main>
    </div>
  )
}
