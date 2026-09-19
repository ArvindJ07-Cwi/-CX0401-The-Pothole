import { Bell, ChevronDown, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';
import type { UserRole } from '../../types';

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'citizen', label: 'Citizen' },
  { value: 'authority', label: 'Municipal Authority' },
  { value: 'contractor', label: 'Contractor' },
];

const ROLE_AVATAR: Record<UserRole, string> = {
  citizen: 'CZ',
  authority: 'MA',
  contractor: 'CT',
};

interface TopBarProps {
  title: string;
}

export default function TopBar({ title }: TopBarProps) {
  const { role, setRole } = useRole();
  const navigate = useNavigate();

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
      <h1 className="text-slate-800 font-semibold text-base">{title}</h1>

      <div className="flex items-center gap-4">
        {/* Notification bell */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative text-slate-500 hover:text-slate-700 transition-colors"
        >
          <Bell size={18} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* DEV: role switcher */}
        <div className="flex items-center gap-2 pl-4 border-l border-slate-200">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider hidden sm:block">
            Dev&nbsp;Role
          </span>
          <div className="relative">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="appearance-none bg-slate-100 text-slate-700 text-xs font-medium pl-3 pr-7 py-1.5 rounded-md border border-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Switch role"
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={12}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
            />
          </div>

          {/* Avatar */}
          <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center mr-2">
            {ROLE_AVATAR[role]}
          </div>

          {/* Logout */}
          <div className="pl-3 border-l border-slate-200">
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
