import { AlertTriangle, Eye, UserCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SeverityBadge from '../ui/SeverityBadge';
import type { Complaint, ComplaintStatus } from '../../types';

const API = 'http://localhost:8000';

const STATUS_OPTIONS: { value: ComplaintStatus | 'all'; label: string }[] = [
  { value: 'all',         label: 'All Statuses' },
  { value: 'pending',     label: 'Pending' },
  { value: 'assigned',    label: 'Assigned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'submitted',   label: 'Submitted' },
  { value: 'verified',    label: 'Verified' },
  { value: 'flagged',     label: 'Flagged' },
  { value: 'rejected',    label: 'Rejected' },
];

const PAGE_SIZE = 8;

interface Props {
  complaints: Complaint[];
  onRefresh: () => void;
  token: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export default function ComplaintsTable({ complaints, onRefresh, token }: Props) {
  const navigate = useNavigate();
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'all'>('all');
  const [page, setPage]               = useState(1);
  const [updatingId, setUpdatingId]   = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return complaints.filter((c) => {
      const matchesSearch =
        !q ||
        c.referenceNo.toLowerCase().includes(q) ||
        c.location.address.toLowerCase().includes(q) ||
        (c.contractorName ?? '').toLowerCase().includes(q) ||
        c.reportedBy.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [complaints, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const pageItems  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function handleSearch(val: string) { setSearch(val); setPage(1); }
  function handleStatus(val: ComplaintStatus | 'all') { setStatusFilter(val); setPage(1); }

  async function handleStatusChange(complaintId: string, newStatus: string) {
    setUpdatingId(complaintId);
    try {
      await axios.patch(
        `${API}/api/complaints/${complaintId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      onRefresh();
    } catch {
      alert('Failed to update status. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 flex flex-col">
      {/* ── Header + controls ── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 border-b border-slate-100">
        <div className="flex-1">
          <h3 className="text-slate-800 font-semibold text-sm">Complaints Register</h3>
          <p className="text-slate-400 text-xs mt-0.5">
            Showing {filtered.length} of {complaints.length} records
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="search"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search ID, location…"
            className="pl-3 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg w-48 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 placeholder-slate-400"
            aria-label="Search complaints"
          />
          <select
            value={statusFilter}
            onChange={(e) => handleStatus(e.target.value as ComplaintStatus | 'all')}
            className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
            aria-label="Filter by status"
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
            <tr className="border-b border-slate-100 bg-slate-50/60">
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3 whitespace-nowrap">Ref No.</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Location</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3 whitespace-nowrap">Reported</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Severity</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Contractor</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Status</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pageItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center text-slate-400 text-xs py-10">
                  No complaints match your filters.
                </td>
              </tr>
            ) : (
              pageItems.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      {c.status === 'flagged' && (
                        <AlertTriangle size={12} className="text-red-500 shrink-0" aria-label="Flagged" />
                      )}
                      <span className="font-mono text-xs text-slate-700 font-medium">{c.referenceNo}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 max-w-[200px]">
                    <p className="text-slate-700 text-xs truncate" title={c.location.address}>
                      {c.location.address}
                    </p>
                    {c.location.ward && (
                      <p className="text-slate-400 text-[11px]">{c.location.ward}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500">
                    {formatDate(c.reportedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <SeverityBadge severity={c.severity} />
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    {c.contractorName ?? (
                      <span className="text-slate-300 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {/* Inline status dropdown for authority */}
                    <select
                      value={c.status}
                      disabled={updatingId === c.id}
                      onChange={(e) => handleStatusChange(c.id, e.target.value)}
                      className="text-[11px] border border-slate-200 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700 disabled:opacity-50"
                      aria-label={`Change status for ${c.referenceNo}`}
                    >
                      {STATUS_OPTIONS.filter(o => o.value !== 'all').map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => navigate(`/complaints/${c.id}`)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-medium transition-colors"
                        aria-label={`View complaint ${c.referenceNo}`}
                      >
                        <Eye size={11} />
                        View
                      </button>
                      {c.status === 'pending' && (
                        <button
                          type="button"
                          onClick={() => navigate(`/complaints/${c.id}`)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-medium transition-colors border border-blue-200"
                          aria-label={`Assign contractor for ${c.referenceNo}`}
                        >
                          <UserCheck size={11} />
                          Assign
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

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
          <p className="text-xs text-slate-400">Page {safePage} of {totalPages}</p>
          <div className="flex gap-1.5">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setPage(safePage - 1)}
              className="px-3 py-1 text-xs rounded-md border border-slate-200 text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >
              Prev
            </button>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setPage(safePage + 1)}
              className="px-3 py-1 text-xs rounded-md border border-slate-200 text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
