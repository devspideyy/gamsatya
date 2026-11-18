"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";

export interface MapPoint {
  lat: number;
  lng: number;
  label: string;
  color: string;
  radius?: number;
  href?: string;
  /** Dark ring around the marker, used to flag villages whose data needs checking */
  ring?: boolean;
}

export default function MapInner({ points, height = 340, zoom }: { points: MapPoint[]; height?: number; zoom?: number }) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!el.current || map.current) return;
    map.current = L.map(el.current, { scrollWheelZoom: false, attributionControl: true });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map.current);
    layer.current = L.layerGroup().addTo(map.current);
    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    const m = map.current, g = layer.current;
    if (!m || !g) return;
    g.clearLayers();
    for (const p of points) {
      const c = L.circleMarker([p.lat, p.lng], {
        radius: p.radius ?? 9, color: p.ring ? "#1d2847" : "#fff", weight: p.ring ? 4 : 2, fillColor: p.color, fillOpacity: 0.95,
      }).bindTooltip(p.label);
      if (p.href) c.on("click", () => { window.location.href = p.href!; });
      c.addTo(g);
    }
    if (points.length) {
      const b = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
      if (zoom) m.setView(b.getCenter(), zoom);
      else m.fitBounds(b.pad(0.25), { maxZoom: 15 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(points.map((p) => [p.lat, p.lng, p.color, p.label, p.ring]))]);

  return <div ref={el} style={{ height }} className="w-full overflow-hidden rounded-[10px] border border-[var(--line)] bg-[#ebe3d2]" />;
}
