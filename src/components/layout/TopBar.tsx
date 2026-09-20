import { Bell, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../../context/RoleContext';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';


const ROLE_AVATAR: Record<UserRole, string> = {
  citizen: 'CZ',
  authority: 'MA',
  contractor: 'CT',
};

interface TopBarProps {
  title: string;
}

export default function TopBar({ title }: TopBarProps) {
  const { role } = useRole();
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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

        {/* Logged in user info */}
        <div className="flex items-center gap-2 pl-4 border-l border-slate-200">
          <div className="flex flex-col items-end mr-1 hidden sm:flex">
            <span className="text-xs font-semibold text-slate-700">{user?.name || 'User'}</span>
            <span className="text-[10px] text-slate-500 capitalize">{role}</span>
          </div>

          {/* Avatar */}
          <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center mr-2">
            {ROLE_AVATAR[role]}
          </div>

          {/* Logout */}
          <div className="pl-3 border-l border-slate-200">
            <button
              onClick={handleLogout}
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
