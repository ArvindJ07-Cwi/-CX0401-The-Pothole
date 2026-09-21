/**
 * AuthProductPanel — right-side product introduction panel for SadakSetu.
 * Pure presentational; no props, no API calls.
 * Matches the layout of the reference screenshot.
 */
import {
  MapPin,
  Camera,
  ShieldCheck,
  Activity,
  Wrench,
  CheckCircle2,
  ArrowRight,
  Users,
  Building2,
  Zap,
  LayoutDashboard,
  FileText,
  Map,
  HardHat,
  BarChart2,
  User,
  X,
  Search,
  ChevronDown,
} from 'lucide-react';
import { SadakSetuMark } from './SadakSetuLogo';

// ── City silhouette background ───────────────────────────────────────────────
function CitySilhouette() {
  return (
    <svg
      aria-hidden="true"
      className="absolute top-0 right-0 h-56 w-auto opacity-[0.04] pointer-events-none"
      viewBox="0 0 420 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="0"   y="140" width="30"  height="60"  fill="#1e293b" />
      <rect x="10"  y="120" width="12"  height="20"  fill="#1e293b" />
      <rect x="35"  y="100" width="40"  height="100" fill="#1e293b" />
      <rect x="50"  y="80"  width="10"  height="20"  fill="#1e293b" />
      <rect x="80"  y="130" width="25"  height="70"  fill="#1e293b" />
      <rect x="110" y="90"  width="50"  height="110" fill="#1e293b" />
      <rect x="130" y="70"  width="10"  height="20"  fill="#1e293b" />
      <rect x="165" y="120" width="30"  height="80"  fill="#1e293b" />
      <rect x="200" y="80"  width="60"  height="120" fill="#1e293b" />
      <rect x="225" y="55"  width="12"  height="25"  fill="#1e293b" />
      <rect x="265" y="110" width="35"  height="90"  fill="#1e293b" />
      <rect x="305" y="95"  width="45"  height="105" fill="#1e293b" />
      <rect x="355" y="125" width="30"  height="75"  fill="#1e293b" />
      <rect x="390" y="100" width="30"  height="100" fill="#1e293b" />
      {/* Road at base */}
      <rect x="0" y="192" width="420" height="8" fill="#1e293b" />
      <rect x="0" y="185" width="420" height="4" fill="#1e293b" opacity="0.5" />
    </svg>
  );
}

// ── Mini dashboard preview ───────────────────────────────────────────────────
const NAV_ICONS = [LayoutDashboard, FileText, Map, HardHat, BarChart2, User];
const NAV_LABELS = ['Dashboard', 'Complaints', 'Map', 'Contractors', 'Reports', 'Profile'];

const MARKERS = [
  { top: '22%', left: '56%', color: 'bg-emerald-500' },
  { top: '42%', left: '30%', color: 'bg-amber-500'   },
  { top: '58%', left: '52%', color: 'bg-red-500'     },
  { top: '68%', left: '37%', color: 'bg-red-500'     },
  { top: '35%', left: '68%', color: 'bg-blue-500'    },
];

const LEGEND = [
  { color: 'bg-slate-400',   label: 'Reported'    },
  { color: 'bg-blue-500',    label: 'Assigned'    },
  { color: 'bg-amber-500',   label: 'In Progress' },
  { color: 'bg-teal-500',    label: 'Submitted'   },
  { color: 'bg-emerald-500', label: 'Verified'    },
  { color: 'bg-red-500',     label: 'Flagged'     },
];

