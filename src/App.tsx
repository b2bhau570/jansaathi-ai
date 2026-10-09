// JANSAATHI AI - Primary Application Root & Router
// Complete route configuration for Public, Patient, Clinical, Admin, and System tiers

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { ClayBackgroundBlobs } from './components/common/ClayBackgroundBlobs';

// Pages
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { SecurityPage } from './pages/SecurityPage';
import { AccessibilityPage } from './pages/AccessibilityPage';
import { ContactPage } from './pages/ContactPage';
import { PatientWorkflowPage } from './pages/PatientWorkflowPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CasesQueuePage } from './pages/CasesQueuePage';
import { CaseDetailPage } from './pages/CaseDetailPage';
import { ReportsQueuePage } from './pages/ReportsQueuePage';
import { ReferralsPage } from './pages/ReferralsPage';
import { AuditPage } from './pages/AuditPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { PatientStatusPage } from './pages/PatientStatusPage';
import { UnauthorizedPage, NotFoundPage } from './pages/SystemPages';
import { SoftlyWellnessLandingPage } from './pages/SoftlyWellnessLandingPage';

const AppLayout: React.FC = () => {
  const location = useLocation();
  const isSoftly = location.pathname.startsWith('/softly') || location.pathname.startsWith('/wellness');

  if (isSoftly) {
    return (
      <Routes>
        <Route path="/softly" element={<SoftlyWellnessLandingPage />} />
        <Route path="/wellness" element={<SoftlyWellnessLandingPage />} />
      </Routes>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F4F1FA] text-[#332F3A] font-sans antialiased relative selection:bg-purple-200 selection:text-purple-900">
      <ClayBackgroundBlobs />
      <Header />
      <main className="flex-1 relative z-10">
        <Routes>
          {/* Public Tier */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<AboutPage />} />
                <Route path="/security" element={<SecurityPage />} />
                <Route path="/accessibility" element={<AccessibilityPage />} />
                <Route path="/contact" element={<ContactPage />} />

                {/* Patient Intake Workflow & Status Tracker */}
                <Route path="/patient" element={<PatientWorkflowPage />} />
                <Route path="/patient/consent" element={<PatientWorkflowPage />} />
                <Route path="/patient/language" element={<PatientWorkflowPage />} />
                <Route path="/patient/input" element={<PatientWorkflowPage />} />
                <Route path="/patient/review" element={<PatientWorkflowPage />} />
                <Route path="/patient/submission" element={<PatientWorkflowPage />} />
                <Route path="/status" element={<PatientStatusPage />} />
                <Route path="/patient/status" element={<PatientStatusPage />} />

                {/* Staff / Clinical Tier */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<LoginPage initialTab="register" />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/cases" element={<CasesQueuePage />} />
                <Route path="/cases/:id" element={<CaseDetailPage />} />
                <Route path="/reports" element={<ReportsQueuePage />} />
                <Route path="/referrals" element={<ReferralsPage />} />
                <Route path="/audit" element={<AuditPage />} />

                {/* Admin Tier */}
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/admin/users" element={<AdminDashboardPage />} />
                <Route path="/admin/facilities" element={<AdminDashboardPage />} />
                <Route path="/admin/rules" element={<AdminDashboardPage />} />
                <Route path="/admin/audit" element={<AuditPage />} />
                <Route path="/admin/settings" element={<AdminDashboardPage />} />

                {/* System Tier */}
                <Route path="/unauthorized" element={<UnauthorizedPage />} />
                <Route path="/404" element={<NotFoundPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
  );
};

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <AppLayout />
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
