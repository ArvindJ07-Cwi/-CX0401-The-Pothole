import { AlertTriangle, ArrowLeft, Check, CheckCircle2, HelpCircle, XCircle } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SeverityBadge from '../../components/ui/SeverityBadge';
import StatusBadge from '../../components/ui/StatusBadge';
import { MOCK_COMPLAINTS } from '../../data/mockComplaints';
import { useRole } from '../../context/RoleContext';

export default function ComplaintDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role } = useRole();

  // MOCK FETCH
  const complaint = MOCK_COMPLAINTS.find((c) => c.id === id);

  const [reviewState, setReviewState] = useState<'idle' | 'loading' | 'success'>('idle');

  if (!complaint) {
    return (
      <div className="max-w-2xl mx-auto mt-10 text-center">
        <h2 className="text-xl font-semibold text-slate-800">Complaint Not Found</h2>
        <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg">Go Back</button>
      </div>
    );
  }

  // Derived state
  const isAuthority = role === 'authority';
  const vr = complaint.verificationResult;
  const hasVerification = !!vr;
  const isSubmittedOrFlagged = complaint.status === 'submitted' || complaint.status === 'flagged';
  const needsReview = isAuthority && (isSubmittedOrFlagged || vr?.outcome === 'inconclusive' || vr?.outcome === 'flagged');

  // Review action
  const handleReviewAction = () => {
    setReviewState('loading');
    setTimeout(() => {
      setReviewState('success');
      // In a real app we'd redirect or refetch here
    }, 1200);
  };

  if (reviewState === 'success') {
    return (
      <div className="max-w-lg mx-auto mt-10 text-center bg-white rounded-xl border border-slate-200 p-8">
        <CheckCircle2 size={28} className="text-green-600 mx-auto mb-4" />
        <h2 className="text-slate-800 font-semibold text-lg">Review Submitted</h2>
        <p className="text-slate-500 text-sm mt-1">The status has been updated successfully.</p>
        <button onClick={() => navigate('/complaints')} className="mt-4 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg">Back to Complaints</button>
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
              {/* Before */}
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
              {/* After */}
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

          {/* AI Verification Section */}
          {hasVerification && vr && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-slate-700 font-semibold text-sm flex items-center gap-2">
                  AI Verification Analysis
                </h3>
                {vr.outcome === 'verified' && <span className="flex items-center gap-1 text-green-600 text-xs font-semibold bg-green-50 px-2 py-0.5 rounded border border-green-200"><CheckCircle2 size={12}/> Verified</span>}
                {vr.outcome === 'flagged' && <span className="flex items-center gap-1 text-red-600 text-xs font-semibold bg-red-50 px-2 py-0.5 rounded border border-red-200"><AlertTriangle size={12}/> Flagged</span>}
                {vr.outcome === 'inconclusive' && <span className="flex items-center gap-1 text-amber-600 text-xs font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200"><HelpCircle size={12}/> Inconclusive</span>}
              </div>
              <div className="p-5">
                {/* Confidence Bar */}
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

                {/* Checks List */}
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
            </div>

            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Contractor</p>
              <p className="text-sm text-slate-700 mt-0.5">{complaint.contractorName || 'Not assigned'}</p>
            </div>
          </div>

          {/* Municipal Review Panel */}
          {needsReview && (
            <div className="bg-white rounded-xl border border-blue-200 overflow-hidden shadow-sm">
              <div className="bg-blue-50 px-5 py-3 border-b border-blue-100">
                <h3 className="text-blue-800 font-semibold text-sm">Municipal Review</h3>
                <p className="text-blue-600 text-xs mt-0.5">Action required for verification</p>
              </div>
              <div className="p-5 space-y-3">
                <button
                  onClick={() => handleReviewAction()}
                  disabled={reviewState === 'loading'}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-70"
                >
                  <Check size={16} /> Approve & Verify
                </button>
                <button
                  onClick={() => handleReviewAction()}
                  disabled={reviewState === 'loading'}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium disabled:opacity-70"
                >
                  <XCircle size={16} /> Reject / Request Re-work
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
