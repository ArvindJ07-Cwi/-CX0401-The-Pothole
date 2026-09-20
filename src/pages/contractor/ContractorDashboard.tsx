import { CheckCircle2, Clock, FileCheck2, Wrench, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import JobsTable from '../../components/contractor/JobsTable';
import KpiCard from '../../components/ui/KpiCard';
import { computeContractorStats } from '../../data/mockContractorJobs';
import { useAuth } from '../../context/AuthContext';
import type { Complaint } from '../../types';

const API = 'http://localhost:8000';

function mapComplaint(c: any): Complaint {
  return {
    id: String(c.id),
    referenceNo: `COMP-${String(c.id).padStart(4, '0')}`,
    title: c.title,
    description: c.description,
    location: {
      address: c.address,
      coordinates: { lat: c.latitude ?? 0, lng: c.longitude ?? 0 },
    },
    severity: c.severity,
    status: c.status,
    reportedBy: String(c.citizen_id),
    reportedAt: c.created_at,
    beforePhotoUrl: c.before_image_path ? `${API}${c.before_image_path}` : undefined,
    afterPhotoUrl: c.repair_evidence?.after_image_path ? `${API}${c.repair_evidence.after_image_path}` : undefined,
    repairNote: c.repair_evidence?.repair_notes ?? undefined,
    updatedAt: c.updated_at,
    contractorName: c.contractor_name ?? undefined,
    assignedTo: c.contractor_id ? String(c.contractor_id) : undefined,
  };
}

export default function ContractorDashboard() {
  const { token, user } = useAuth();
  const [jobs, setJobs] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;

    async function loadJobs() {
      try {
        const res = await axios.get(`${API}/api/complaints`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setJobs(res.data.map(mapComplaint));
        setError('');
      } catch {
        setError('Failed to load assigned jobs.');
      } finally {
        setLoading(false);
      }
    }
    loadJobs();
  }, [token]);

  const stats = computeContractorStats(jobs);

  return (
    <div className="space-y-6">
      {/* ── Greeting ── */}
      <div>
        <h2 className="text-slate-800 text-xl font-semibold">
          Contractor Dashboard: {user?.name ?? 'Loading...'}
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Manage your assigned road repair jobs and submit completion evidence.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertTriangle size={15} className="text-red-500 shrink-0" />
          <p className="text-red-700 text-xs">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center text-slate-400 text-sm py-10">Loading your jobs...</div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
