"use client";

import dynamic from "next/dynamic";
import { useSim } from "./SimProvider";
import type { MapPoint } from "./MapInner";
export type { MapPoint } from "./MapInner";

const MapInner = dynamic(() => import("./MapInner"), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full animate-pulse rounded-[10px] bg-[#ebe3d2]" />,
});

/** Leaflet map, or a plain list in low-data mode so no tiles are downloaded. */
export default function MapView(props: { points: MapPoint[]; height?: number; zoom?: number }) {
  const { lowData } = useSim();
  if (lowData) {
    return (
      <div className="rounded-[10px] border border-dashed border-[var(--line)] p-4">
        <p className="text-[13px] text-[var(--slate)]">Low-data mode: map tiles are off.</p>
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
