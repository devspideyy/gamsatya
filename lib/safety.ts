// Aggregated, synthetic safety-report counts on a grid over the block.
// Counts only: no names, no exact places. Squares with fewer than 3 reports are hidden.
import { VILLAGES } from "./data";
import { noise } from "./sim";

export const SAFETY_CATS = ["Dark street", "Harassment", "Theft", "Other"] as const;
export type SafetyCat = (typeof SAFETY_CATS)[number];
export const CAT_LABEL: Record<SafetyCat, { en: string; bn: string; hi: string }> = {
  "Dark street": { en: "Dark street", bn: "অন্ধকার রাস্তা", hi: "अँधेरी सड़क" },
  Harassment: { en: "Harassment", bn: "হয়রানি", hi: "उत्पीड़न" },
  Theft: { en: "Theft", bn: "চুরি", hi: "चोरी" },
  Other: { en: "Other", bn: "অন্যান্য", hi: "अन्य" },
};

const SOUTH = 22.07, NORTH = 22.23, WEST = 88.745, EAST = 88.93;
export const ROWS = 8, COLS = 9;
const dLat = (NORTH - SOUTH) / ROWS, dLng = (EAST - WEST) / COLS;
export const MIN_SHOWN = 3;

export interface SafetyCell {
  index: number;
  code: string;
  south: number; west: number; north: number; east: number;
  /** 90-day counts by category */
  counts: Record<SafetyCat, number>;
  /** Share of reports after dark (6 pm to 6 am) */
  afterDark: number;
  nearestVillage: string;
  distanceKm: number;
}

function km(aLat: number, aLng: number, bLat: number, bLng: number) {
  const x = (bLng - aLng) * 111.3 * Math.cos(((aLat + bLat) / 2) * Math.PI / 180);
  const y = (bLat - aLat) * 111.3;
  return Math.sqrt(x * x + y * y);
}

export const SAFETY_CELLS: SafetyCell[] = Array.from({ length: ROWS * COLS }, (_, i) => {
  const r = Math.floor(i / COLS), c = i % COLS;
  const south = SOUTH + r * dLat, west = WEST + c * dLng;
  const cLat = south + dLat / 2, cLng = west + dLng / 2;
  const near = VILLAGES.map((v) => ({ v, d: km(cLat, cLng, v.lat, v.lng) })).sort((a, b) => a.d - b.d)[0];
  // More people nearby, more reports
  const pull = Math.max(0, 1.4 - near.d / 2.2) * (near.v.population / 4500);
  const counts = {} as Record<SafetyCat, number>;
  SAFETY_CATS.forEach((cat, k) => {
    const base = [6, 3, 3, 2][k];
    counts[cat] = Math.floor(noise(`safety-${cat}`, i) ** 1.6 * base * pull * 2.2);
  });
  return {
    index: i,
    code: `${String.fromCharCode(65 + (ROWS - 1 - r))}${c + 1}`,
    south, west, north: south + dLat, east: west + dLng,
    counts,
    afterDark: 0.45 + noise("safety-dark", i) * 0.45,
    nearestVillage: near.v.id,
    distanceKm: Math.round(near.d * 10) / 10,
  };
});

export function cellTotal(c: SafetyCell, cat: SafetyCat | "All", days: 30 | 90) {
  const n = cat === "All" ? SAFETY_CATS.reduce((a, k) => a + c.counts[k], 0) : c.counts[cat];
  return days === 30 ? Math.round(n / 3) : n;
}
