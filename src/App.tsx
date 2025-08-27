import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router';
import withRole from './features/auth/components/WithRole.tsx';

const LoadingFallback = () => (
  <div className="flex justify-center items-center h-screen w-full">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-dark"></div>
  </div>
);


// Layout y Auth
const Login = lazy(() => import('./features/auth/LoginPage.tsx'));
const Layout = lazy(() => import('./shared/components/layout/index.tsx'));
const ProtectedRoute = lazy(() => import('./features/auth/components/ProtectedRoute.tsx'));

// Vistas Principales (Páginas)
const HarvestView = lazy(() => import('./features/harvest/HarvestPage.tsx'));
const Reports = lazy(() => import('./features/reports/ReportsPage.tsx'));
const HarvestListView = lazy(() => import('./features/harvest/HarvestSessionsPage.tsx'));
const HarvestDetail = lazy(() => import('./features/harvest/HarvestSessionDetailsPage.tsx'));
const SiloBagsView = lazy(() => import('./features/silobags/SilobagsPage.tsx'));
const SiloBagDetail = lazy(() => import('./features/silobags/SilobagsDetailPage.tsx'));
const Logistics = lazy(() => import('./features/logistics/LogisticsPage.tsx'));

// Secciones de Reportes (Hijos de la ruta /reports)
const HarvestSection = lazy(() => import('./features/reports/components/harvest-report/HarvestSection.tsx'));
const HarvestersSection = lazy(() => import('./features/reports/components/harvester-report/HarvestersSection.tsx'));
const DestinationsSection = lazy(() => import('./features/reports/components/destinations-report/DestinationSection.tsx'));

// Pestañas de Detalles de Cosecha (Hijos de la ruta /harvest-sessions/:id)
const HarvestersTab = lazy(() => import('./features/harvest/HarvestersTab.tsx'));
const RegistersTab = lazy(() => import('./features/harvest/RegistersTab.tsx'));
const SummaryTab = lazy(() => import('./features/harvest/SummaryTab.tsx'));


export default function App() {

  const ReportsWithRole = withRole(Reports, ['admin', 'field-owner', 'superadmin']);

  return (
    // Suspense envuelve todas las rutas, proveyendo un fallback de carga
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<HarvestView />} />

            <Route path="reports" element={<ReportsWithRole />}>
              <Route index element={<HarvestSection />} />
              <Route path="harvests" element={<HarvestSection />} />
              <Route path="harvesters" element={<HarvestersSection />} />
              <Route path="destinations" element={<DestinationsSection />} />
            </Route>

            <Route path="harvest-sessions" element={<HarvestListView />} />
            <Route path="harvest-sessions/:harvestSessionId/details" element={<HarvestDetail onBack={() => window.history.back()} />}>
              <Route index element={<RegistersTab />} />
              <Route path="summary" element={<SummaryTab />} />
              <Route path="registers" element={<RegistersTab />} />
              <Route path="harvesters" element={<HarvestersTab />} />
            </Route>

            <Route path="silo-bags" element={<SiloBagsView />} />
            <Route path='silo-bags/:siloId' element={<SiloBagDetail />} />

            <Route path="logistics" element={<Logistics />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}