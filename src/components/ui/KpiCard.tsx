interface Props {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  iconBg: string;
  sub?: string;
  subColor?: string;
}

export default function KpiCard({ label, value, icon, iconBg, sub, subColor = 'text-slate-400' }: Props) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-slate-500 text-xs font-medium uppercase tracking-wide leading-none">{label}</p>
        <p className="text-slate-800 text-2xl font-bold mt-1 leading-none">{value}</p>
        {sub && <p className={`text-[11px] mt-1.5 ${subColor}`}>{sub}</p>}
      </div>
    </div>
  );
}
