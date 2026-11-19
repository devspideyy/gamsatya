"use client";

import { scoreBand } from "@/lib/sim";
import { L } from "@/lib/phrases";

/** Rubber-stamp style seal showing the village score. The one bold element of the design. */
export function Seal({ score, name, size = 168, verified = true }: { score: number; name: string; size?: number; verified?: boolean }) {
  const band = scoreBand(score);
  const color = verified ? band.color : "var(--sindoor)";
  const id = `arc-${name.replace(/\W/g, "")}-${size}`;
  return (
    <svg width={size} height={size} viewBox="-14 -14 228 228" className="seal shrink-0" role="img" aria-label={`${name} village score ${score} out of 100, ${band.label}${verified ? "" : ", data tampered"}`}>
      <defs>
        <path id={`${id}-top`} d="M 30 100 A 70 70 0 0 1 170 100" />
        <path id={`${id}-bot`} d="M 22 100 A 78 78 0 0 0 178 100" />
      </defs>
      {/* alpana petal ring */}
      {Array.from({ length: 28 }, (_, i) => (
        <ellipse key={i} cx="100" cy="-4" rx="3.2" ry="7" fill="var(--brass)" opacity="0.75" transform={`rotate(${(i * 360) / 28} 100 100)`} />
      ))}
      <circle cx="100" cy="100" r="96" fill="var(--card)" />
      <circle cx="100" cy="100" r="94" fill="none" stroke={color} strokeWidth="4" />
      <circle cx="100" cy="100" r="86" fill="none" stroke={color} strokeWidth="1.5" />
      <circle cx="100" cy="100" r="52" fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="3 4" />
      <text fill={color} fontSize="14" fontWeight="600" letterSpacing="2">
        <textPath href={`#${id}-top`} startOffset="50%" textAnchor="middle">
          {verified ? "Sensor verified" : "Data tampered"}
        </textPath>
      </text>
      <text fill={color} fontSize="13" fontWeight="500" letterSpacing="1.5">
        <textPath href={`#${id}-bot`} startOffset="50%" textAnchor="middle">
          {name.length > 18 ? name.slice(0, 17) + "…" : name}
        </textPath>
      </text>
      <text x="100" y="112" textAnchor="middle" fill={color} fontSize="46" fontWeight="700" className="num">{score}</text>
      <text x="100" y="134" textAnchor="middle" fill={color} fontSize="12" fontWeight="500">of 100</text>
    </svg>
  );
}

export function toneColor(score: number) {
  return scoreBand(score).color;
}

/** Score as coloured text, no badge. */
export function ScoreText({ score }: { score: number }) {
  const b = scoreBand(score);
  return (
    <span className="whitespace-nowrap">
      <b className="num text-[17px]" style={{ color: b.color }}>{score}</b>
      <span className="ml-1.5 text-[13px] text-[var(--slate)]">{L(b.label)}</span>
    </span>
  );
}

export function TrustText({ trust }: { trust: number }) {
  const c = trust >= 80 ? "var(--paddy)" : trust >= 60 ? "var(--turmeric)" : "var(--sindoor)";
  return <b className="num" style={{ color: c }}>{trust}%</b>;
}

export function Sparkline({ values, width = 96, height = 28 }: { values: number[]; width?: number; height?: number }) {
  if (values.length < 2) return null;
  const min = Math.min(...values) - 3, max = Math.max(...values) + 3;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * width},${height - ((v - min) / (max - min || 1)) * height}`).join(" ");
  const last = values[values.length - 1], first = values[0];
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="inline-block align-middle" role="img" aria-label={`Trend from ${first} to ${last}`}>
      <polyline points={pts} fill="none" stroke={last >= first ? "var(--paddy)" : "var(--sindoor)"} strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

export function PageHeader({ title, lede, children }: { title: string; lede?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <header className="mb-8">
      <div className="flex flex-wrap items-end justify-between gap-4 pb-5">
        <div className="max-w-3xl">
          <h1 className="text-[34px] leading-tight md:text-[44px]">{title}</h1>
          {lede && <p className="mt-3 text-[17px] leading-relaxed text-[var(--slate)]">{lede}</p>}
        </div>
        {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
      </div>
      <div className="stitch" aria-hidden />
    </header>
  );
}

export function timeAgo(ts: number, now = Date.now()) {
  const s = Math.max(0, Math.round((now - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h} h ago`;
  return `${Math.round(h / 24)} days ago`;
}

export const rupees = (n: number) =>
  n >= 1e7 ? `₹${(n / 1e7).toFixed(2)} Cr` : n >= 1e5 ? `₹${(n / 1e5).toFixed(1)} L` : `₹${n.toLocaleString("en-IN")}`;
