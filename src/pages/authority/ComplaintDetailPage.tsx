import { AlertTriangle, ArrowLeft, Check, CheckCircle2, HelpCircle, Loader2, UserCheck, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import SeverityBadge from '../../components/ui/SeverityBadge';
import StatusBadge from '../../components/ui/StatusBadge';
import { useRole } from '../../context/RoleContext';
import { useAuth } from '../../context/AuthContext';
import type { Complaint } from '../../types';

const API = 'http://localhost:8000';

interface ApiContractor {
  id: number;
  name: string;
  email: string;
  role: string;
}

/** Map a raw API complaint to the frontend Complaint type */
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
    updatedAt: c.updated_at,
    contractorName: c.contractor_name ?? undefined,
    assignedTo: c.contractor_id ? String(c.contractor_id) : undefined,
  };
}

export default function ComplaintDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role } = useRole();
  const { token } = useAuth();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [contractors, setContractors] = useState<ApiContractor[]>([]);
  const [selectedContractorId, setSelectedContractorId] = useState('');
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [actionState, setActionState] = useState<'idle' | 'loading' | 'success'>('idle');
  const [actionError, setActionError] = useState('');

  const isAuthority = role === 'authority';

  // Fetch complaint and (for authority) contractors in parallel
  useEffect(() => {
    if (!id || !token) return;

    async function load() {
      setLoading(true);
      try {
        const [complaintRes, contractorsRes] = await Promise.all([
          axios.get(`${API}/api/complaints/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          isAuthority
            ? axios.get(`${API}/api/contractors`, {
                headers: { Authorization: `Bearer ${token}` },
              })
            : Promise.resolve({ data: [] }),
        ]);
        setComplaint(mapComplaint(complaintRes.data));
        setContractors(contractorsRes.data);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setFetchError('Complaint not found.');
        } else if (err.response?.status === 403) {
          setFetchError('You are not authorised to view this complaint.');
        } else {
          setFetchError('Failed to load complaint details.');
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, token, isAuthority]);

  async function handleStatusUpdate(newStatus: string) {
    if (!complaint) return;
    setActionState('loading');
    setActionError('');
    try {
      const res = await axios.patch(
        `${API}/api/complaints/${complaint.id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setComplaint(mapComplaint(res.data));
      setActionState('success');
    } catch {
      setActionError('Failed to update status. Please try again.');
      setActionState('idle');
    }
  }

  async function handleAssign() {
    if (!complaint || !selectedContractorId) return;
    setActionState('loading');
    setActionError('');
    try {
      const res = await axios.post(
        `${API}/api/complaints/${complaint.id}/assign`,
        { contractor_id: Number(selectedContractorId) },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setComplaint(mapComplaint(res.data));
      setActionState('success');
      // Refresh contractors list to get updated name
      const selected = contractors.find(c => String(c.id) === selectedContractorId);
      if (selected && complaint) {
        setComplaint(prev => prev ? { ...prev, contractorName: selected.name, assignedTo: String(selected.id), status: 'assigned' } : prev);
      }
    } catch {
      setActionError('Failed to assign contractor. Please try again.');
      setActionState('idle');
    }
  }

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto mt-10 text-center">
        <Loader2 size={28} className="animate-spin text-blue-500 mx-auto" />
        <p className="text-slate-500 text-sm mt-3">Loading complaint details…</p>
      </div>
    );
  }

  // ── Error / not found ──────────────────────────────────────────────────────
  if (fetchError || !complaint) {
    return (
      <div className="max-w-2xl mx-auto mt-10 text-center space-y-4">
        <AlertTriangle size={28} className="text-red-400 mx-auto" />
        <h2 className="text-xl font-semibold text-slate-800">{fetchError || 'Complaint Not Found'}</h2>
        <button
          onClick={() => navigate(-1)}
          className="mt-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Derived state
  const vr = complaint.verificationResult;
  const hasVerification = !!vr;
  const isSubmittedOrFlagged = complaint.status === 'submitted' || complaint.status === 'flagged';
  const needsReview = isAuthority && (isSubmittedOrFlagged || vr?.outcome === 'inconclusive' || vr?.outcome === 'flagged');
  const canAssign = isAuthority && complaint.status === 'pending';

  // ── Action success screen ──────────────────────────────────────────────────
  if (actionState === 'success') {
    return (
      <div className="max-w-lg mx-auto mt-10 text-center bg-white rounded-xl border border-slate-200 p-8">
        <CheckCircle2 size={28} className="text-green-600 mx-auto mb-4" />
        <h2 className="text-slate-800 font-semibold text-lg">Action Completed</h2>
        <p className="text-slate-500 text-sm mt-1">The complaint has been updated successfully.</p>
        <div className="flex gap-3 justify-center mt-5">
          <button onClick={() => navigate('/complaints')} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg">
            Back to Complaints
          </button>
          <button onClick={() => setActionState('idle')} className="px-4 py-2 text-sm border border-slate-200 rounded-lg text-slate-600">
            View Details
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-slate-800 text-xl font-semibold flex items-center gap-3">
            {complaint.referenceNo}
            <StatusBadge status={complaint.status} />
            <SeverityBadge severity={complaint.severity} />
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">Reported on {new Date(complaint.reportedAt).toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Main Details Column ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Photo Comparison */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-slate-700 font-semibold text-sm">Visual Evidence</h3>
              <span className="text-[11px] text-slate-400">Before / After</span>
            </div>
            <div className="grid grid-cols-2 divide-x divide-slate-100">
              <div className="p-4 flex flex-col h-full">
                <span className="text-[10px] font-semibold text-slate-500 uppercase mb-2">Before Repair</span>
                <div className="bg-slate-100 rounded-lg flex-1 min-h-[200px] flex items-center justify-center overflow-hidden border border-slate-200">
                  {complaint.beforePhotoUrl ? (
                    <img src={complaint.beforePhotoUrl} alt="Before" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-slate-400 text-xs">No photo</span>
                  )}
                </div>
              </div>
              <div className="p-4 flex flex-col h-full">
                <span className="text-[10px] font-semibold text-slate-500 uppercase mb-2">After Repair</span>
                <div className="bg-slate-100 rounded-lg flex-1 min-h-[200px] flex items-center justify-center overflow-hidden border border-slate-200">
                  {complaint.afterPhotoUrl ? (
                    <img src={complaint.afterPhotoUrl} alt="After" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-slate-400 text-xs">Pending submission</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-slate-700 font-semibold text-sm border-b border-slate-100 pb-2 mb-3">{complaint.title}</h3>
            <p className="text-slate-600 text-sm leading-relaxed">{complaint.description}</p>
          </div>

          {/* AI Verification Section */}
          {hasVerification && vr && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-slate-700 font-semibold text-sm">AI Verification Analysis</h3>
                {vr.outcome === 'verified' && <span className="flex items-center gap-1 text-green-600 text-xs font-semibold bg-green-50 px-2 py-0.5 rounded border border-green-200"><CheckCircle2 size={12}/> Verified</span>}
                {vr.outcome === 'flagged' && <span className="flex items-center gap-1 text-red-600 text-xs font-semibold bg-red-50 px-2 py-0.5 rounded border border-red-200"><AlertTriangle size={12}/> Flagged</span>}
                {vr.outcome === 'inconclusive' && <span className="flex items-center gap-1 text-amber-600 text-xs font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200"><HelpCircle size={12}/> Inconclusive</span>}
              </div>
              <div className="p-5">
                <div className="mb-5">
                  <div className="flex justify-between items-end mb-1.5">
                    <span className="text-xs font-semibold text-slate-600 uppercase">Verification Confidence</span>
                    <span className="text-sm font-bold text-slate-800">{vr.confidence}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-1000 ${
                      vr.confidence >= 80 ? 'bg-green-500' : vr.confidence >= 50 ? 'bg-amber-500' : 'bg-red-500'
                    }`} style={{ width: `${vr.confidence}%` }} />
                  </div>
                </div>
                <div className="space-y-3">
                  {vr.checks.map((check, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                      <div className="mt-0.5 shrink-0">
                        {check.passed ? (
                          <CheckCircle2 size={16} className="text-green-500" />
                        ) : (
                          <XCircle size={16} className="text-red-500" />
                        )}
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${check.passed ? 'text-slate-700' : 'text-slate-800'}`}>
                          {check.label}
                        </p>
                        {check.detail && (
                          <p className="text-xs text-slate-500 mt-1">{check.detail}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {vr.flagReason && (
                  <div className="mt-4 p-4 rounded-lg border border-red-200 bg-red-50 flex items-start gap-3">
                    <AlertTriangle size={16} className="text-red-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-red-800 uppercase mb-1">Reason for Flag</p>
                      <p className="text-sm text-red-700 leading-relaxed">{vr.flagReason}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Sidebar Column ── */}
        <div className="space-y-6">

          {/* Metadata Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <h3 className="text-slate-700 font-semibold text-sm border-b border-slate-100 pb-2">Information</h3>
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Reported By</p>
              <p className="text-sm text-slate-700 font-medium mt-0.5">{complaint.reportedBy}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Location</p>
              <p className="text-sm text-slate-700 mt-0.5">{complaint.location.address}</p>
              {complaint.location.ward && <p className="text-xs text-slate-500 mt-0.5">{complaint.location.ward}</p>}
              {complaint.location.coordinates.lat !== 0 && (
                <p className="text-[11px] text-slate-400 mt-1">
                  {complaint.location.coordinates.lat.toFixed(5)}, {complaint.location.coordinates.lng.toFixed(5)}
                </p>
              )}
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Contractor</p>
              <p className="text-sm text-slate-700 mt-0.5">{complaint.contractorName || 'Not assigned'}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Last Updated</p>
              <p className="text-sm text-slate-700 mt-0.5">{new Date(complaint.updatedAt).toLocaleString()}</p>
            </div>
          </div>

          {/* Assign Contractor Panel (authority, pending) */}
          {canAssign && (
            <div className="bg-white rounded-xl border border-blue-200 overflow-hidden shadow-sm">
              <div className="bg-blue-50 px-5 py-3 border-b border-blue-100">
                <h3 className="text-blue-800 font-semibold text-sm">Assign Contractor</h3>
                <p className="text-blue-600 text-xs mt-0.5">Select a contractor for this complaint</p>
              </div>
              <div className="p-5 space-y-3">
                <select
                  value={selectedContractorId}
                  onChange={(e) => setSelectedContractorId(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
                >
                  <option value="">Select contractor…</option>
                  {contractors.map((c) => (
                    <option key={c.id} value={String(c.id)}>{c.name}</option>
                  ))}
                </select>
                {contractors.length === 0 && (
                  <p className="text-xs text-slate-400 italic">No contractors registered yet.</p>
                )}
                {actionError && (
                  <p className="text-xs text-red-600">{actionError}</p>
                )}
                <button
                  onClick={handleAssign}
                  disabled={!selectedContractorId || actionState === 'loading'}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  {actionState === 'loading' ? <Loader2 size={15} className="animate-spin" /> : <UserCheck size={15} />}
                  {actionState === 'loading' ? 'Assigning…' : 'Assign Contractor'}
                </button>
              </div>
            </div>
          )}

          {/* Municipal Review Panel (submitted / flagged) */}
          {needsReview && (
            <div className="bg-white rounded-xl border border-blue-200 overflow-hidden shadow-sm">
              <div className="bg-blue-50 px-5 py-3 border-b border-blue-100">
                <h3 className="text-blue-800 font-semibold text-sm">Municipal Review</h3>
                <p className="text-blue-600 text-xs mt-0.5">Action required for verification</p>
              </div>
              <div className="p-5 space-y-3">
                {actionError && (
                  <p className="text-xs text-red-600">{actionError}</p>
                )}
                <button
                  onClick={() => handleStatusUpdate('verified')}
                  disabled={actionState === 'loading'}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-70"
                >
                  {actionState === 'loading' ? <Loader2 size={15} className="animate-spin" /> : <Check size={16} />}
                  Approve & Verify
                </button>
                <button
                  onClick={() => handleStatusUpdate('flagged')}
                  disabled={actionState === 'loading'}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium disabled:opacity-70"
                >
                  <XCircle size={16} /> Flag for Re-work
                </button>
                <button
                  onClick={() => handleStatusUpdate('rejected')}
                  disabled={actionState === 'loading'}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors text-sm font-medium disabled:opacity-70"
                >
                  <XCircle size={16} /> Reject Complaint
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
