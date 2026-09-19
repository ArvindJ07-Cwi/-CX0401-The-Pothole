import type { Severity } from '../../types';

const CONFIG: Record<Severity, { label: string; className: string }> = {
  low:      { label: 'Low',      className: 'bg-slate-100 text-slate-600 border-slate-200' },
  medium:   { label: 'Medium',   className: 'bg-amber-50  text-amber-700  border-amber-200' },
  high:     { label: 'High',     className: 'bg-orange-50 text-orange-700 border-orange-200' },
  critical: { label: 'Critical', className: 'bg-red-50    text-red-700    border-red-200' },
};

interface Props {
  severity: Severity;
}

export default function SeverityBadge({ severity }: Props) {
  const { label, className } = CONFIG[severity];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${className}`}
    >
      {label}
    </span>
  );
}
