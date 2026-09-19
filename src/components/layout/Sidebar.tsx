import {
  AlertTriangle,
  ClipboardList,
  FileCheck2,
  LayoutDashboard,
  MapPin,
  Settings,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';
import type { UserRole } from '../../types';

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    to: '/',
    icon: <LayoutDashboard size={18} />,
    roles: ['citizen', 'authority', 'contractor'],
  },
  {
    label: 'My Reports',
    to: '/my-reports',
    icon: <ClipboardList size={18} />,
    roles: ['citizen'],
  },
  {
    label: 'Report Pothole',
    to: '/report',
    icon: <MapPin size={18} />,
    roles: ['citizen'],
  },
  {
    label: 'All Complaints',
    to: '/complaints',
    icon: <ClipboardList size={18} />,
    roles: ['authority'],
  },
  {
    label: 'Flagged Cases',
    to: '/flagged',
    icon: <AlertTriangle size={18} />,
    roles: ['authority'],
  },
  {
    label: 'My Jobs',
    to: '/jobs',
    icon: <FileCheck2 size={18} />,
    roles: ['contractor'],
  },
  {
    label: 'Submit Repair',
    to: '/submit-repair',
    icon: <FileCheck2 size={18} />,
    roles: ['contractor'],
  },
  {
    label: 'Settings',
    to: '/settings',
    icon: <Settings size={18} />,
    roles: ['citizen', 'authority', 'contractor'],
  },
];

const ROLE_LABEL: Record<UserRole, string> = {
  citizen: 'Citizen Portal',
  authority: 'Municipal Authority',
  contractor: 'Contractor Portal',
};

const ROLE_COLOR: Record<UserRole, string> = {
  citizen: 'bg-neutral-400',
  authority: 'bg-neutral-300',
  contractor: 'bg-neutral-500',
};

export default function Sidebar() {
  const { role } = useRole();
  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <aside className="flex flex-col w-60 min-h-screen bg-[#171717] text-neutral-300 shrink-0 border-r border-neutral-800">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-neutral-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0">
            <MapPin size={16} className="text-[#171717]" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-none">CX0401</p>
            <p className="text-neutral-400 text-[11px] mt-0.5 leading-none">Pothole Platform</p>
          </div>
        </div>

        {/* Role badge */}
        <div className="mt-4 flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full shrink-0 ${ROLE_COLOR[role]}`} />
          <span className="text-[11px] text-neutral-400 uppercase tracking-wider font-medium">
            {ROLE_LABEL[role]}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors border ${
                isActive
                  ? 'bg-[#262626] text-white border-[#404040]'
                  : 'border-transparent text-neutral-400 hover:bg-[#262626] hover:text-neutral-200'
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-neutral-800 text-[11px] text-neutral-500">
        Hackathon · CX0401 · v0.1
      </div>
    </aside>
  );
}
