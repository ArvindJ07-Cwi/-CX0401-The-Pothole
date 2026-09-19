import type { ComplaintStatus } from '../../types';

const CONFIG: Record<
  ComplaintStatus,
  { label: string; className: string }
> = {
  pending:     { label: 'Pending',     className: 'bg-amber-50/50 text-amber-700 border-amber-200/50' },
  assigned:    { label: 'Assigned',    className: 'bg-neutral-50 text-neutral-600 border-neutral-200' },
  in_progress: { label: 'In Progress', className: 'bg-neutral-100 text-neutral-700 border-neutral-200' },
  submitted:   { label: 'Submitted',   className: 'bg-neutral-100 text-neutral-800 border-neutral-300' },
  verified:    { label: 'Verified',    className: 'bg-green-50/50 text-green-700 border-green-200/50' },
  flagged:     { label: 'Flagged',     className: 'bg-red-50/50 text-red-700 border-red-200/50' },
  rejected:    { label: 'Rejected',    className: 'bg-neutral-50 text-neutral-400 border-neutral-200' },
};

interface Props {
  status: ComplaintStatus;
}

export default function StatusBadge({ status }: Props) {
  const { label, className } = CONFIG[status];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${className}`}
    >
      {label}
    </span>
  );
}
