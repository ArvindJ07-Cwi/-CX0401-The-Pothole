import { AlertTriangle, ArrowRight, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Complaint } from '../../types';

interface Props {
  complaints: Complaint[];
}

function ConfidenceBar({ value }: { value: number }) {
  const color =
    value >= 75 ? 'bg-green-500' :
    value >= 50 ? 'bg-amber-500' :
    'bg-red-500';

  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-[11px] text-slate-500 shrink-0 w-8 text-right">{value}%</span>
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export default function FlaggedPanel({ complaints }: Props) {
  const navigate = useNavigate();
  const flagged  = complaints.filter(
    (c) => c.status === 'flagged' ||
           c.verificationResult?.outcome === 'inconclusive',
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <h3 className="text-slate-800 font-semibold text-sm flex items-center gap-1.5">
            <AlertTriangle size={14} className="text-red-500" />
            Flagged &amp; Inconclusive
          </h3>
          <p className="text-slate-400 text-xs mt-0.5">Needs manual review</p>
        </div>
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600 text-xs font-bold">
          {flagged.length}
        </span>
      </div>

      {/* List */}
      <div className="flex-1 divide-y divide-slate-100 overflow-y-auto max-h-[420px]">
        {flagged.length === 0 ? (
          <p className="text-slate-400 text-xs text-center py-10">No flagged cases. All clear.</p>
        ) : (
          flagged.map((c) => {
            const outcome = c.verificationResult?.outcome;
            const isFlagged = outcome === 'flagged';
            const isInconclusive = outcome === 'inconclusive';
            return (
              <div key={c.id} className="px-4 py-3.5">
                {/* Top row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      {isFlagged && (
                        <AlertTriangle size={12} className="text-red-500 shrink-0 mt-px" />
                      )}
                      {isInconclusive && (
                        <HelpCircle size={12} className="text-amber-500 shrink-0 mt-px" />
                      )}
                      <span className="font-mono text-xs font-semibold text-slate-700">
                        {c.referenceNo}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px] mt-0.5 truncate max-w-[180px]" title={c.location.address}>
                      {c.location.address}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${
                      isFlagged
                        ? 'bg-red-50 text-red-600 border border-red-200'
                        : 'bg-amber-50 text-amber-600 border border-amber-200'
                    }`}
                  >
                    {isFlagged ? 'Flagged' : 'Inconclusive'}
                  </span>
                </div>

                {/* Flag reason */}
                {c.verificationResult?.flagReason && (
                  <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                    {c.verificationResult.flagReason}
                  </p>
                )}

                {/* Confidence bar */}
                {c.verificationResult?.confidence !== undefined && (
                  <div className="mt-2">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">AI Confidence</p>
                    <ConfidenceBar value={c.verificationResult.confidence} />
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between mt-2.5">
                  <p className="text-[10px] text-slate-400">
                    Updated {formatDate(c.updatedAt)}
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate(`/complaints/${c.id}`)}
                    className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 font-medium"
                    aria-label={`Review ${c.referenceNo}`}
                  >
                    Review <ArrowRight size={10} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
