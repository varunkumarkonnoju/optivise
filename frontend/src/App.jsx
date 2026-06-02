import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { SettingsProvider } from './hooks/useSettings'
import AppLayout from './components/layout/AppLayout'
import LoginPage from './pages/LoginPage'
import LandingPage from './pages/LandingPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import HelpPage from './pages/HelpPage'
import PrivacyPage from './pages/PrivacyPage'
import ProfilePage from './pages/ProfilePage'
import TermsPage from './pages/TermsPage'
import PricingPage from './pages/PricingPage'
import BillingSuccess from './pages/BillingSuccess'
import DashboardPage from './pages/DashboardPage'
import ABTestingPage from './pages/ABTestingPage'
import AssistantPage from './pages/AssistantPage'
import AnalyticsPage from './pages/AnalyticsPage'
import ProductsPage from './pages/ProductsPage'
import CustomersPage from './pages/CustomersPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import OAuthSuccessPage from './pages/OAuthSuccessPage'
import ShopifyCallbackPage from './pages/ShopifyCallbackPage'
import StoreDiagnosisPage from './pages/StoreDiagnosisPage'
import { InsightsPage, AutomationsPage } from './pages/StubPages'
import SettingsPage from './pages/SettingsPage'
import DescriptionHistoryPage from './pages/DescriptionHistoryPage'
import MarketingPage from './pages/MarketingPage'
import './styles/global.css'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100vh' }}><div className="spinner"/></div>
  if (!user) return <Navigate to="/login" replace />
  return <AppLayout>{children}</AppLayout>
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/home" element={<LandingPage />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/home" replace />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/insights" element={<ProtectedRoute><InsightsPage /></ProtectedRoute>} />
      <Route path="/products" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
      <Route path="/customers" element={<ProtectedRoute><CustomersPage /></ProtectedRoute>} />
      <Route path="/abtesting" element={<ProtectedRoute><ABTestingPage /></ProtectedRoute>} />
      <Route path="/recommendations" element={<Navigate to="/insights" replace />} />
      <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
      <Route path="/automations" element={<ProtectedRoute><AutomationsPage /></ProtectedRoute>} />
      <Route path="/pricing" element={<ProtectedRoute><PricingPage /></ProtectedRoute>} />
      <Route path="/billing/success" element={<BillingSuccess />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/oauth/success" element={<OAuthSuccessPage />} />
      {/* NEW: Shopify OAuth callback — receives code from Shopify, exchanges for token */}
      <Route path="/auth/shopify/callback" element={<ShopifyCallbackPage />} />
      <Route path="/diagnosis" element={<ProtectedRoute><StoreDiagnosisPage /></ProtectedRoute>} />
      <Route path="/assistant" element={<ProtectedRoute><AssistantPage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path="/help" element={<ProtectedRoute><HelpPage /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><DescriptionHistoryPage /></ProtectedRoute>} />
      <Route path="/marketing" element={<ProtectedRoute><MarketingPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </SettingsProvider>
    </AuthProvider>
  )
}