import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import HealthGraph from './components/HealthGraph';
import DashboardLayout from './components/DashboardLayout';
import SymptomChecker from './pages/SymptomChecker';
import ReportAnalyzer from './pages/ReportAnalyzer';
import Chatbot from './pages/Chatbot';
import MyReports from './pages/MyReports';
import Profile from './pages/Profile';
import ReportViewer from './pages/ReportViewer';
import FindDoctor from './pages/FindDoctor';
import AIInsights from './pages/AIInsights';

import { UserProfileProvider } from './context/UserProfileContext';

function App() {
  return (
    <UserProfileProvider>
      <Router>
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
      </Router>
    </UserProfileProvider>
  );
}

export default App;
