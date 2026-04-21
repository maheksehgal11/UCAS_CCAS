import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { authStore } from './lib/api'
import { BillingPage } from './pages/BillingPage'
import { CustomersPage } from './pages/CustomersPage'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import {
  AnalyticsPage,
  CollectionsPage,
  CpqPage,
  OrdersPage,
  PartnersPage,
  PaymentsPage,
  RatingPage,
  RevenuePage,
  SettingsPage,
  TenantsPage,
} from './pages/OperationsPages'
import { ProductsPage } from './pages/ProductsPage'
import { StudioPage } from './pages/StudioPage'
import { SubscriptionsPage } from './pages/SubscriptionsPage'

function ProtectedLayout() {
  // Open access: always render Layout
  return <Layout />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* LoginPage removed for open access */}
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/studio" element={<StudioPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/cpq" element={<CpqPage />} />
          <Route path="/subscriptions" element={<SubscriptionsPage />} />
          <Route path="/billing" element={<BillingPage />} />
          <Route path="/rating" element={<RatingPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/partners" element={<PartnersPage />} />
          <Route path="/revenue" element={<RevenuePage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/tenants" element={<TenantsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Router>
  )
}
