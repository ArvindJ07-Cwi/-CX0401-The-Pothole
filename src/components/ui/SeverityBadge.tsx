import type { Severity } from '../../types';

const CONFIG: Record<Severity, { label: string; className: string }> = {
  low:      { label: 'Low',      className: 'bg-white text-neutral-500 border-neutral-200' },
  medium:   { label: 'Medium',   className: 'bg-neutral-50 text-neutral-600 border-neutral-200' },
  high:     { label: 'High',     className: 'bg-neutral-100 text-neutral-700 border-neutral-300' },
  critical: { label: 'Critical', className: 'bg-neutral-800 text-neutral-100 border-neutral-900' },
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
