import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { ToastContainer } from './components/ToastContainer';

import { ServiceSelectionPage } from './pages/ServiceSelectionPage';
import { FarmerHomePage } from './pages/FarmerHomePage';
import { DiscoveryPage } from './pages/DiscoveryPage';
import { FacilityDetailPage } from './pages/FacilityDetailPage';
import { BookingWizardPage } from './pages/BookingWizardPage';
import { BookingConfirmationPage } from './pages/BookingConfirmationPage';
import { FarmerInventoryPage } from './pages/FarmerInventoryPage';
import { CapacityConflictPage } from './pages/CapacityConflictPage';
import { AIPriceArbitragePage } from './pages/AIPriceArbitragePage';
import { LiveInspectionPage } from './pages/LiveInspectionPage';
import { FeedbackRevisitPage } from './pages/FeedbackRevisitPage';
import { OwnerDashboardPage } from './pages/OwnerDashboardPage';
import { CentralInventoryPage } from './pages/CentralInventoryPage';
import { ActivityAlertsPage } from './pages/ActivityAlertsPage';
import { ProfileSettingsPage } from './pages/ProfileSettingsPage';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const hideChrome = location.pathname === '/service-selection';

  return (
    <>
      <ToastContainer />
      {!hideChrome && <Header />}
      <main className="min-h-screen">{children}</main>
      {!hideChrome && <BottomNav />}
    </>
  );
};

export function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<FarmerHomePage />} />
            <Route path="/service-selection" element={<ServiceSelectionPage />} />
            <Route path="/farmer/home" element={<FarmerHomePage />} />
            <Route path="/discovery" element={<DiscoveryPage />} />
            <Route path="/facility/:facilityId" element={<FacilityDetailPage />} />
            <Route path="/wizard" element={<BookingWizardPage />} />
            <Route path="/booking/:bookingCode/confirmation" element={<BookingConfirmationPage />} />
            <Route path="/farmer/inventory" element={<FarmerInventoryPage />} />
            <Route path="/capacity-conflict" element={<CapacityConflictPage />} />
            <Route path="/ai-arbitrage" element={<AIPriceArbitragePage />} />
            <Route path="/live-inspection/:batchCode" element={<LiveInspectionPage />} />
            <Route path="/feedback-revisit/:bookingCode" element={<FeedbackRevisitPage />} />
            <Route path="/owner/dashboard" element={<OwnerDashboardPage />} />
            <Route path="/central/inventory" element={<CentralInventoryPage />} />
            <Route path="/activity" element={<ActivityAlertsPage />} />
            <Route path="/profile" element={<ProfileSettingsPage />} />
            <Route path="*" element={<Navigate to="/farmer/home" replace />} />
          </Routes>
        </Layout>
      </HashRouter>
    </AppProvider>
  );
}

export default App;
