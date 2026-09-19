import { useRole } from '../context/RoleContext';
import AuthorityDashboard from './authority/AuthorityDashboard';
import PlaceholderPage from './PlaceholderPage';

/**
 * Root dashboard — delegates to a role-specific dashboard.
 * Citizen and Contractor dashboards will be added as separate features.
 */
export default function DashboardPage() {
  const { role } = useRole();

  if (role === 'authority') return <AuthorityDashboard />;
  if (role === 'citizen')   return <PlaceholderPage name="Citizen Dashboard — coming soon" />;
  if (role === 'contractor') return <PlaceholderPage name="Contractor Dashboard — coming soon" />;

  return null;
}
