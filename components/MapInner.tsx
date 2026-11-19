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

/** A shaded square on the map, e.g. an area count in the safety heat map */
export interface MapCell {
  south: number;
  west: number;
  north: number;
  east: number;
  color: string;
  opacity: number;
  label: string;
  selected?: boolean;
}

export interface MapProps {
  points: MapPoint[];
  cells?: MapCell[];
  height?: number;
  zoom?: number;
  /** Fit the view to these bounds instead of the points: [south, west, north, east] */
  focus?: [number, number, number, number];
  onCellClick?: (index: number) => void;
}

export default function MapInner({ points, cells = [], height = 340, zoom, focus, onCellClick }: MapProps) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);
  const clickRef = useRef(onCellClick);
  clickRef.current = onCellClick;

  useEffect(() => {
    if (!el.current || map.current) return;
    map.current = L.map(el.current, { scrollWheelZoom: false, attributionControl: true, zoomSnap: 0.25 });
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

  const key = JSON.stringify([points.map((p) => [p.lat, p.lng, p.color, p.label, p.ring]), cells.map((c) => [c.color, c.opacity, c.label, c.selected]), focus]);
  useEffect(() => {
    const m = map.current, g = layer.current;
    if (!m || !g) return;
    g.clearLayers();
    cells.forEach((c, i) => {
      const r = L.rectangle([[c.south, c.west], [c.north, c.east]], {
        color: c.selected ? "#1d2847" : "#ffffff", weight: c.selected ? 3 : 0.6, fillColor: c.color, fillOpacity: c.opacity,
      }).bindTooltip(c.label, { sticky: true });
      r.on("click", () => clickRef.current?.(i));
      r.addTo(g);
    });
    for (const p of points) {
      const c = L.circleMarker([p.lat, p.lng], {
        radius: p.radius ?? 9, color: p.ring ? "#1d2847" : "#fff", weight: p.ring ? 4 : 2, fillColor: p.color, fillOpacity: 0.95,
      }).bindTooltip(p.label);
      if (p.href) c.on("click", () => { window.location.href = p.href!; });
      c.addTo(g);
    }
    if (focus) {
      m.fitBounds([[focus[0], focus[1]], [focus[2], focus[3]]], { maxZoom: 15 });
    } else if (points.length || cells.length) {
      const all: [number, number][] = [
        ...points.map((p) => [p.lat, p.lng] as [number, number]),
        ...cells.flatMap((c) => [[c.south, c.west], [c.north, c.east]] as [number, number][]),
      ];
      const b = L.latLngBounds(all);
      if (zoom) m.setView(b.getCenter(), zoom);
      else m.fitBounds(b.pad(cells.length ? 0.02 : 0.25), { maxZoom: 15 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return <div ref={el} style={{ height }} className="w-full overflow-hidden rounded-[10px] border border-[var(--line)] bg-[#ebe3d2]" />;
}
