"use client";

import dynamic from "next/dynamic";
import { useSim } from "./SimProvider";
import type { MapProps } from "./MapInner";
import { L } from "@/lib/phrases";
export type { MapPoint, MapCell } from "./MapInner";

const MapInner = dynamic(() => import("./MapInner"), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full animate-pulse rounded-[10px] bg-[#ebe3d2]" />,
});

/** Leaflet map, or a plain list in low-data mode so no tiles are downloaded. */
export default function MapView(props: MapProps) {
  const { lowData } = useSim();
  if (lowData && props.cells?.length) {
    return (
      <div className="rounded-[10px] border border-dashed border-[var(--line)] p-4 text-[14px]">
        <p className="text-[13px] text-[var(--slate)]">{L("Low-data mode: map tiles are off. Areas listed by count.")}</p>
        <ul className="mt-2 grid gap-1 sm:grid-cols-2">
          {props.cells.map((c, i) => ({ c, i })).filter(({ c }) => c.opacity > 0.12).map(({ c, i }) => (
            <li key={i}><button className="text-left hover:underline" onClick={() => props.onCellClick?.(i)}>{c.label}</button></li>
          ))}
        </ul>
      </div>
    );
  }
  if (lowData) {
    return (
      <div className="rounded-[10px] border border-dashed border-[var(--line)] p-4">
        <p className="text-[13px] text-[var(--slate)]">{L("Low-data mode: map tiles are off.")}</p>
        <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
          {props.points.map((p, i) => (
            <li key={i} className="flex items-center gap-2 text-[14px]">
              <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: p.color, outline: p.ring ? "2px solid var(--ink)" : undefined }} />
              {p.href ? <a href={p.href} className="hover:underline">{p.label}</a> : p.label}
            </li>
          ))}
        </ul>
      </div>
    );
  }
  return <MapInner {...props} />;
}
