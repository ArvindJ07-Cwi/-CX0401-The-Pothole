import { Bell, ChevronDown } from 'lucide-react';
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

  return (
    <header className="h-14 bg-white border-b border-neutral-200 flex items-center justify-between px-6 shrink-0">
      <h1 className="text-neutral-800 font-semibold text-base">{title}</h1>

      <div className="flex items-center gap-4">
        {/* Notification bell */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative text-neutral-500 hover:text-neutral-700 transition-colors"
        >
          <Bell size={18} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-neutral-800 rounded-full" />
        </button>

        {/* DEV: role switcher */}
        <div className="flex items-center gap-2 pl-4 border-l border-neutral-200">
          <span className="text-[11px] text-neutral-400 uppercase tracking-wider hidden sm:block">
            Dev&nbsp;Role
          </span>
          <div className="relative">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="appearance-none bg-neutral-100 text-neutral-700 text-xs font-medium pl-3 pr-7 py-1.5 rounded-md border border-neutral-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-neutral-900"
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
              className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none"
            />
          </div>

          {/* Avatar */}
          <div className="w-7 h-7 rounded-full bg-neutral-900 text-white text-[10px] font-bold flex items-center justify-center">
            {ROLE_AVATAR[role]}
          </div>
        </div>
      </div>
    </header>
  );
}