function MiniDashboard() {
  return (
    <div
      className="w-full rounded-2xl overflow-hidden border border-slate-200 shadow-2xl bg-white flex"
      style={{ height: 268 }}
    >
      {/* ── Dark nav sidebar ── */}
      <div className="w-11 bg-[#0f172a] flex flex-col items-center pt-3 pb-2 shrink-0">
        <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center mb-4">
          <SadakSetuMark size={14} />
        </div>
        {NAV_ICONS.map((Icon, i) => (
          <div
            key={NAV_LABELS[i]}
            title={NAV_LABELS[i]}
            className={`w-7 h-7 rounded-lg flex items-center justify-center mb-1 ${
              i === 2 ? 'bg-blue-600' : 'text-slate-500'
            }`}
          >
            <Icon size={13} className={i === 2 ? 'text-white' : 'text-slate-500'} />
          </div>
        ))}
      </div>

      {/* ── Main map area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="flex items-center gap-1.5 px-2.5 py-2 bg-white border-b border-slate-100 shrink-0">
          <span className="text-[10px] font-bold text-slate-800 whitespace-nowrap">Pothole Map</span>
          <div className="flex-1 mx-2 flex items-center gap-1 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5">
            <Search size={8} className="text-slate-400 shrink-0" />
            <span className="text-[8px] text-slate-400">Search location...</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[8px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 flex items-center gap-0.5">
              All Status <ChevronDown size={7} />
            </span>
            <span className="text-[8px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 flex items-center gap-0.5">
              All Areas <ChevronDown size={7} />
            </span>
          </div>
        </div>

        {/* Map canvas */}
        <div className="flex-1 relative bg-[#dde4ec] overflow-hidden">
          {/* Road grid */}
          <svg className="absolute inset-0 w-full h-full" aria-hidden="true">
            {/* Horizontal roads */}
            <line x1="0" y1="35%" x2="100%" y2="35%" stroke="#b8c4ce" strokeWidth="3" />
            <line x1="0" y1="65%" x2="100%" y2="65%" stroke="#c8d3db" strokeWidth="2" />
            <line x1="0" y1="20%" x2="100%" y2="20%" stroke="#cdd7df" strokeWidth="1.5" />
            <line x1="0" y1="80%" x2="100%" y2="80%" stroke="#cdd7df" strokeWidth="1.5" />
            {/* Vertical roads */}
            <line x1="28%" y1="0" x2="28%" y2="100%" stroke="#b8c4ce" strokeWidth="3" />
            <line x1="62%" y1="0" x2="62%" y2="100%" stroke="#c8d3db" strokeWidth="2" />
            <line x1="82%" y1="0" x2="82%" y2="100%" stroke="#cdd7df" strokeWidth="1.5" />
            {/* Diagonal */}
            <line x1="0"   y1="10%" x2="45%" y2="100%" stroke="#c2cdd6" strokeWidth="1.5" />
            <line x1="50%" y1="0"   x2="100%" y2="70%" stroke="#c2cdd6" strokeWidth="1.5" />
            {/* Road centre dashes */}
            <line x1="0" y1="35%" x2="100%" y2="35%" stroke="white" strokeWidth="0.6" strokeDasharray="8 6" opacity="0.5" />
            <line x1="28%" y1="0" x2="28%" y2="100%" stroke="white" strokeWidth="0.6" strokeDasharray="8 6" opacity="0.5" />
          </svg>

          {/* Pothole markers */}
          {MARKERS.map((m, i) => (
            <div
              key={i}
              className="absolute"
              style={{ top: m.top, left: m.left, transform: 'translate(-50%, -100%)' }}
            >
              <div className={`w-3 h-3 rounded-full border-[1.5px] border-white shadow-md ${m.color}`} />
              <div className="w-px h-1.5 bg-slate-500/60 mx-auto" />
            </div>
          ))}

          {/* Zoom buttons */}
          <div className="absolute top-2 left-2 bg-white rounded shadow border border-slate-200 overflow-hidden">
            <div className="w-5 h-5 flex items-center justify-center text-[11px] text-slate-600 hover:bg-slate-50 cursor-pointer leading-none">+</div>
            <div className="border-t border-slate-200" />
            <div className="w-5 h-5 flex items-center justify-center text-[11px] text-slate-600 hover:bg-slate-50 cursor-pointer leading-none">−</div>
          </div>
        </div>

        {/* Legend bar */}
        <div className="flex items-center gap-2.5 px-2.5 py-1.5 bg-white border-t border-slate-100 shrink-0 flex-wrap">
          {LEGEND.map((l) => (
            <div key={l.label} className="flex items-center gap-1">
              <div className={`w-1.5 h-1.5 rounded-full ${l.color}`} />
              <span className="text-[8px] text-slate-500">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right detail panel ── */}
      <div className="w-44 bg-white border-l border-slate-100 flex flex-col shrink-0 overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
          <span className="text-[10px] font-bold text-slate-800">Pothole #1023</span>
          <X size={10} className="text-slate-400" />
        </div>
        <div className="flex-1 px-3 py-2 overflow-hidden">
          <p className="text-[9px] text-slate-500 mb-2 leading-tight">Ghodbunder Road, Thane</p>

          {/* Pothole photo placeholder */}
          <div className="w-full rounded-lg overflow-hidden mb-2" style={{ height: 64 }}>
            <div className="w-full h-full bg-gradient-to-br from-stone-300 to-stone-400 relative flex items-center justify-center">
              {/* Simulated cracked road */}
              <div className="w-10 h-7 rounded-full bg-stone-600/70 relative">
                <div className="absolute inset-0 rounded-full bg-stone-700/40" style={{ margin: '3px 4px' }} />
              </div>
              <div className="absolute bottom-1 right-2 text-[7px] text-stone-600 font-medium">road surface</div>
            </div>
          </div>

          <span className="inline-block text-[9px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold mb-1.5">
            In Progress
          </span>
          <p className="text-[8px] text-slate-400 mb-0.5">Reported: 12 Sep 2026</p>
          <p className="text-[9px] text-slate-600 mb-2">Assigned to: RoadFix Infra</p>
          <span className="text-[9px] text-blue-600 font-medium cursor-pointer">View Details →</span>
        </div>
      </div>
    </div>
  );
}

// ── Feature blocks ────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: <MapPin size={20} className="text-blue-600" />,
    bg: 'bg-blue-50',
    title: 'Location-aware reporting',
    body: 'Capture potholes with GPS and timestamps.',
  },
  {
    icon: <Camera size={20} className="text-emerald-600" />,
    bg: 'bg-emerald-50',
    title: 'Evidence-based verification',
    body: 'Compare before-and-after repair evidence with AI-assisted verification.',
  },
  {
    icon: <Activity size={20} className="text-violet-600" />,
    bg: 'bg-violet-50',
    title: 'Transparent tracking',
    body: 'Follow complaints across citizens, contractors, and municipal authorities.',
  },
];

