import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/hooks/use-auth'
import { AppLayout } from '@/layouts/AppLayout'
import { ConsultaPublicaPage } from '@/pages/consulta/ConsultaPublicaPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { ClientesPage } from '@/pages/clientes/ClientesPage'
import { InsumosPage } from '@/pages/insumos/InsumosPage'
import { OrdemServicoDetailPage } from '@/pages/ordens-servico/OrdemServicoDetailPage'
import { OrdensServicoPage } from '@/pages/ordens-servico/OrdensServicoPage'
import { PecasPage } from '@/pages/pecas/PecasPage'
import { ServicosPage } from '@/pages/servicos/ServicosPage'
import { UsuariosPage } from '@/pages/usuarios/UsuariosPage'
import { VeiculosPage } from '@/pages/veiculos/VeiculosPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/consulta" element={<ConsultaPublicaPage />} />
            <Route element={<AppLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/clientes" element={<ClientesPage />} />
              <Route path="/veiculos" element={<VeiculosPage />} />
              <Route path="/usuarios" element={<UsuariosPage />} />
              <Route path="/insumos" element={<InsumosPage />} />
              <Route path="/pecas" element={<PecasPage />} />
              <Route path="/servicos" element={<ServicosPage />} />
              <Route path="/ordens-servico" element={<OrdensServicoPage />} />
              <Route path="/ordens-servico/:id" element={<OrdemServicoDetailPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  )
}
