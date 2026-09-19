import { CheckCircle2, Clock, FileCheck2, Wrench } from 'lucide-react';
import JobsTable from '../../components/contractor/JobsTable';
import KpiCard from '../../components/ui/KpiCard';
import { CONTRACTOR_NAME, MOCK_CONTRACTOR_JOBS, computeContractorStats } from '../../data/mockContractorJobs';

// MOCK DATA - Replace with API when ready
const jobs = MOCK_CONTRACTOR_JOBS;
const stats = computeContractorStats(jobs);

export default function ContractorDashboard() {
  return (
    <div className="space-y-6">
      {/* ── Greeting ── */}
      <div>
        <h2 className="text-slate-800 text-xl font-semibold">
          Contractor Dashboard: {CONTRACTOR_NAME}
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Manage your assigned road repair jobs and submit completion evidence.{' '}
          <span className="text-xs text-slate-400">[MOCK DATA]</span>
        </p>
      </div>

      {/* ── KPI Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Assigned"
          value={stats.assigned}
          icon={<Clock size={18} className="text-blue-600" />}
          iconBg="bg-blue-50"
          sub="Awaiting action"
        />
        <KpiCard
          label="In Progress"
          value={stats.inProgress}
          icon={<Wrench size={18} className="text-amber-600" />}
          iconBg="bg-amber-50"
          sub="Work started"
        />
        <KpiCard
          label="Submitted"
          value={stats.submitted}
          icon={<FileCheck2 size={18} className="text-violet-600" />}
          iconBg="bg-violet-50"
          sub="Pending verification"
        />
        <KpiCard
          label="Completed"
          value={stats.completed}
          icon={<CheckCircle2 size={18} className="text-green-600" />}
          iconBg="bg-green-50"
          sub="Repairs verified"
          subColor="text-green-500"
        />
      </div>

      {/* ── Jobs Table ── */}
      <JobsTable jobs={jobs} />
    </div>
  );
}
