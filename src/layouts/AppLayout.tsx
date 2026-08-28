import {
  Car,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  Users,
  Wrench,
  Zap,
} from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/ordens-servico', label: 'Ordens de Serviço', icon: ClipboardList },
  { href: '/clientes', label: 'Clientes', icon: Users },
  { href: '/veiculos', label: 'Veículos', icon: Car },
  { href: '/usuarios', label: 'Usuários', icon: Settings },
  { href: '/servicos', label: 'Serviços', icon: Wrench },
  { href: '/pecas', label: 'Peças', icon: Package },
  { href: '/insumos', label: 'Insumos', icon: Zap },
]

export function AppLayout() {
  const { user, logout, isLoading } = useAuth()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  if (isLoading) return <div className="flex h-screen items-center justify-center text-slate-500">Carregando...</div>
  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <aside
        className={cn(
          'flex flex-col bg-slate-900 text-slate-100 transition-all duration-200',
          collapsed ? 'w-16' : 'w-60',
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center">
                <Wrench className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-sm">Oficina</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="rounded-md p-1.5 hover:bg-slate-800 transition-colors ml-auto"
          >
            <ChevronRight className={cn('h-4 w-4 transition-transform', !collapsed && 'rotate-180')} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = href === '/' ? location.pathname === '/' : location.pathname.startsWith(href)
            return (
              <Link
                key={href}
                to={href}
                title={label}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                  active
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100',
                  collapsed && 'justify-center px-2',
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-2 border-t border-slate-800">
          <button
            onClick={logout}
            title="Sair"
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors',
              collapsed && 'justify-center px-2',
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
