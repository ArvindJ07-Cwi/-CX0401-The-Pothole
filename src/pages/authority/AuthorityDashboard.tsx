import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Wrench,
} from 'lucide-react';
import ComplaintsTable from '../../components/authority/ComplaintsTable';
import FlaggedPanel from '../../components/authority/FlaggedPanel';
import MapSection from '../../components/authority/MapSection';
import KpiCard from '../../components/ui/KpiCard';
import { MOCK_COMPLAINTS, computeStats } from '../../data/mockComplaints';

// MOCK DATA — clearly separated; replace with API calls when backend is ready
const complaints = MOCK_COMPLAINTS;
const stats      = computeStats(complaints);

export default function AuthorityDashboard() {
  return (
    <div className="space-y-6">
      {/* ── Greeting ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-neutral-800 text-xl font-semibold">
            Municipal Authority Dashboard
          </h2>
          <p className="text-neutral-500 text-sm mt-1">
            Overview of all pothole complaints across all wards.{' '}
            <span className="text-xs text-neutral-400">[MOCK DATA]</span>
          </p>
        </div>
      </div>

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Complaints"
          value={stats.total}
          icon={<FileText size={18} className="text-neutral-900" />}
          iconBg="bg-neutral-100"
          sub="All time"
        />
        <KpiCard
          label="Pending Review"
          value={stats.pending}
          icon={<Clock size={18} className="text-neutral-600" />}
          iconBg="bg-neutral-100"
          sub="Awaiting assignment"
          subColor="text-neutral-500"
        />
        <KpiCard
          label="Under Repair"
          value={stats.inProgress}
          icon={<Wrench size={18} className="text-neutral-700" />}
          iconBg="bg-neutral-100"
          sub="Assigned / In progress"
          subColor="text-neutral-500"
        />
        <KpiCard
          label="Verified"
          value={stats.verified}
          icon={<CheckCircle2 size={18} className="text-neutral-600" />}
          iconBg="bg-neutral-100"
          sub={`${stats.flagged} flagged for review`}
          subColor={stats.flagged > 0 ? 'text-neutral-500' : 'text-neutral-400'}
        />
      </div>

      {/* ── Map ── */}
      <MapSection complaints={complaints} />

      {/* ── Table + Flagged panel (2-col on lg) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* Complaints table takes 2/3 */}
        <div className="lg:col-span-2">
          <ComplaintsTable complaints={complaints} />
        </div>

        {/* Flagged panel takes 1/3 */}
        <div>
          <FlaggedPanel complaints={complaints} />
        </div>
      </div>

      {/* ── Flagged KPI note (mobile: shown inline, lg: redundant) ── */}
      {stats.flagged > 0 && (
        <div className="flex items-center gap-2 bg-neutral-100 border border-neutral-200 rounded-xl px-4 py-3 lg:hidden">
          <AlertTriangle size={15} className="text-neutral-500 shrink-0" />
          <p className="text-neutral-700 text-xs">
            <span className="font-semibold">{stats.flagged} complaint{stats.flagged > 1 ? 's' : ''}</span>
            {' '}flagged for manual review. Check the Flagged Cases section.
          </p>
        </div>
      )}
    </div>
  );
}
