import { AlertTriangle, CheckCircle2, ChevronRight, Clock, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../ui/StatusBadge';
import type { Complaint } from '../../types';

interface Props {
  complaints: Complaint[];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

/** Small inline status icon for timeline feel */
function StatusIcon({ status }: { status: Complaint['status'] }) {
  if (status === 'verified')
    return <CheckCircle2 size={14} className="text-green-500" />;
  if (status === 'flagged')
    return <AlertTriangle size={14} className="text-red-500" />;
  return <Clock size={14} className="text-amber-400" />;
}

export default function MyReportsList({ complaints }: Props) {
  const navigate = useNavigate();

  if (complaints.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
        <MapPin size={32} className="text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500 font-medium text-sm">No reports yet</p>
        <p className="text-slate-400 text-xs mt-1">
          Use the <strong>Report Pothole</strong> button to submit your first complaint.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <h3 className="text-slate-800 font-semibold text-sm">My Reports</h3>
          <p className="text-slate-400 text-xs mt-0.5">
            {complaints.length} complaint{complaints.length !== 1 ? 's' : ''} submitted{' '}
            <span className="text-slate-300">[MOCK DATA]</span>
          </p>
        </div>
      </div>

      {/* List */}
      <ul className="divide-y divide-slate-100">
        {complaints.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => navigate(`/complaints/${c.id}`)}
              className="w-full text-left px-5 py-4 hover:bg-slate-50 transition-colors group"
              aria-label={`View complaint ${c.referenceNo}`}
            >
              <div className="flex items-start gap-3">
                {/* Status icon */}
                <div className="mt-0.5 shrink-0">
                  <StatusIcon status={c.status} />
                </div>

                {/* Main content */}
                <div className="flex-1 min-w-0">
                  {/* Top row */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="font-mono text-xs font-semibold text-slate-600">
                      {c.referenceNo}
                    </span>
                    <StatusBadge status={c.status} />
                  </div>

                  {/* Title */}
                  <p className="text-slate-700 text-sm font-medium mt-1 leading-snug truncate">
                    {c.title}
                  </p>

                  {/* Location + date */}
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      <MapPin size={10} />
                      {c.location.address}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {formatDate(c.reportedAt)}
                    </span>
                  </div>

                  {/* Contractor row */}
                  {c.contractorName && (
                    <p className="text-[11px] text-slate-400 mt-1">
                      Contractor: <span className="text-slate-500">{c.contractorName}</span>
                    </p>
                  )}

                  {/* Flagged note */}
                  {c.status === 'flagged' && c.verificationResult?.flagReason && (
                    <p className="text-[11px] text-red-500 mt-1.5 flex items-center gap-1">
                      <AlertTriangle size={10} />
                      {c.verificationResult.flagReason}
                    </p>
                  )}
                </div>

                {/* Chevron */}
                <ChevronRight
                  size={16}
                  className="text-slate-300 group-hover:text-slate-500 shrink-0 mt-1 transition-colors"
                />
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
