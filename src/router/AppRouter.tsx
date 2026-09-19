import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import DashboardPage from '../pages/DashboardPage';
import PlaceholderPage from '../pages/PlaceholderPage';
import CitizenDashboard from '../pages/citizen/CitizenDashboard';
import ReportPotholePage from '../pages/citizen/ReportPotholePage';
import ContractorDashboard from '../pages/contractor/ContractorDashboard';
import SubmitRepairPage from '../pages/contractor/SubmitRepairPage';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />

          {/* Citizen */}
          <Route path="/my-reports" element={<CitizenDashboard />} />
          <Route path="/report"     element={<ReportPotholePage />} />

          {/* Authority */}
          <Route path="/complaints"     element={<PlaceholderPage name="All Complaints" />} />
          <Route path="/complaints/:id" element={<PlaceholderPage name="Complaint Detail" />} />
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
