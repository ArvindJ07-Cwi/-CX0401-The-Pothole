import { useRole } from '../context/RoleContext';
import AuthorityDashboard from './authority/AuthorityDashboard';
import CitizenDashboard from './citizen/CitizenDashboard';
import PlaceholderPage from './PlaceholderPage';

/**
 * Root dashboard — delegates to a role-specific dashboard component.
 * Contractor dashboard will be added as a separate feature.
 */
export default function DashboardPage() {
  const { role } = useRole();

  if (role === 'authority')  return <AuthorityDashboard />;
  if (role === 'citizen')    return <CitizenDashboard />;
  if (role === 'contractor') return <PlaceholderPage name="Contractor Dashboard — coming soon" />;

  return null;
}
