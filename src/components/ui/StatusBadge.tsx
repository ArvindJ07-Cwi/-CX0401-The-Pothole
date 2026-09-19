import type { ComplaintStatus } from '../../types';

const CONFIG: Record<
  ComplaintStatus,
  { label: string; className: string }
> = {
  pending:     { label: 'Pending',     className: 'bg-amber-50  text-amber-700  border-amber-200'  },
  assigned:    { label: 'Assigned',    className: 'bg-blue-50   text-blue-700   border-blue-200'   },
  in_progress: { label: 'In Progress', className: 'bg-violet-50 text-violet-700 border-violet-200' },
  submitted:   { label: 'Submitted',   className: 'bg-sky-50    text-sky-700    border-sky-200'    },
  verified:    { label: 'Verified',    className: 'bg-green-50  text-green-700  border-green-200'  },
  flagged:     { label: 'Flagged',     className: 'bg-red-50    text-red-700    border-red-200'    },
  rejected:    { label: 'Rejected',    className: 'bg-slate-100 text-slate-500  border-slate-200'  },
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
