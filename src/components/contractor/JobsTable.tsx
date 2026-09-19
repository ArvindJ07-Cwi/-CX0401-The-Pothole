import { Eye, Upload } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SeverityBadge from '../ui/SeverityBadge';
import StatusBadge from '../ui/StatusBadge';
import type { Complaint, ComplaintStatus } from '../../types';

interface Props {
  jobs: Complaint[];
}

const STATUS_OPTIONS: { value: ComplaintStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Jobs' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'verified', label: 'Verified' },
  { value: 'flagged', label: 'Flagged' },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export default function JobsTable({ jobs }: Props) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'all'>('all');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return jobs.filter((job) => {
      const matchesSearch =
        !q ||
        job.referenceNo.toLowerCase().includes(q) ||
        job.location.address.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [jobs, search, statusFilter]);

  return (
    <div className="bg-white rounded-xl border border-neutral-200 flex flex-col">
      {/* ── Header + filters ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-neutral-100">
        <div>
          <h3 className="text-neutral-800 font-semibold text-sm">Assigned Jobs</h3>
          <p className="text-neutral-400 text-xs mt-0.5">Manage your repair tasks</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ID, location…"
            className="pl-3 pr-3 py-1.5 text-xs border border-neutral-200 rounded-lg w-48 focus:outline-none focus:ring-2 focus:ring-neutral-900 bg-neutral-50 placeholder-neutral-400"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ComplaintStatus | 'all')}
            className="text-xs border border-neutral-200 rounded-lg px-3 py-1.5 bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-neutral-700"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50/60">
              <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide px-5 py-3">Ref No.</th>
              <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide px-4 py-3">Location</th>
              <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide px-4 py-3">Assigned Date</th>
              <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide px-4 py-3">Severity</th>
              <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide px-4 py-3">Status</th>
              <th className="text-left text-xs font-semibold text-neutral-500 uppercase tracking-wide px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-neutral-400 text-xs py-10">
                  No assigned jobs found.
                </td>
              </tr>
            ) : (
              filtered.map((job) => (
                <tr key={job.id} className="hover:bg-neutral-50/70 transition-colors">
                  <td className="px-5 py-3 whitespace-nowrap">
                    <span className="font-mono text-xs text-neutral-700 font-medium">{job.referenceNo}</span>
                  </td>
                  <td className="px-4 py-3 max-w-[200px]">
                    <p className="text-neutral-700 text-xs truncate" title={job.location.address}>
                      {job.location.address}
                    </p>
                    {job.location.ward && (
                      <p className="text-neutral-400 text-[11px]">{job.location.ward}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-neutral-500">
                    {formatDate(job.updatedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <SeverityBadge severity={job.severity} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={job.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => navigate(`/complaints/${job.id}`)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-600 text-[11px] font-medium transition-colors"
                      >
                        <Eye size={11} />
                        View
                      </button>
                      {(job.status === 'assigned' || job.status === 'in_progress' || job.status === 'flagged') && (
                        <button
                          type="button"
                          onClick={() => navigate(`/submit-repair/${job.id}`)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[11px] font-medium transition-colors border border-neutral-300"
                        >
                          <Upload size={11} />
                          Submit Evidence
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
