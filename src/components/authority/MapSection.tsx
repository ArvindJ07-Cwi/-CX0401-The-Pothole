import { MapPin } from 'lucide-react';
import type { Complaint } from '../../types';

const SEVERITY_COLOR: Record<string, string> = {
  critical: 'bg-red-500',
  high:     'bg-orange-400',
  medium:   'bg-amber-400',
  low:      'bg-green-400',
};

interface Props {
  complaints: Complaint[];
}

export default function MapSection({ complaints }: Props) {
  const counts = {
    critical: complaints.filter(c => c.severity === 'critical').length,
    high:     complaints.filter(c => c.severity === 'high').length,
    medium:   complaints.filter(c => c.severity === 'medium').length,
    low:      complaints.filter(c => c.severity === 'low').length,
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
        <div>
          <h3 className="text-slate-800 font-semibold text-sm">Pothole Locations</h3>
          <p className="text-slate-400 text-xs mt-0.5">Distribution across wards — map integration coming soon</p>
        </div>
        {/* Legend */}
        <div className="hidden sm:flex items-center gap-3">
          {(Object.entries(counts) as [string, number][]).map(([key, val]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full shrink-0 ${SEVERITY_COLOR[key]}`} />
              <span className="text-[11px] text-slate-500 capitalize">{key} ({val})</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Map placeholder body ── */}
      <div className="relative h-64 bg-slate-50 flex items-center justify-center overflow-hidden">
        {/* Grid background to suggest a map */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(#64748b 1px, transparent 1px), linear-gradient(90deg, #64748b 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Fake scattered pins */}
        {complaints.slice(0, 12).map((c, i) => {
          // Deterministic pseudo-random positions from index
          const left = 8 + ((i * 47 + 13) % 82);
          const top  = 10 + ((i * 31 + 7)  % 75);
          return (
            <div
              key={c.id}
              className="absolute group cursor-pointer"
              style={{ left: `${left}%`, top: `${top}%` }}
              title={`${c.referenceNo} — ${c.location.address}`}
            >
              <div
                className={`w-3 h-3 rounded-full border-2 border-white shadow ${SEVERITY_COLOR[c.severity]} group-hover:scale-125 transition-transform`}
              />
            </div>
          );
        })}

        {/* Centre message */}
        <div className="relative z-10 text-center pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
            <MapPin size={20} className="text-blue-500" />
          </div>
          <p className="text-slate-500 text-sm font-medium">Interactive Map</p>
          <p className="text-slate-400 text-xs mt-0.5">
            React Leaflet integration will render here
          </p>
        </div>
      </div>

      {/* ── Mobile legend ── */}
      <div className="sm:hidden flex flex-wrap gap-3 px-5 py-3 border-t border-slate-100">
        {(Object.entries(counts) as [string, number][]).map(([key, val]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full shrink-0 ${SEVERITY_COLOR[key]}`} />
            <span className="text-[11px] text-slate-500 capitalize">{key} ({val})</span>
          </div>
        ))}
      </div>
    </div>
  );
}
