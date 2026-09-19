import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/my-reports': 'My Reports',
  '/report': 'Report a Pothole',
  '/complaints': 'All Complaints',
  '/flagged': 'Flagged Cases',
  '/jobs': 'My Jobs',
  '/submit-repair': 'Submit Repair',
  '/settings': 'Settings',
};

export default function AppShell() {
  const { pathname } = useLocation();

  // Match exact or prefix (e.g. /complaints/123 → "All Complaints")
  const title =
    PAGE_TITLES[pathname] ??
    Object.entries(PAGE_TITLES).find(([key]) => key !== '/' && pathname.startsWith(key))?.[1] ??
    'CX0401';

  return (
    <div className="flex w-full min-h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <TopBar title={title} />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
