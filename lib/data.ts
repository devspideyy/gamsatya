// Demo data for GramSatya. All villages, sensors and figures are simulated.

export type SensorType = "tank" | "handpump" | "streetlight" | "bin" | "river";
export type Indicator = "water" | "energy" | "sanitation" | "assets" | "governance";

export interface Village {
  id: string;
  name: string;
  nameBn: string;
  nameHi?: string;
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
  /** Mobile coverage at the panchayat office; decides how SOS and data travel */
  network: "4G" | "2G";
  /** LoRa gateway that relays this village's sensors and sirens */
  gateway: string;
  /** Sensor types not installed yet: those indicators fall back to the panchayat's own declaration */
  notInstalled?: SensorType[];
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
    id: "kusumpur", name: "Kusumpur", nameHi: "कुसुमपुर", nameBn: "কুসুমপুর",
    population: 4120, households: 910, lat: 22.165, lng: 88.805,
    risk: 0.45, coastal: false, tankBase: 78, binBase: 38, govBase: 86,
    selfReport: { water: 90, energy: 85, sanitation: 85 },
    story: "Honest reporting, improving after repairs last month.", network: "4G", gateway: "GW-KUS-01",
  },
  {
    id: "radhaganj", name: "Radhaganj", nameHi: "राधागंज", nameBn: "রাধাগঞ্জ",
    population: 5630, households: 1240, lat: 22.14, lng: 88.84,
    risk: 0.5, coastal: false, tankBase: 64, binBase: 62, govBase: 58,
    selfReport: { water: 100, energy: 100, sanitation: 100 },
    story: "Claims 100% on every indicator. Sensors disagree.", network: "4G", gateway: "GW-RAD-01",
  },
  {
    id: "haripur-char", name: "Haripur Char", nameHi: "हरिपुर चर", nameBn: "হরিপুর চর",
    population: 3380, households: 760, lat: 22.11, lng: 88.79,
    risk: 0.92, coastal: true, tankBase: 52, binBase: 45, govBase: 72,
    selfReport: { water: 55, energy: 80, sanitation: 65 },
    story: "Riverside island village. High cyclone and flood risk.", network: "2G", gateway: "GW-HAR-01",
  },
  {
    id: "nalbon", name: "Nalbon", nameHi: "नलबन", nameBn: "নলবন",
    population: 2940, households: 640, lat: 22.19, lng: 88.86,
    risk: 0.35, coastal: false, tankBase: 70, binBase: 50, govBase: 74,
    selfReport: { water: 85, energy: 80, sanitation: 55 },
    story: "Paper-heavy: no streetlight or bin sensors yet, so those figures are only declared.", network: "2G", gateway: "GW-NAL-01", notInstalled: ["bin", "streetlight"],
  },
  {
    id: "dakshin-mathabhanga", name: "Dakshin Mathabhanga", nameHi: "दक्षिण माथाभांगा", nameBn: "দক্ষিণ মাথাভাঙা",
    population: 6210, households: 1390, lat: 22.125, lng: 88.88,
    risk: 0.8, coastal: true, tankBase: 41, binBase: 66, govBase: 66,
    selfReport: { water: 45, energy: 55, sanitation: 50 },
    story: "Poor but honest. Largest population and high need.", network: "2G", gateway: "GW-DM-01",
  },
  {
    id: "sonagaon", name: "Sonagaon", nameBn: "সোনাগাঁও", nameHi: "सोनागाँव",
    population: 3820, households: 830, lat: 22.176, lng: 88.772,
    risk: 0.4, coastal: false, tankBase: 80, binBase: 36, govBase: 84,
    selfReport: { water: 90, energy: 90, sanitation: 85 },
    story: "Well run. Repairs are logged within days.", network: "4G", gateway: "GW-SON-01",
  },
  {
    id: "lahiripur", name: "Lahiripur", nameBn: "লাহিড়ীপুর", nameHi: "लाहिड़ीपुर",
    population: 4470, households: 990, lat: 22.098, lng: 88.835,
    risk: 0.88, coastal: true, tankBase: 58, binBase: 52, govBase: 62,
    selfReport: { water: 70, energy: 95, sanitation: 70 },
    story: "Coastal. Declares nearly every streetlight working; half are dark.", network: "2G", gateway: "GW-LAH-01",
  },
  {
    id: "amtali", name: "Amtali", nameBn: "আমতলি", nameHi: "अमतली",
    population: 2610, households: 580, lat: 22.206, lng: 88.815,
    risk: 0.3, coastal: false, tankBase: 74, binBase: 42, govBase: 78,
    selfReport: { water: 85, energy: 80, sanitation: 80 },
    story: "Small inland village, steady.", network: "4G", gateway: "GW-AMT-01",
  },
  {
    id: "bijoynagar", name: "Bijoynagar", nameBn: "বিজয়নগর", nameHi: "बिजयनगर",
    population: 5120, households: 1150, lat: 22.156, lng: 88.906,
    risk: 0.62, coastal: true, tankBase: 46, binBase: 60, govBase: 64,
    selfReport: { water: 50, energy: 60, sanitation: 55 },
    story: "Large and stretched. Honest figures, many faults.", network: "4G", gateway: "GW-BIJ-01",
  },
  {
    id: "kalitala", name: "Kalitala", nameBn: "কালীতলা", nameHi: "कालीतला",
    population: 3340, households: 740, lat: 22.086, lng: 88.876,
    risk: 0.9, coastal: true, tankBase: 50, binBase: 48, govBase: 70,
    selfReport: { water: 80, energy: 70, sanitation: 65 },
    story: "Island village. No water sensors yet, so water is declared only.", network: "2G", gateway: "GW-KAL-01", notInstalled: ["tank", "handpump"],
  },
  {
    id: "jamespur", name: "Jamespur", nameBn: "জেমসপুর", nameHi: "जेम्सपुर",
    population: 2980, households: 650, lat: 22.212, lng: 88.89,
    risk: 0.35, coastal: false, tankBase: 68, binBase: 44, govBase: 76,
    selfReport: { water: 80, energy: 80, sanitation: 75 },
    story: "Average, improving slowly.", network: "4G", gateway: "GW-JAM-01",
  },
  {
    id: "rangabelia", name: "Rangabelia", nameBn: "রাঙাবেলিয়া", nameHi: "रंगाबेलिया",
    population: 4050, households: 900, lat: 22.134, lng: 88.764,
    risk: 0.72, coastal: true, tankBase: 62, binBase: 64, govBase: 60,
    selfReport: { water: 75, energy: 80, sanitation: 95 },
    story: "Declares bins always cleared. Bin sensors say otherwise.", network: "2G", gateway: "GW-RAN-01",
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
    if (v.notInstalled?.includes(type)) return [];
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
  // New villages
  { sensorId: "sonagaon-streetlight-3", since: 2 },
  { sensorId: "lahiripur-streetlight-1", since: 20 },
  { sensorId: "lahiripur-streetlight-3", since: 15 },
  { sensorId: "lahiripur-streetlight-4", since: 9 },
  { sensorId: "lahiripur-handpump-2", since: 6 },
  { sensorId: "amtali-bin-1", since: 3 },
  { sensorId: "bijoynagar-handpump-1", since: 24 },
  { sensorId: "bijoynagar-handpump-3", since: 12 },
  { sensorId: "bijoynagar-tank-2", since: 8 },
  { sensorId: "bijoynagar-streetlight-2", since: 17 },
  { sensorId: "bijoynagar-streetlight-6", since: 5 },
  { sensorId: "kalitala-streetlight-5", since: 11 },
  { sensorId: "jamespur-handpump-4", since: 7 },
  { sensorId: "jamespur-streetlight-1", since: 4 },
  { sensorId: "rangabelia-bin-1", since: 14 },
  { sensorId: "rangabelia-bin-2", since: 9 },
  { sensorId: "rangabelia-bin-3", since: 3 },
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
  { id: "a8", villageId: "lahiripur", name: "Lahiripur Amrit Sarovar", kind: "Pond", scheme: "Amrit Sarovar", cost: 1380000, builtOn: "2023-04", lat: 22.101, lng: 88.84,
    levels: [38, 30, 22, 15, 33, 45, 41, 30, 19, 12, 8, 6] },
  { id: "a9", villageId: "bijoynagar", name: "Bijoynagar pond", kind: "Pond", scheme: "MGNREGA", cost: 690000, builtOn: "2023-09", lat: 22.159, lng: 88.91,
    levels: [52, 45, 39, 33, 58, 72, 76, 70, 61, 52, 46, 42] },
  { id: "a10", villageId: "sonagaon", name: "Sonagaon Amrit Sarovar", kind: "Pond", scheme: "Amrit Sarovar", cost: 1490000, builtOn: "2022-11", lat: 22.179, lng: 88.776,
    levels: [66, 60, 54, 49, 73, 90, 96, 93, 88, 81, 75, 70] },
  { id: "a11", villageId: "rangabelia", name: "Rangabelia check dam", kind: "Check dam", scheme: "MGNREGA", cost: 520000, builtOn: "2024-03", lat: 22.131, lng: 88.769,
    levels: [28, 20, 13, 8, 21, 33, 30, 21, 13, 8, 5, 2] },
];

export const SIRENS_PER_VILLAGE = 3;
export const RIVER_DANGER_M = 4.5;

export function villageById(id: string) {
  return VILLAGES.find((v) => v.id === id);
}
