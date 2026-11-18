import { INDICATOR_INFO, VillageSnapshot } from "./sim";
import { RIVER_DANGER_M } from "./data";

export interface Action { en: string; bn: string; priority: "high" | "medium" | "low" }
export interface Insight {
  summaryEn: string;
  summaryBn: string;
  actions: Action[];
  source: string;
}

export interface InsightContext {
  snap: VillageSnapshot;
  openReports: number;
}

/** Rule-based insights. Always available, works offline, no API key needed. */
export function ruleInsights({ snap, openReports }: InsightContext): Insight {
  const v = snap.village;
  const count = (t: string) => snap.faults.filter((f) => f.sensor.type === t).length;
  const pumps = count("handpump"), lights = count("streetlight"), bins = count("bin"), tanks = count("tank");
  const actions: Action[] = [];

  if (snap.river && snap.river.value >= RIVER_DANGER_M - 0.5) {
    actions.push({ priority: "high",
      en: `River at ${snap.river.value.toFixed(2)} m, close to the ${RIVER_DANGER_M} m danger line. Keep the siren alert ready and check shelters.`,
      bn: `নদীর জলস্তর ${snap.river.value.toFixed(2)} মিটার, বিপদসীমার কাছে। সাইরেন সতর্কবার্তা প্রস্তুত রাখুন এবং আশ্রয়কেন্দ্র দেখে নিন।` });
  }
  if (pumps) actions.push({ priority: "high",
    en: `${pumps} handpump${pumps > 1 ? "s show" : " shows"} zero flow. Send a mechanic this week.`,
    bn: `${pumps}টি নলকূপে জল আসছে না। এই সপ্তাহেই মিস্ত্রি পাঠান।` });
  if (tanks) actions.push({ priority: "high",
    en: `${tanks} water tank${tanks > 1 ? "s are" : " is"} nearly empty. Check the pump motor and pipeline.`,
    bn: `${tanks}টি জলের ট্যাঙ্ক প্রায় খালি। পাম্প মোটর ও পাইপলাইন পরীক্ষা করুন।` });
  if (lights) actions.push({ priority: "medium",
    en: `${lights} streetlight${lights > 1 ? "s are" : " is"} off at night. Raise a ticket with the electricity office.`,
    bn: `${lights}টি পথবাতি রাতে বন্ধ। বিদ্যুৎ দপ্তরে অভিযোগ জানান।` });
  if (bins) actions.push({ priority: "medium",
    en: `${bins} waste bin${bins > 1 ? "s are" : " is"} overflowing. Schedule collection today.`,
    bn: `${bins}টি ডাস্টবিন উপচে পড়ছে। আজই আবর্জনা সংগ্রহের ব্যবস্থা করুন।` });
  for (const a of snap.assets.filter((x) => x.status !== "Working")) {
    actions.push({ priority: a.status === "Dried up" ? "medium" : "low",
      en: `${a.asset.name} is ${a.status.toLowerCase()} (${a.current}% full). Propose desilting or repair in the next GPDP.`,
      bn: `${a.asset.name} ${a.status === "Dried up" ? "শুকিয়ে গেছে" : "ঝুঁকিতে আছে"} (${a.current}% জল)। পরের GPDP-তে সংস্কারের প্রস্তাব দিন।` });
  }
  if (snap.mismatches.length) {
    const en = snap.mismatches.map((m) => `${INDICATOR_INFO[m.indicator].label.toLowerCase()} ${m.claimed}% vs ${m.measured}%`).join(", ");
    const bn = snap.mismatches.map((m) => `${INDICATOR_INFO[m.indicator].labelBn} ${m.claimed}% বনাম ${m.measured}%`).join(", ");
    actions.push({ priority: "high",
      en: `Correct the portal entries before the next review. Declared vs measured: ${en}.`,
      bn: `পরের পর্যালোচনার আগে পোর্টালের তথ্য সংশোধন করুন। ঘোষিত বনাম মাপা: ${bn}।` });
  }
  if (openReports) actions.push({ priority: "medium",
    en: `${openReports} citizen report${openReports > 1 ? "s are" : " is"} still open. Close them within 7 days.`,
    bn: `${openReports}টি নাগরিক অভিযোগ এখনও খোলা। ৭ দিনের মধ্যে নিষ্পত্তি করুন।` });

  const order = { high: 0, medium: 1, low: 2 };
  actions.sort((a, b) => order[a.priority] - order[b.priority]);

  const weakest = (Object.entries(snap.indicators) as [keyof typeof INDICATOR_INFO, number][]).sort((a, b) => a[1] - b[1])[0];
  const w = INDICATOR_INFO[weakest[0]];
  const summaryEn = `${v.name} scores ${snap.score}/100 today. The weakest area is ${w.label.toLowerCase()} (${weakest[1]}). ${
    snap.faults.length ? `${snap.faults.length} sensor${snap.faults.length > 1 ? "s report" : " reports"} a problem.` : "All sensors report normal."
  } ${snap.mismatches.length ? "Self-reported data is higher than what sensors measure, so data trust is reduced." : "Self-reported data matches the sensors."}`;
  const summaryBn = `আজ ${v.nameBn}-এর গ্রাম স্কোর ${snap.score}/100। সবচেয়ে দুর্বল দিক: ${w.labelBn} (${weakest[1]})। ${
    snap.faults.length ? `${snap.faults.length}টি সেন্সরে সমস্যা ধরা পড়েছে।` : "সব সেন্সর স্বাভাবিক।"
  } ${snap.mismatches.length ? "স্ব-ঘোষিত তথ্য সেন্সরের মাপের চেয়ে বেশি, তাই তথ্যের বিশ্বাসযোগ্যতা কমেছে।" : "স্ব-ঘোষিত তথ্য সেন্সরের সাথে মিলছে।"}`;

  return { summaryEn, summaryBn, actions: actions.slice(0, 6), source: "Built-in rules (offline)" };
}

/** Compact text context for an LLM prompt */
export function promptFor({ snap, openReports }: InsightContext) {
  return `You are an assistant for a Gram Panchayat in West Bengal, India.
Village: ${snap.village.name}. Score ${snap.score}/100. Indicators: ${JSON.stringify(snap.indicators)}.
Faulty sensors: ${snap.faults.map((f) => `${f.sensor.label} (${f.value.toFixed(1)} ${f.unit})`).join(", ") || "none"}.
Self-report mismatches: ${snap.mismatches.map((m) => `${m.indicator} claimed ${m.claimed}% vs measured ${m.measured}%`).join("; ") || "none"}.
Water assets: ${snap.assets.map((a) => `${a.asset.name}: ${a.status} ${a.current}%`).join("; ") || "none"}.
River level: ${snap.river ? snap.river.value.toFixed(2) + " m (danger 4.5 m)" : "no gauge"}. Open citizen reports: ${openReports}.
Reply ONLY with JSON: {"summaryEn": string, "summaryBn": string (Bengali), "actions": [{"en": string, "bn": string, "priority": "high"|"medium"|"low"}]} with at most 5 short, practical actions.`;
}
