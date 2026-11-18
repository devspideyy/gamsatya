import type { SensorType } from "./data";
import { RIVER_DANGER_M } from "./data";
import type { VillageSnapshot } from "./sim";

export const bnDigits = (s: string) => s.replace(/[0-9]/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]);

export type Tone = "good" | "warn" | "bad";

export interface TypeSummary {
  key: SensorType | "assets";
  label: string;
  labelBn: string;
  text: string;
  textBn: string;
  tone: Tone;
  ok: number;
  total: number;
}

const tone = (ok: number, total: number): Tone => (ok === total ? "good" : ok / total >= 0.6 ? "warn" : "bad");

/** Plain-language summary of a village, one line per kind of public service. */
export function summarize(snap: VillageSnapshot): TypeSummary[] {
  const of = (t: SensorType) => snap.readings.filter((r) => r.sensor.type === t);
  const out: TypeSummary[] = [];

  const tanks = of("tank");
  if (tanks.length) {
    const avg = Math.round(tanks.reduce((s, r) => s + r.value, 0) / tanks.length);
    const ok = tanks.filter((r) => r.ok).length;
    out.push({ key: "tank", label: "Water tanks", labelBn: "জলের ট্যাঙ্ক", ok, total: tanks.length,
      text: `${avg}% full on average${ok < tanks.length ? `, ${tanks.length - ok} nearly empty` : ""}`,
      textBn: bnDigits(`গড়ে ${avg}% ভর্তি${ok < tanks.length ? `, ${tanks.length - ok}টি প্রায় খালি` : ""}`),
      tone: avg < 30 || ok < tanks.length ? (ok === 0 ? "bad" : "warn") : "good" });
  }
  const pumps = of("handpump");
  if (pumps.length) {
    const ok = pumps.filter((r) => r.ok).length;
    out.push({ key: "handpump", label: "Handpumps", labelBn: "নলকূপ", ok, total: pumps.length,
      text: `${ok} of ${pumps.length} working`, textBn: bnDigits(`${pumps.length}টির মধ্যে ${ok}টি চালু`), tone: tone(ok, pumps.length) });
  }
  const lights = of("streetlight");
  if (lights.length) {
    const ok = lights.filter((r) => r.ok).length;
    out.push({ key: "streetlight", label: "Streetlights", labelBn: "পথবাতি", ok, total: lights.length,
      text: `${ok} of ${lights.length} on at night`, textBn: bnDigits(`${lights.length}টির মধ্যে ${ok}টি রাতে জ্বলে`), tone: tone(ok, lights.length) });
  }
  const bins = of("bin");
  if (bins.length) {
    const ok = bins.filter((r) => r.ok).length;
    const over = bins.length - ok;
    out.push({ key: "bin", label: "Waste bins", labelBn: "ডাস্টবিন", ok, total: bins.length,
      text: over ? `${over} of ${bins.length} overflowing` : `All ${bins.length} collected on time`,
      textBn: bnDigits(over ? `${bins.length}টির মধ্যে ${over}টি উপচে পড়ছে` : `${bins.length}টিই সময়মতো পরিষ্কার`), tone: tone(ok, bins.length) });
  }
  if (snap.assets.length) {
    const ok = snap.assets.filter((a) => a.status === "Working").length;
    out.push({ key: "assets", label: "Ponds and check dams", labelBn: "পুকুর ও চেক ড্যাম", ok, total: snap.assets.length,
      text: `${ok} of ${snap.assets.length} holding water`, textBn: bnDigits(`${snap.assets.length}টির মধ্যে ${ok}টিতে জল আছে`), tone: tone(ok, snap.assets.length) });
  }
  const river = snap.river;
  if (river) {
    const v = river.value.toFixed(2);
    out.push({ key: "river", label: "River level", labelBn: "নদীর জলস্তর", ok: river.ok ? 1 : 0, total: 1,
      text: `${v} m, danger line ${RIVER_DANGER_M} m`, textBn: bnDigits(`${v} মিটার, বিপদসীমা ${RIVER_DANGER_M} মিটার`),
      tone: !river.ok ? "bad" : river.warn ? "warn" : "good" });
  }
  return out;
}
