import {
  ASSETS, Asset, FAULTS, Indicator, RIVER_DANGER_M, SENSORS, Sensor, SensorType, VILLAGES, Village,
} from "./data";

export const DAY = 86_400_000;

export interface Reading {
  sensor: Sensor;
  value: number;
  unit: string;
  ok: boolean;
  warn: boolean;
  source: "simulated" | "device";
  ts: number;
}

export interface AssetStatus {
  asset: Asset;
  status: "Working" | "At risk" | "Dried up";
  current: number;
  workingMonths: number;
  costPerWorkingMonth: number | null;
}

export interface Mismatch {
  indicator: Indicator;
  claimed: number;
  measured: number;
}

export type Declaration = Village["selfReport"];

export interface VillageSnapshot {
  village: Village;
  /** What the panchayat declared this month (self-reported, not measured) */
  declared: Declaration;
  readings: Reading[];
  indicators: Record<Indicator, number>;
  score: number;
  trust: number;
  coverage: number;
  mismatches: Mismatch[];
  faults: Reading[];
  river?: Reading;
  assets: AssetStatus[];
}

export interface SimOptions {
  surge?: Record<string, number>;
  overrides?: Record<string, { value: number; ts: number }>;
  reportResolution?: Record<string, number | undefined>;
  brokenLedger?: Set<string>;
  declarations?: Record<string, Declaration>;
}

/** Deterministic pseudo-random 0..1 from a string + number */
export function noise(key: string, n: number): number {
  let h = 2166136261 ^ Math.floor(n);
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h ^= h >>> 13;
  h = Math.imul(h, 0x5bd1e995);
  h ^= h >>> 15;
  return (h >>> 0) / 4294967295;
}

export function isBroken(sensorId: string, daysAgo: number) {
  return FAULTS.some((f) => f.sensorId === sensorId && daysAgo <= f.since && (f.until === undefined || daysAgo > f.until));
}

export function faultSince(sensorId: string): number | undefined {
  return FAULTS.find((f) => f.sensorId === sensorId && f.until === undefined)?.since;
}

const UNITS: Record<SensorType, string> = { tank: "%", handpump: "L/min", streetlight: "W", bin: "% full", river: "m" };

export function judge(type: SensorType, value: number) {
  switch (type) {
    case "tank": return { ok: value >= 25, warn: value < 40 };
    case "handpump": return { ok: value > 2, warn: value < 8 };
    case "streetlight": return { ok: value > 5, warn: false };
    case "bin": return { ok: value < 85, warn: value >= 70 };
    case "river": return { ok: value < RIVER_DANGER_M, warn: value >= RIVER_DANGER_M - 0.5 };
  }
}

export function simulateValue(s: Sensor, v: Village, at: number, daysAgo: number, surge = 0) {
  const n = noise(s.id, at / 4000);
  const hour = new Date(at).getHours() + new Date(at).getMinutes() / 60;
  const broken = isBroken(s.id, daysAgo);
  switch (s.type) {
    case "tank": {
      if (broken) return 6 + n * 7;
      return Math.max(0, Math.min(100, v.tankBase + 12 * Math.sin((2 * Math.PI * (hour - 6)) / 24) + (n - 0.5) * 8));
    }
    case "handpump": return broken ? 0 : 10.5 + n * 3.5;
    case "streetlight": return broken ? 0 : 17 + n * 3;
    case "bin": {
      if (broken) return Math.min(100, 88 + n * 12);
      return Math.max(5, Math.min(80, v.binBase + hour * 0.9 + (n - 0.5) * 10));
    }
    case "river": {
      const tide = 0.7 * Math.sin((2 * Math.PI * at) / (12.42 * 3_600_000));
      const base = 2.7 + tide + n * 0.1;
      if (surge <= 0) return base;
      // surge = storm intensity 0..1; at full intensity the river sits above the danger line
      const peak = v.id === "haripur-char" ? RIVER_DANGER_M + 0.7 : RIVER_DANGER_M + 0.35;
      return base + (peak - base) * Math.min(1, surge);
    }
  }
}

export function readingsFor(v: Village, at: number, daysAgo: number, opts: SimOptions = {}): Reading[] {
  return SENSORS.filter((s) => s.villageId === v.id).map((s) => {
    const o = opts.overrides?.[s.id];
    const useDevice = daysAgo === 0 && o && at - o.ts < 120_000;
    const value = useDevice ? o.value : simulateValue(s, v, at, daysAgo, opts.surge?.[v.id] ?? 0);
    return { sensor: s, value, unit: UNITS[s.type], ...judge(s.type, value), source: useDevice ? "device" : "simulated", ts: useDevice ? o.ts : at };
  });
}

