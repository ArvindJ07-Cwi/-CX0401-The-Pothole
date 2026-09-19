import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FilePlus2,
  FileText,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MyReportsList from '../../components/citizen/MyReportsList';
import KpiCard from '../../components/ui/KpiCard';
import {
  CITIZEN_NAME,
  MY_MOCK_COMPLAINTS,
  computeCitizenStats,
} from '../../data/mockCitizenComplaints';

// MOCK DATA — replace with authenticated API call when backend is ready
const complaints = MY_MOCK_COMPLAINTS;
const stats = computeCitizenStats(complaints);

export default function CitizenDashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* ── Greeting + CTA ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-slate-800 text-xl font-semibold">
            Welcome, {CITIZEN_NAME}
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Track your pothole reports and their repair status.{' '}
            <span className="text-xs text-slate-400">[MOCK DATA]</span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/report')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          <FilePlus2 size={15} />
          Report a Pothole
        </button>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Reports"
          value={stats.total}
          icon={<FileText size={18} className="text-blue-600" />}
          iconBg="bg-blue-50"
          sub="All time"
        />
        <KpiCard
          label="Pending"
          value={stats.pending}
          icon={<Clock size={18} className="text-amber-600" />}
          iconBg="bg-amber-50"
          sub="Awaiting assignment"
          subColor="text-amber-500"
        />
        <KpiCard
          label="Verified"
          value={stats.verified}
          icon={<CheckCircle2 size={18} className="text-green-600" />}
          iconBg="bg-green-50"
          sub="Repairs confirmed"
          subColor="text-green-500"
        />
        <KpiCard
          label="Flagged"
          value={stats.flagged}
          icon={<AlertTriangle size={18} className="text-red-500" />}
          iconBg="bg-red-50"
          sub={stats.flagged > 0 ? 'Needs review' : 'All clear'}
          subColor={stats.flagged > 0 ? 'text-red-500' : 'text-slate-400'}
        />
      </div>

      {/* ── Info banner when flagged > 0 ── */}
      {stats.flagged > 0 && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-red-700 text-sm font-medium">
              {stats.flagged} of your report{stats.flagged > 1 ? 's have' : ' has'} been flagged for review.
            </p>
            <p className="text-red-500 text-xs mt-0.5">
              The repair evidence submitted by the contractor did not pass AI verification.
              A municipal officer is reviewing it — no action required from you.
            </p>
          </div>
        </div>
      )}

      {/* ── My Reports list ── */}
      <MyReportsList complaints={complaints} />
    </div>
  );
}
