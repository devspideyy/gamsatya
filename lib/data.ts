// Demo data for GramSatya. All villages, sensors and figures are simulated.

export type SensorType = "tank" | "handpump" | "streetlight" | "bin" | "river";
export type Indicator = "water" | "energy" | "sanitation" | "assets" | "governance";

export interface Village {
  id: string;
  name: string;
  nameBn: string;
  population: number;
  households: number;
  lat: number;
  lng: number;
  /** Disaster exposure 0..1 (coastal / flood risk) */
  risk: number;
  coastal: boolean;
  tankBase: number;
  binBase: number;
  govBase: number;
  /** What the panchayat self-declared on the portal (percent) */
  selfReport: { water: number; energy: number; sanitation: number };
  story: string;
}

export interface Sensor {
  id: string;
  villageId: string;
  type: SensorType;
  label: string;
  lat: number;
  lng: number;
}

export interface Fault {
  sensorId: string;
  /** Broken from this many days ago... */
  since: number;
  /** ...until this many days ago (undefined = still broken) */
  until?: number;
}

export interface Asset {
  id: string;
  villageId: string;
  name: string;
  kind: "Pond" | "Check dam";
  scheme: "Amrit Sarovar" | "MGNREGA";
  cost: number; // rupees
  builtOn: string; // YYYY-MM
  lat: number;
  lng: number;
  /** water level % of capacity, last 12 months, oldest first */
  levels: number[];
}

export const BLOCK_NAME = "Sundarbans coastal block (demo data)";

export const VILLAGES: Village[] = [
  {
    id: "kusumpur", name: "Kusumpur", nameBn: "কুসুমপুর",
    population: 4120, households: 910, lat: 22.165, lng: 88.805,
    risk: 0.45, coastal: false, tankBase: 78, binBase: 38, govBase: 86,
    selfReport: { water: 90, energy: 85, sanitation: 85 },
    story: "Honest reporting, improving after repairs last month.",
  },
  {
    id: "radhaganj", name: "Radhaganj", nameBn: "রাধাগঞ্জ",
    population: 5630, households: 1240, lat: 22.14, lng: 88.84,
    risk: 0.5, coastal: false, tankBase: 64, binBase: 62, govBase: 58,
    selfReport: { water: 100, energy: 100, sanitation: 100 },
    story: "Claims 100% on every indicator. Sensors disagree.",
  },
  {
    id: "haripur-char", name: "Haripur Char", nameBn: "হরিপুর চর",
    population: 3380, households: 760, lat: 22.11, lng: 88.79,
    risk: 0.92, coastal: true, tankBase: 52, binBase: 45, govBase: 72,
    selfReport: { water: 55, energy: 80, sanitation: 65 },
    story: "Riverside island village. High cyclone and flood risk.",
  },
  {
    id: "nalbon", name: "Nalbon", nameBn: "নলবন",
    population: 2940, households: 640, lat: 22.19, lng: 88.86,
    risk: 0.35, coastal: false, tankBase: 70, binBase: 50, govBase: 74,
    selfReport: { water: 85, energy: 80, sanitation: 55 },
    story: "Average village, a few slow repairs.",
  },
  {
    id: "dakshin-mathabhanga", name: "Dakshin Mathabhanga", nameBn: "দক্ষিণ মাথাভাঙা",
    population: 6210, households: 1390, lat: 22.125, lng: 88.88,
    risk: 0.8, coastal: true, tankBase: 41, binBase: 66, govBase: 66,
    selfReport: { water: 45, energy: 55, sanitation: 50 },
    story: "Poor but honest. Largest population and high need.",
  },
];

const COUNTS: Record<SensorType, number> = { tank: 2, handpump: 4, streetlight: 6, bin: 3, river: 1 };
const LABELS: Record<SensorType, string> = {
  tank: "Water tank", handpump: "Handpump", streetlight: "Streetlight", bin: "Waste bin", river: "River gauge",
};

function offset(seed: number, i: number) {
  const a = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453;
  const b = Math.sin(seed * 39.3468 + i * 11.135) * 24634.6345;
  return [((a - Math.floor(a)) - 0.5) * 0.02, ((b - Math.floor(b)) - 0.5) * 0.02];
}

export const SENSORS: Sensor[] = VILLAGES.flatMap((v, vi) =>
  (Object.keys(COUNTS) as SensorType[]).flatMap((type) => {
    if (type === "river" && !v.coastal) return [];
    return Array.from({ length: COUNTS[type] }, (_, i) => {
      const [dy, dx] = offset(vi + 1, i + type.length * 7);
      return {
        id: `${v.id}-${type}-${i + 1}`,
        villageId: v.id,
        type,
        label: `${LABELS[type]} ${i + 1}`,
        lat: v.lat + dy,
        lng: v.lng + dx,
      };
    });
  }),
);

