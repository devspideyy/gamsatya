"use client";

import { PageHeader } from "@/components/ui";
import { L } from "@/lib/phrases";

const BOM = [
  ["ESP32 dev board", "₹400–550"],
  ["JSN-SR04T waterproof ultrasonic sensor (tank, pond, river, bin level)", "₹350–450"],
  ["YF-S201 flow sensor (handpump)", "₹200–300"],
  ["LDR + ACS712 current sensor (streetlight)", "₹150–250"],
  ["SX1278 LoRa module", "₹450–650"],
  ["6 V solar panel, TP4056 charger, 18650 cell", "₹450–650"],
  ["IP65 box and wiring", "₹200–300"],
];

const PLAN = [
  ["Weeks 1–2", "Agree the pilot with the block office. Pick 10 villages: 5 receive sensors, 5 are compared on paper alone."],
  ["Weeks 3–5", "Build and test 60 nodes and 10 LoRa gateways. Install at handpumps, tanks, streetlights, bins, two ponds and the river."],
  ["Weeks 6–8", "Train secretaries and ward volunteers. Put the QR poster in each panchayat office. Flood siren drill."],
  ["Weeks 9–14", "Run live. Weekly review with the BDO: flags, repairs, response times, citizen reports."],
  ["Weeks 15–16", "Compare sensor and paper villages. Publish results and costs. Decide on scale-up."],
];

const METRICS = [
  ["Share of indicators backed by sensors", "Above 60% in sensor villages"],
  ["Over-reporting caught and corrected", "Count and size of flags closed"],
  ["Days to fix a reported fault", "Median, before vs during the pilot"],
  ["Ponds and dams still holding water", "Month by month against the paper record"],
  ["Siren alert reach during drills", "All nodes acknowledge within 60 seconds"],
  ["Cost per village per year", "Hardware, airtime and maintenance"],
];

export default function PilotPage() {
  return (
    <div>
      <PageHeader title={L("Pilot plan")} lede="A 16-week pilot in one coastal block, designed to prove whether sensor-verified data changes repairs, alerts and funding." />

      <section aria-labelledby="cost">
        <h2 id="cost" className="text-[28px]">{L("What one sensor node costs")}</h2>
        <div className="-mx-4 mt-3 overflow-x-auto px-4">
          <table className="data-table min-w-[520px]">
            <thead><tr><th>{L("Part")}</th><th className="text-right">{L("Approx. price")}</th></tr></thead>
            <tbody>
              {BOM.map(([p, c]) => <tr key={p}><td>{p}</td><td className="num text-right">{c}</td></tr>)}
              <tr><td className="font-semibold">Typical node (controller, 1–2 sensors, radio, solar)</td><td className="num text-right font-semibold">₹2,000–3,000</td></tr>
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[14px] text-[var(--slate)]">About 6–10 nodes per village, so roughly ₹15,000–30,000 in parts. Estimates; check current prices before buying.</p>
      </section>

      <section className="mt-10" aria-labelledby="plan">
        <h2 id="plan" className="text-[28px]">{L("Sixteen weeks")}</h2>
        <ol className="mt-3">
          {PLAN.map(([w, d]) => (
            <li key={w} className="grid gap-1 border-t border-[var(--line)] py-3 sm:grid-cols-[140px_1fr]">
              <span className="font-semibold text-[var(--brass)]">{w}</span><span>{d}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-10" aria-labelledby="impact" id="impact">
        <h2 id="impact" className="text-[28px]">{L("How we will know it worked")}</h2>
        <p className="mt-2 text-[var(--slate)]">Before and after, and sensor villages against paper villages in the same block.</p>
        <dl className="mt-3">
          {METRICS.map(([m, t]) => (
            <div key={m} className="grid gap-1 border-t border-[var(--line)] py-3 sm:grid-cols-[1fr_280px]">
              <dt className="font-semibold">{m}</dt><dd className="text-[var(--slate)]">{t}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
