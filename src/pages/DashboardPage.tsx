import { AlertTriangle, CheckCircle2, Clock, FileText } from 'lucide-react';
import { useRole } from '../context/RoleContext';
import type { DashboardStats, UserRole } from '../types';

// ── Static preview data ───────────────────────────────────────────────────────
const STATS: Record<UserRole, DashboardStats> = {
  citizen: { total: 4, pending: 2, inProgress: 1, verified: 1, flagged: 0 },
  authority: { total: 138, pending: 34, inProgress: 47, verified: 51, flagged: 6 },
  contractor: { total: 12, pending: 0, inProgress: 5, verified: 7, flagged: 0 },
};

const ROLE_GREETING: Record<UserRole, string> = {
  citizen: 'Welcome back, Citizen',
  authority: 'Good day, Municipal Officer',
  contractor: 'Welcome back, Contractor',
};

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent: string;
}

function StatCard({ label, value, icon, accent }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${accent}`}>
        {icon}
      </div>
      <div>
        <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">{label}</p>
        <p className="text-slate-800 text-2xl font-bold mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { role } = useRole();
  const stats = STATS[role];

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h2 className="text-slate-800 text-xl font-semibold">{ROLE_GREETING[role]}</h2>
        <p className="text-slate-500 text-sm mt-1">
          Here's a summary of pothole activity for your role.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total"
          value={stats.total}
          icon={<FileText size={18} className="text-blue-600" />}
          accent="bg-blue-50"
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          icon={<Clock size={18} className="text-amber-600" />}
          accent="bg-amber-50"
        />
        <StatCard
          label="Verified"
          value={stats.verified}
          icon={<CheckCircle2 size={18} className="text-green-600" />}
          accent="bg-green-50"
        />
        <StatCard
          label="Flagged"
          value={stats.flagged}
          icon={<AlertTriangle size={18} className="text-red-500" />}
          accent="bg-red-50"
        />
      </div>

      {/* Placeholder content */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <p className="text-slate-400 text-sm text-center py-8">
          Feature content will appear here as features are implemented.
        </p>
      </div>
    </div>
  );
}