// ── Workflow steps ────────────────────────────────────────────────────────────
const STEPS = [
  {
    num: '1',
    icon: <Camera size={15} className="text-blue-600" />,
    bg: 'bg-blue-100',
    label: 'Report',
    desc: 'Citizen reports a pothole with photo and location.',
  },
  {
    num: '2',
    icon: <Users size={15} className="text-blue-600" />,
    bg: 'bg-blue-100',
    label: 'Assign',
    desc: 'Municipal authority assigns a local contractor.',
  },
  {
    num: '3',
    icon: <Wrench size={15} className="text-amber-600" />,
    bg: 'bg-amber-100',
    label: 'Repair',
    desc: 'Contractor fixes the issue and uploads evidence.',
  },
  {
    num: '4',
    icon: <ShieldCheck size={15} className="text-emerald-600" />,
    bg: 'bg-emerald-100',
    label: 'Verify',
    desc: 'AI-assisted verification and municipal review.',
  },
  {
    num: '5',
    icon: <CheckCircle2 size={15} className="text-violet-600" />,
    bg: 'bg-violet-100',
    label: 'Safer Roads',
    desc: 'Issue closed. Better roads for everyone.',
  },
];

// ── Main export ───────────────────────────────────────────────────────────────
export default function AuthProductPanel() {
  return (
    <div className="relative flex-1 flex flex-col overflow-y-auto overflow-x-hidden bg-[#f0f5fa] px-8 pt-8 pb-6 lg:px-12 lg:pt-10">
      <CitySilhouette />

      {/* ── Header: brand + descriptor ── */}
      <div className="relative flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center shrink-0">
              <SadakSetuMark size={14} />
            </div>
            <span className="text-lg font-black tracking-tight text-slate-800 leading-none">SadakSetu</span>
          </div>
          <p className="text-[11px] text-slate-500 ml-8">Safer Roads. Stronger Communities.</p>
        </div>
        <div className="flex items-start gap-3 shrink-0">
          <div className="w-px h-8 bg-slate-300 mt-1" />
          <p className="text-[11px] text-slate-500 text-right leading-snug max-w-[160px]">
            A Smart Pothole<br />Management Platform
          </p>
        </div>
      </div>

      {/* ── Hero headline ── */}
      <div className="relative mb-5">
        <h1 className="text-[28px] lg:text-[32px] font-black text-slate-800 leading-tight mb-2.5">
          From pothole report<br />
          to{' '}
          <span className="text-blue-600">verified repair.</span>
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed max-w-lg">
          Report road damage, track repair progress, and help municipal authorities verify
          repairs with location-aware evidence.
        </p>
      </div>

      {/* ── Feature blocks ── */}
      <div className="relative grid grid-cols-3 gap-5 mb-6">
        {FEATURES.map((f) => (
          <div key={f.title}>
            <div className={`w-9 h-9 rounded-xl ${f.bg} flex items-center justify-center mb-2`}>
              {f.icon}
            </div>
            <p className="text-xs font-bold text-slate-700 mb-1 leading-tight">{f.title}</p>
            <p className="text-[11px] text-slate-500 leading-relaxed">{f.body}</p>
          </div>
        ))}
      </div>

      {/* ── Dashboard preview ── */}
      <div className="relative mb-6">
        <MiniDashboard />
      </div>

      {/* ── How it works ── */}
      <div className="relative mb-5">
        <p className="text-sm font-bold text-slate-700 mb-3">How it works?</p>
        <div className="flex items-start">
          {STEPS.map((step, i) => (
            <div key={step.label} className="flex items-start flex-1 min-w-0">
              <div className="flex flex-col items-center flex-1 min-w-0 px-1">
                <div className={`w-9 h-9 rounded-full ${step.bg} flex items-center justify-center mb-2 shrink-0`}>
                  {step.icon}
                </div>
                <p className="text-[11px] font-bold text-slate-700 text-center leading-tight mb-0.5">
                  {i + 1}. {step.label}
                </p>
                <p className="text-[10px] text-slate-400 text-center leading-tight hidden xl:block">
                  {step.desc}
                </p>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex items-center self-start mt-3.5 shrink-0">
                  <ArrowRight size={11} className="text-slate-300" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="relative mt-auto flex items-center gap-6 pt-4 border-t border-slate-200/80">
        <div className="flex items-center gap-1.5">
          <Users size={12} className="text-blue-500 shrink-0" />
          <span className="text-[11px] text-slate-500">Empowered Citizens</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Building2 size={12} className="text-blue-500 shrink-0" />
          <span className="text-[11px] text-slate-500">Efficient Governance</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Zap size={12} className="text-blue-500 shrink-0" />
          <span className="text-[11px] text-slate-500">Safer, Smarter Cities</span>
        </div>
      </div>
    </div>
  );
}
