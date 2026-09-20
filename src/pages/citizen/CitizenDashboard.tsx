import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FilePlus2,
  FileText,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import MyReportsList from '../../components/citizen/MyReportsList';
import KpiCard from '../../components/ui/KpiCard';
import { computeCitizenStats } from '../../data/mockCitizenComplaints';
import { useAuth } from '../../context/AuthContext';
import type { Complaint } from '../../types';

export default function CitizenDashboard() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchComplaints() {
      try {
        const res = await axios.get('http://localhost:8000/api/complaints', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Map backend response to frontend Complaint type
        const mapped: Complaint[] = res.data.map((c: any) => ({
          id: String(c.id),
          referenceNo: `COMP-${String(c.id).padStart(4, '0')}`,
          title: c.title,
          description: c.description,
          location: {
            address: c.address,
            coordinates: { lat: c.latitude || 0, lng: c.longitude || 0 },
          },
          severity: c.severity,
          status: c.status,
          reportedBy: String(c.citizen_id),
          reportedAt: c.created_at,
          beforePhotoUrl: c.before_image_path ? `http://localhost:8000${c.before_image_path}` : undefined,
          updatedAt: c.updated_at
        }));
        
        setComplaints(mapped);
      } catch (err) {
        console.error(err);
        setError('Failed to load complaints.');
      } finally {
        setLoading(false);
      }
    }
    
    if (token) fetchComplaints();
  }, [token]);

  const stats = computeCitizenStats(complaints);

  return (
    <div className="space-y-6">
      {/* ── Greeting + CTA ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-slate-800 text-xl font-semibold">
            Welcome, {user?.name}
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Track your pothole reports and their repair status.
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
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">
          {error}
        </div>
      )}

      {/* ── KPI Cards ── */}
      {!loading && (
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
      )}

      {/* ── Info banner when flagged > 0 ── */}
      {!loading && stats.flagged > 0 && (
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
      {loading ? (
        <div className="text-center text-slate-500 py-10">Loading reports...</div>
      ) : (
        <MyReportsList complaints={complaints} />
      )}
    </div>
  );
}
