import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

// Eager load Landing and Login for fast initial paint
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';

// Lazy load Dashboard components
const DashboardLayout = lazy(() => import('./components/DashboardLayout'));
const HealthGraph = lazy(() => import('./components/HealthGraph'));
const SymptomChecker = lazy(() => import('./pages/SymptomChecker'));
const ReportAnalyzer = lazy(() => import('./pages/ReportAnalyzer'));
const Chatbot = lazy(() => import('./pages/Chatbot'));
const MyReports = lazy(() => import('./pages/MyReports'));
const Profile = lazy(() => import('./pages/Profile'));
const ReportViewer = lazy(() => import('./pages/ReportViewer'));
const FindDoctor = lazy(() => import('./pages/FindDoctor'));
const AIInsights = lazy(() => import('./pages/AIInsights'));

import { UserProfileProvider } from './context/UserProfileContext';
import { ThemeProvider } from './context/ThemeContext';

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <UserProfileProvider>
        <Router>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />

              {/* Protected Dashboard Routes */}
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<HealthGraph />} />
                <Route path="/symptom-check" element={<SymptomChecker />} />
                <Route path="/report-analyzer" element={<ReportAnalyzer />} />
                <Route path="/chat" element={<Chatbot />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/my-reports" element={<MyReports />} />
                <Route path="/find-doctor" element={<FindDoctor />} />
                <Route path="/ai-insights" element={<AIInsights />} />
                <Route path="/report-viewer/:id" element={<ReportViewer />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Router>
      </UserProfileProvider>
    </ThemeProvider>
  );
}

export default App;
