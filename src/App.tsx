import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { ToastContainer } from './components/ToastContainer';

// Public & Auth Pages
import { LandingPage } from './pages/LandingPage';
import { SplashScreen } from './pages/SplashScreen';
import { OnboardingPage } from './pages/OnboardingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// Farmer Pages
import { FarmerHomePage } from './pages/FarmerHomePage';
import { DiscoveryPage } from './pages/DiscoveryPage';
import { FacilityDetailPage } from './pages/FacilityDetailPage';
import { BookingWizardPage } from './pages/BookingWizardPage';
import { BookingConfirmationPage } from './pages/BookingConfirmationPage';
import { FarmerBookingsPage } from './pages/FarmerBookingsPage';
import { FarmerInventoryPage } from './pages/FarmerInventoryPage';
import { FarmerDryInventoryPage } from './pages/FarmerDryInventoryPage';
import { CapacityConflictPage } from './pages/CapacityConflictPage';
import { AIPriceArbitragePage } from './pages/AIPriceArbitragePage';
import { LiveInspectionPage } from './pages/LiveInspectionPage';
import { FeedbackRevisitPage } from './pages/FeedbackRevisitPage';

// Storage Owner Pages
import { OwnerDashboardPage } from './pages/OwnerDashboardPage';
import { OwnerBookingsPage } from './pages/OwnerBookingsPage';
import { OwnerInventoryPage } from './pages/OwnerInventoryPage';
import { StockNewBatchPage } from './pages/StockNewBatchPage';
import { StockIntakePage } from './pages/StockIntakePage';
import { StockWithdrawalPage } from './pages/StockWithdrawalPage';
import { StockTransferPage } from './pages/StockTransferPage';
import { StockAdjustmentPage } from './pages/StockAdjustmentPage';
import { InventoryHistoryPage } from './pages/InventoryHistoryPage';
import { StorageLocationsPage } from './pages/StorageLocationsPage';
import { AIInsightsPage } from './pages/AIInsightsPage';

// Administrator Pages
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AuditLogPage } from './pages/AuditLogPage';

// Common Pages
import { ActivityAlertsPage } from './pages/ActivityAlertsPage';
import { ProfileSettingsPage } from './pages/ProfileSettingsPage';
import { StyleGuidePage } from './pages/StyleGuidePage';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const hideChrome =
    location.pathname === '/' ||
    location.pathname === '/splash' ||
    location.pathname === '/onboarding' ||
    location.pathname === '/welcome' ||
    location.pathname === '/login' ||
    location.pathname === '/register';

  const pageRendersOwnHeader = location.pathname === '/capacity-conflict';

  return (
    <div className="min-h-screen bg-[#EDE8DE] sm:py-4 flex justify-center items-start antialiased selection:bg-[#C8923A]/30">
      <div className="mobile-viewport relative flex flex-col min-h-screen bg-[#F7F4EC] shadow-[0_16px_48px_rgba(15,61,46,0.16)] sm:rounded-[36px] overflow-hidden w-full max-w-5xl">
        <ToastContainer />
        {!hideChrome && !pageRendersOwnHeader && <Header />}
        <main className="flex-1 w-full">{children}</main>
        {!hideChrome && <BottomNav />}
      </div>
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Layout>
          <Routes>
            {/* Public & Auth */}
            <Route path="/" element={<SplashScreen />} />
            <Route path="/welcome" element={<LandingPage />} />
            <Route path="/splash" element={<SplashScreen />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Farmer Core Workflows */}
            <Route path="/farmer/home" element={<FarmerHomePage />} />
            <Route path="/discovery" element={<DiscoveryPage />} />
            <Route path="/facility/:facilityId" element={<FacilityDetailPage />} />
            <Route path="/wizard" element={<BookingWizardPage />} />
            <Route path="/booking/:bookingCode/confirmation" element={<BookingConfirmationPage />} />
            <Route path="/farmer/bookings" element={<FarmerBookingsPage />} />
            <Route path="/farmer/inventory" element={<FarmerInventoryPage />} />
            <Route path="/farmer/dry-inventory" element={<FarmerDryInventoryPage />} />
            <Route path="/capacity-conflict" element={<CapacityConflictPage />} />
            <Route path="/ai-arbitrage" element={<AIPriceArbitragePage />} />
            <Route path="/live-inspection/:batchCode" element={<LiveInspectionPage />} />
            <Route path="/feedback-revisit/:bookingCode" element={<FeedbackRevisitPage />} />

            {/* Storage Owner Core Workflows (Independent Inventory & Capacity) */}
            <Route path="/owner/dashboard" element={<OwnerDashboardPage />} />
            <Route path="/owner/bookings" element={<OwnerBookingsPage />} />
            <Route path="/owner/inventory" element={<OwnerInventoryPage />} />
            <Route path="/owner/inventory/new" element={<StockNewBatchPage />} />
            <Route path="/owner/inventory/intake" element={<StockIntakePage />} />
            <Route path="/owner/inventory/withdrawal" element={<StockWithdrawalPage />} />
            <Route path="/owner/inventory/transfer" element={<StockTransferPage />} />
            <Route path="/owner/inventory/adjust" element={<StockAdjustmentPage />} />
            <Route path="/owner/inventory/history" element={<InventoryHistoryPage />} />
            <Route path="/owner/locations" element={<StorageLocationsPage />} />
            <Route path="/owner/ai-insights" element={<AIInsightsPage />} />
            <Route path="/central/inventory" element={<OwnerInventoryPage />} />

            {/* Administrator Platform Workflows */}
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/audit" element={<AuditLogPage />} />

            {/* Common */}
            <Route path="/activity" element={<ActivityAlertsPage />} />
            <Route path="/profile" element={<ProfileSettingsPage />} />
            <Route path="/style-guide" element={<StyleGuidePage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </HashRouter>
    </AppProvider>
  );
}

export default App;
