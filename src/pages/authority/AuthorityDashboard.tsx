import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Wrench,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import ComplaintsTable from '../../components/authority/ComplaintsTable';
import FlaggedPanel from '../../components/authority/FlaggedPanel';
import MapSection from '../../components/authority/MapSection';
import KpiCard from '../../components/ui/KpiCard';
import { computeStats } from '../../data/mockComplaints';
import { useAuth } from '../../context/AuthContext';
import type { Complaint } from '../../types';

const API = 'http://localhost:8000';

/** Map backend complaint row to frontend Complaint type */
function mapComplaint(c: any): Complaint {
  const assignment = c.assignment || {};
  const evidence = c.repair_evidence || {};
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
    afterPhotoUrl: evidence.after_image_path ? `${API}${evidence.after_image_path}` : undefined,
    repairNote: evidence.repair_notes ?? undefined,
    updatedAt: c.updated_at,
    contractorName: assignment.contractor_name || evidence.contractor_name || undefined,
    assignedTo: assignment.contractor_id ? String(assignment.contractor_id) : undefined,
  };
}

export default function AuthorityDashboard() {
  const { token } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function fetchComplaints() {
    try {
      const res = await axios.get(`${API}/api/complaints`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComplaints(res.data.map(mapComplaint));
      setError('');
    } catch {
      setError('Failed to load complaints. The backend may be offline.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) fetchComplaints();
  }, [token]);

  const stats = computeStats(complaints);

  return (
    <div className="space-y-6">
      {/* ── Greeting ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-slate-800 text-xl font-semibold">
            Municipal Authority Dashboard
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Overview of all pothole complaints across all wards.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertTriangle size={15} className="text-red-500 shrink-0" />
          <p className="text-red-700 text-xs">{error}</p>
        </div>
      )}

      {/* ── KPI Row ── */}
      {!loading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Total Complaints"
            value={stats.total}
            icon={<FileText size={18} className="text-blue-600" />}
            iconBg="bg-blue-50"
            sub="All time"
          />
          <KpiCard
            label="Pending Review"
            value={stats.pending}
            icon={<Clock size={18} className="text-amber-600" />}
            iconBg="bg-amber-50"
            sub="Awaiting assignment"
            subColor="text-amber-500"
          />
          <KpiCard
            label="Under Repair"
            value={stats.inProgress}
            icon={<Wrench size={18} className="text-violet-600" />}
            iconBg="bg-violet-50"
            sub="Assigned / In progress"
            subColor="text-violet-500"
          />
          <KpiCard
            label="Verified"
            value={stats.verified}
            icon={<CheckCircle2 size={18} className="text-green-600" />}
            iconBg="bg-green-50"
            sub={`${stats.flagged} flagged for review`}
            subColor={stats.flagged > 0 ? 'text-red-500' : 'text-slate-400'}
          />
        </div>
      )}

      {loading && (
        <div className="text-center text-slate-400 text-sm py-10">Loading complaints…</div>
      )}

      {/* ── Map ── */}
      {!loading && <MapSection complaints={complaints} />}

      {/* ── Table + Flagged panel (2-col on lg) ── */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          <div className="lg:col-span-2">
            <ComplaintsTable
              complaints={complaints}
              onRefresh={fetchComplaints}
              token={token ?? ''}
            />
          </div>
          <div>
            <FlaggedPanel complaints={complaints} />
          </div>
        </div>
      )}

      {/* ── Flagged KPI note (mobile) ── */}
      {!loading && stats.flagged > 0 && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 lg:hidden">
          <AlertTriangle size={15} className="text-red-500 shrink-0" />
          <p className="text-red-700 text-xs">
            <span className="font-semibold">{stats.flagged} complaint{stats.flagged > 1 ? 's' : ''}</span>
            {' '}flagged for manual review. Check the Flagged Cases section.
          </p>
        </div>
      )}
    </div>
  );
}
