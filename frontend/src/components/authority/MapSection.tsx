import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Eye, MapPin } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import SeverityBadge from '../ui/SeverityBadge';
import StatusBadge from '../ui/StatusBadge';
import type { Complaint, ComplaintStatus, Severity } from '../../types';

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-slate-400',
  assigned: 'bg-blue-500',
  in_progress: 'bg-amber-500',
  submitted: 'bg-violet-500',
  verified: 'bg-emerald-500',
  flagged: 'bg-red-500',
  rejected: 'bg-slate-400',
};

const STATUS_HEX: Record<string, string> = {
  pending: '#94a3b8',      // slate-400
  assigned: '#3b82f6',     // blue-500
  in_progress: '#f59e0b',  // amber-500
  submitted: '#8b5cf6',    // violet-500
  verified: '#10b981',     // emerald-500
  flagged: '#ef4444',      // red-500
  rejected: '#94a3b8',     // slate-400
};

const STATUS_LABEL: Record<string, string> = {
  pending: 'Reported',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  submitted: 'Submitted',
  verified: 'Verified',
  flagged: 'Flagged',
  rejected: 'Rejected',
};

interface Props {
  complaints: Complaint[];
}

// Child component to handle fitting bounds when filtered points change
function FitBounds({ coords }: { coords: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (coords.length > 0) {
      const bounds = L.latLngBounds(coords);
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 15 });
    }
  }, [map, coords]);
  return null;
}

// Generate a custom DivIcon based on status
function getIcon(status: string) {
  const color = STATUS_HEX[status] || '#94a3b8'; // fallback to grey
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.4);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -7],
  });
}

export default function MapSection({ complaints }: Props) {
  const navigate = useNavigate();
  const [severityFilter, setSeverityFilter] = useState<Severity | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'all'>('all');

  // Filter complaints based on selections and ensure they have valid coordinates
  const mapData = useMemo(() => {
    return complaints.filter((c) => {
      const hasCoords = c.location.coordinates?.lat && c.location.coordinates?.lng;
      const matchSeverity = severityFilter === 'all' || c.severity === severityFilter;
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      return hasCoords && matchSeverity && matchStatus;
    });
  }, [complaints, severityFilter, statusFilter]);

  // Extract coordinates for auto-fitting bounds
  const validCoords = useMemo(() => {
    return mapData.map((c) => [c.location.coordinates!.lat, c.location.coordinates!.lng] as [number, number]);
  }, [mapData]);

  // Legend counts (unfiltered by status, or filtered? We'll show total counts matching current status filter)
  const counts = {
    pending:     mapData.filter(c => c.status === 'pending').length,
    assigned:    mapData.filter(c => c.status === 'assigned').length,
    in_progress: mapData.filter(c => c.status === 'in_progress').length,
    submitted:   mapData.filter(c => c.status === 'submitted').length,
    verified:    mapData.filter(c => c.status === 'verified').length,
    flagged:     mapData.filter(c => c.status === 'flagged').length,
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col">
      {/* ── Header + Filters ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3 border-b border-slate-100">
        <div>
          <h3 className="text-slate-800 font-semibold text-sm">Interactive Map</h3>
          <p className="text-slate-400 text-xs mt-0.5">Showing {mapData.length} pothole{mapData.length !== 1 ? 's' : ''}</p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as any)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="submitted">Submitted</option>
            <option value="verified">Verified</option>
            <option value="flagged">Flagged</option>
          </select>
        </div>
      </div>

      {/* ── Legend ── */}
      <div className="flex items-center gap-4 px-5 py-2.5 bg-slate-50/50 border-b border-slate-100 overflow-x-auto">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Legend:</span>
        {(Object.entries(counts) as [string, number][]).map(([key, val]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${STATUS_COLOR[key]}`} />
            <span className="text-[11px] text-slate-600 whitespace-nowrap">{STATUS_LABEL[key]} ({val})</span>
          </div>
        ))}
      </div>

      {/* ── Map Container ── */}
      <div className="relative h-[400px] bg-slate-100 w-full z-0">
        {validCoords.length > 0 ? (
          <MapContainer
            center={validCoords[0]}
            zoom={12}
            scrollWheelZoom={true}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {mapData.map((c) => (
              <Marker
                key={c.id}
                position={[c.location.coordinates!.lat, c.location.coordinates!.lng]}
                icon={getIcon(c.status)}
              >
                <Popup className="custom-popup">
                  <div className="min-w-[180px]">
                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
                      <span className="font-mono text-xs font-semibold text-slate-700">{c.referenceNo}</span>
                      <StatusBadge status={c.status} />
                    </div>
                    <h4 className="text-sm font-semibold text-slate-800 mb-1">{c.title}</h4>
                    <p className="text-xs text-slate-600 flex items-start gap-1 mb-2">
                      <MapPin size={12} className="shrink-0 mt-0.5 text-slate-400" />
                      {c.location.address}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <SeverityBadge severity={c.severity} />
                      <button
                        onClick={() => navigate(`/complaints/${c.id}`)}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded text-[11px] font-medium transition-colors"
                      >
                        <Eye size={12} />
                        View
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
            <FitBounds coords={validCoords} />
          </MapContainer>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-50">
            <MapPin size={32} className="mb-2 text-slate-300" />
            <p className="text-sm font-medium">No potholes found</p>
            <p className="text-xs">Adjust your filters to see more results</p>
          </div>
        )}
      </div>
    </div>
  );
}
