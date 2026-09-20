import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import DashboardPage from '../pages/DashboardPage';
import PlaceholderPage from '../pages/PlaceholderPage';
import CitizenDashboard from '../pages/citizen/CitizenDashboard';
import ReportPotholePage from '../pages/citizen/ReportPotholePage';
import ContractorDashboard from '../pages/contractor/ContractorDashboard';
import SubmitRepairPage from '../pages/contractor/SubmitRepairPage';
import ComplaintDetailPage from '../pages/authority/ComplaintDetailPage';
import LoginPage from '../pages/auth/LoginPage';
import SignupPage from '../pages/auth/SignupPage';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;
  }
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
          <Route index element={<DashboardPage />} />

          {/* Citizen */}
          <Route path="/my-reports" element={<CitizenDashboard />} />
          <Route path="/report"     element={<ReportPotholePage />} />

          {/* Authority */}
          <Route path="/complaints"     element={<PlaceholderPage name="All Complaints" />} />
          <Route path="/complaints/:id" element={<ComplaintDetailPage />} />
          <Route path="/flagged"        element={<PlaceholderPage name="Flagged Cases" />} />

          {/* Contractor */}
          <Route path="/jobs"              element={<ContractorDashboard />} />
          <Route path="/submit-repair"     element={<ContractorDashboard />} />
          <Route path="/submit-repair/:id" element={<SubmitRepairPage />} />

          {/* Common */}
          <Route path="/settings" element={<PlaceholderPage name="Settings" />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
