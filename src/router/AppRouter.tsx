import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import DashboardPage from '../pages/DashboardPage';
import PlaceholderPage from '../pages/PlaceholderPage';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />

          {/* Citizen */}
          <Route path="/my-reports" element={<PlaceholderPage name="My Reports" />} />
          <Route path="/report" element={<PlaceholderPage name="Report a Pothole" />} />

          {/* Authority */}
          <Route path="/complaints" element={<PlaceholderPage name="All Complaints" />} />
          <Route path="/complaints/:id" element={<PlaceholderPage name="Complaint Detail" />} />
          <Route path="/flagged" element={<PlaceholderPage name="Flagged Cases" />} />

          {/* Contractor */}
          <Route path="/jobs" element={<PlaceholderPage name="My Jobs" />} />
          <Route path="/submit-repair" element={<PlaceholderPage name="Submit Repair" />} />

          {/* Common */}
          <Route path="/settings" element={<PlaceholderPage name="Settings" />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