export function assetStatus(a: Asset): AssetStatus {
  const current = a.levels[a.levels.length - 1];
  const status = current >= 40 ? "Working" : current >= 15 ? "At risk" : "Dried up";
  const workingMonths = a.levels.filter((l) => l >= 25).length;
  return { asset: a, status, current, workingMonths, costPerWorkingMonth: workingMonths ? Math.round(a.cost / workingMonths) : null };
}

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const pct = (rs: Reading[]) => (rs.length ? (100 * rs.filter((r) => r.ok).length) / rs.length : 100);

export const WEIGHTS: Record<Indicator, number> = { water: 0.3, energy: 0.2, sanitation: 0.2, assets: 0.15, governance: 0.15 };

export function computeIndicators(v: Village, readings: Reading[], assets: AssetStatus[], resolution?: number) {
  const of = (t: SensorType) => readings.filter((r) => r.sensor.type === t);
  const tanks = of("tank"), pumps = of("handpump"), lights = of("streetlight"), bins = of("bin");
  const water = 0.5 * Math.min(100, avg(tanks.map((r) => r.value)) * 1.15) + 0.5 * pct(pumps);
  const energy = pct(lights);
  const sanitation = 0.7 * pct(bins) + 0.3 * (100 - avg(bins.map((r) => r.value)));
  const assetScore = assets.length ? avg(assets.map((a) => (a.status === "Working" ? 100 : a.status === "At risk" ? 55 : 10))) : 70;
  const governance = resolution === undefined ? v.govBase : 0.5 * v.govBase + 0.5 * resolution;
  const ind: Record<Indicator, number> = {
    water: Math.round(water), energy: Math.round(energy), sanitation: Math.round(sanitation),
    assets: Math.round(assetScore), governance: Math.round(governance),
  };
  const score = Math.round((Object.keys(WEIGHTS) as Indicator[]).reduce((s, k) => s + ind[k] * WEIGHTS[k], 0));
  return { indicators: ind, score };
}

export function snapshot(v: Village, at: number, opts: SimOptions = {}): VillageSnapshot {
  const readings = readingsFor(v, at, 0, opts);
  const assets = ASSETS.filter((a) => a.villageId === v.id).map(assetStatus);
  const { indicators, score } = computeIndicators(v, readings, assets, opts.reportResolution?.[v.id]);
  const declared = opts.declarations?.[v.id] ?? v.selfReport;
  const mismatches: Mismatch[] = (["water", "energy", "sanitation"] as const)
    .filter((k) => declared[k] - indicators[k] > 15)
    .map((k) => ({ indicator: k, claimed: declared[k], measured: indicators[k] }));
  const coverage = 80; // 4 of 5 indicators come from sensors; governance comes from citizen reports
  let trust = 100 - mismatches.length * 14 - (opts.brokenLedger?.has(v.id) ? 35 : 0);
  trust = Math.max(5, Math.min(100, trust));
  return {
    village: v, declared, readings, indicators, score, trust, coverage, mismatches,
    faults: readings.filter((r) => !r.ok),
    river: readings.find((r) => r.sensor.type === "river"),
    assets,
  };
}

export function allSnapshots(at: number, opts: SimOptions = {}) {
  return VILLAGES.map((v) => snapshot(v, at, opts));
}

export interface HistoryPoint { day: string; score: number; water: number; energy: number; sanitation: number }

export function history(v: Village, now: number, days = 30): HistoryPoint[] {
  const assets = ASSETS.filter((a) => a.villageId === v.id).map(assetStatus);
  const out: HistoryPoint[] = [];
  for (let d = days - 1; d >= 0; d--) {
    const noon = new Date(now - d * DAY);
    noon.setHours(12, 0, 0, 0);
    const at = noon.getTime();
    const r = readingsFor(v, at, d);
    const { indicators, score } = computeIndicators(v, r, assets);
    out.push({
      day: noon.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      score, water: indicators.water, energy: indicators.energy, sanitation: indicators.sanitation,
    });
  }
  return out;
}

export function scoreBand(score: number) {
  if (score >= 75) return { label: "Good", color: "var(--paddy)" };
  if (score >= 55) return { label: "Needs work", color: "var(--turmeric)" };
  return { label: "Critical", color: "var(--sindoor)" };
}

export const INDICATOR_INFO: Record<Indicator, { label: string; labelBn: string; pai: string }> = {
  water: { label: "Water", labelBn: "জল", pai: "Water-sufficient panchayat" },
  energy: { label: "Streetlights", labelBn: "পথবাতি", pai: "Self-sufficient infrastructure" },
  sanitation: { label: "Sanitation", labelBn: "পরিচ্ছন্নতা", pai: "Clean and green panchayat" },
  assets: { label: "Water assets", labelBn: "জলাশয়", pai: "Water-sufficient panchayat" },
  governance: { label: "Responsiveness", labelBn: "সাড়া", pai: "Good governance" },
};
