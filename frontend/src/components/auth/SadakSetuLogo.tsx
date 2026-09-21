/**
 * SadakSetuLogo — reusable brand mark combining a location pin and a road symbol.
 * "Sadak" = Road, "Setu" = Bridge/Connection
 */
interface LogoProps {
  size?: number;
  className?: string;
}

export function SadakSetuMark({ size = 32, className = '' }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="SadakSetu logo mark"
    >
      {/* Location pin body */}
      <path
        d="M16 2C10.477 2 6 6.477 6 12c0 7.5 10 18 10 18S26 19.5 26 12c0-5.523-4.477-10-10-10z"
        fill="white"
      />
      {/* Road lanes inside the pin */}
      <rect x="13.5" y="5.5" width="2" height="9" rx="1" fill="#2563EB" />
      <rect x="16.5" y="5.5" width="2" height="9" rx="1" fill="#2563EB" />
      {/* Center dashed divider */}
      <rect x="15.25" y="6"   width="1.5" height="2.2" rx="0.75" fill="white" opacity="0.7" />
      <rect x="15.25" y="9"   width="1.5" height="2.2" rx="0.75" fill="white" opacity="0.7" />
      <rect x="15.25" y="12"  width="1.5" height="2.2" rx="0.75" fill="white" opacity="0.7" />
      {/* Pin centre dot */}
      <circle cx="16" cy="12" r="2.8" fill="#2563EB" />
      <circle cx="16" cy="12" r="1.1" fill="white" />
    </svg>
  );
}

/** Full inline logo (mark + wordmark) */
export function SadakSetuLogo({ iconSize = 36 }: { iconSize?: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="rounded-xl bg-blue-600 flex items-center justify-center shadow-sm shrink-0"
        style={{ width: iconSize, height: iconSize }}
      >
        <SadakSetuMark size={Math.round(iconSize * 0.72)} />
      </div>
      <span className="text-xl font-black tracking-tight text-slate-900 leading-none select-none">
        SadakSetu
      </span>
    </div>
  );
}