export const FAULTS: Fault[] = [
  // Kusumpur: earlier faults now fixed, one new
  { sensorId: "kusumpur-handpump-2", since: 26, until: 9 },
  { sensorId: "kusumpur-streetlight-4", since: 22, until: 8 },
  { sensorId: "kusumpur-streetlight-6", since: 3 },
  // Radhaganj: many silent failures while self-reporting 100%
  { sensorId: "radhaganj-handpump-1", since: 21 },
  { sensorId: "radhaganj-handpump-3", since: 14 },
  { sensorId: "radhaganj-streetlight-2", since: 18 },
  { sensorId: "radhaganj-streetlight-3", since: 12 },
  { sensorId: "radhaganj-streetlight-5", since: 6 },
  { sensorId: "radhaganj-bin-1", since: 10 },
  { sensorId: "radhaganj-bin-2", since: 4 },
  // Haripur Char
  { sensorId: "haripur-char-tank-2", since: 7 },
  { sensorId: "haripur-char-streetlight-1", since: 15 },
  { sensorId: "haripur-char-handpump-4", since: 5 },
  // Nalbon
  { sensorId: "nalbon-streetlight-2", since: 9 },
  { sensorId: "nalbon-bin-3", since: 2 },
  // Dakshin Mathabhanga
  { sensorId: "dakshin-mathabhanga-handpump-2", since: 30 },
  { sensorId: "dakshin-mathabhanga-handpump-4", since: 25 },
  { sensorId: "dakshin-mathabhanga-streetlight-1", since: 28 },
  { sensorId: "dakshin-mathabhanga-streetlight-5", since: 19 },
  { sensorId: "dakshin-mathabhanga-tank-1", since: 11 },
  { sensorId: "dakshin-mathabhanga-bin-2", since: 8 },
];

export const ASSETS: Asset[] = [
  { id: "a1", villageId: "kusumpur", name: "Kusumpur Amrit Sarovar", kind: "Pond", scheme: "Amrit Sarovar", cost: 1450000, builtOn: "2023-03", lat: 22.168, lng: 88.809,
    levels: [62, 55, 48, 44, 70, 88, 95, 92, 86, 78, 71, 66] },
  { id: "a2", villageId: "radhaganj", name: "Radhaganj new pond", kind: "Pond", scheme: "MGNREGA", cost: 820000, builtOn: "2023-11", lat: 22.143, lng: 88.846,
    levels: [40, 31, 22, 14, 30, 41, 38, 26, 15, 9, 5, 3] },
  { id: "a3", villageId: "radhaganj", name: "Radhaganj check dam", kind: "Check dam", scheme: "MGNREGA", cost: 610000, builtOn: "2024-01", lat: 22.136, lng: 88.835,
    levels: [35, 24, 12, 6, 18, 27, 22, 14, 8, 4, 2, 0] },
  { id: "a4", villageId: "haripur-char", name: "Haripur Char Amrit Sarovar", kind: "Pond", scheme: "Amrit Sarovar", cost: 1600000, builtOn: "2022-12", lat: 22.113, lng: 88.796,
    levels: [58, 50, 41, 35, 64, 80, 84, 76, 61, 47, 38, 31] },
  { id: "a5", villageId: "nalbon", name: "Nalbon tank pond", kind: "Pond", scheme: "MGNREGA", cost: 540000, builtOn: "2023-06", lat: 22.193, lng: 88.866,
    levels: [55, 49, 43, 39, 61, 77, 82, 79, 72, 66, 60, 56] },
  { id: "a6", villageId: "dakshin-mathabhanga", name: "Mathabhanga Amrit Sarovar", kind: "Pond", scheme: "Amrit Sarovar", cost: 1520000, builtOn: "2023-02", lat: 22.129, lng: 88.886,
    levels: [44, 36, 28, 20, 42, 58, 60, 51, 40, 30, 24, 19] },
  { id: "a7", villageId: "dakshin-mathabhanga", name: "Mathabhanga check dam", kind: "Check dam", scheme: "MGNREGA", cost: 470000, builtOn: "2024-02", lat: 22.121, lng: 88.874,
    levels: [30, 22, 15, 10, 25, 36, 34, 25, 16, 10, 7, 4] },
];

export const SIRENS_PER_VILLAGE = 3;
export const RIVER_DANGER_M = 4.5;

export function villageById(id: string) {
  return VILLAGES.find((v) => v.id === id);
}
