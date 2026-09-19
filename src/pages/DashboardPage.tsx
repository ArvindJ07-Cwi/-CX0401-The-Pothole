import { useRole } from '../context/RoleContext';
import AuthorityDashboard from './authority/AuthorityDashboard';
import CitizenDashboard from './citizen/CitizenDashboard';
import ContractorDashboard from './contractor/ContractorDashboard';
import PlaceholderPage from './PlaceholderPage';

/**
 * Root dashboard — delegates to a role-specific dashboard component.
 */
export default function DashboardPage() {
  const { role } = useRole();

  if (role === 'authority')  return <AuthorityDashboard />;
  if (role === 'citizen')    return <CitizenDashboard />;
  if (role === 'contractor') return <ContractorDashboard />;

  return <PlaceholderPage name="Unknown Role" />;
}
