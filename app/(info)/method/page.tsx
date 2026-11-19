"use client";

import { useSim } from "@/components/SimProvider";
import { PageHeader } from "@/components/ui";
import { CONFIDENCE_LABEL, CONFIDENCE_WEIGHT, INDICATOR_INFO, WEIGHTS, type Confidence } from "@/lib/sim";
import type { Indicator } from "@/lib/data";
import { L } from "@/lib/phrases";

const MEASURE: Record<Indicator, string> = {
  water: "Half tank level (ultrasonic sensor), half share of handpumps with flow (flow sensor)",
  energy: "Share of streetlights drawing power at night (current sensor)",
  sanitation: "Share of bins below 85% full, plus how empty they are on average (ultrasonic sensor)",
  assets: "Ponds and check dams holding water: working 100, at risk 55, dried up 10",
  governance: "Share of citizen reports resolved, blended with the panchayat's past record",
};

export default function MethodPage() {
  const { snapOf } = useSim();
  const ex = snapOf("radhaganj");
  const keys = Object.keys(WEIGHTS) as Indicator[];

  return (
    <div>
      <PageHeader title={L("How the score works")} lede={L("Every number on a scorecard can be traced back to a reading, and every reading counts according to how it was collected.")} />

      <section aria-labelledby="formula">
        <h2 id="formula" className="text-[28px]">{L("The formula")}</h2>
        <p className="panel mt-3 p-5 text-center text-[18px]" style={{ fontFamily: "var(--font-display)" }}>
          Score = Σ (indicator value × weight × evidence factor)
        </p>
        <p className="mt-3 text-[16px] text-[var(--slate)]">
          Each indicator is a number from 0 to 100. Its weight says how much it matters. The evidence factor says how much we believe it.
          A village fully measured by sensors can reach close to 100. The same village on paper alone stops at 45.
        </p>
      </section>

      <section className="mt-10" aria-labelledby="ind">
        <h2 id="ind" className="text-[28px]">{L("Indicators and weights")}</h2>
        <div className="-mx-4 mt-3 overflow-x-auto px-4">
          <table className="data-table min-w-[620px]">
            <thead><tr><th>{L("Indicator")}</th><th>{L("Weight")}</th><th>{L("How it is measured")}</th><th>{L("Panchayat Advancement Index theme")}</th></tr></thead>
            <tbody>
              {keys.map((k) => (
                <tr key={k}>
                  <td className="font-semibold">{L(INDICATOR_INFO[k].label)}</td>
                  <td className="num">{Math.round(WEIGHTS[k] * 100)}%</td>
                  <td className="text-[14px]">{MEASURE[k]}</td>
                  <td className="text-[14px] text-[var(--slate)]">{L(INDICATOR_INFO[k].pai)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10" aria-labelledby="ev">
        <h2 id="ev" className="text-[28px]">{L("Evidence factor")}</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-4">
          {(Object.keys(CONFIDENCE_WEIGHT) as Confidence[]).map((c) => (
            <div key={c} className="panel p-4">
              <p className="num text-[30px]" style={{ fontFamily: "var(--font-display)" }}>{Math.round(CONFIDENCE_WEIGHT[c] * 100)}%</p>
              <p className="font-semibold">{CONFIDENCE_LABEL[c].en}</p>
              <p className="text-[13px] text-[var(--slate)]">
                {c === "sensor" ? "Signed reading from an installed sensor" : c === "citizen" ? "Backed by villagers' reports" : c === "declared" ? "No sensor installed, only the panchayat's own figure" : "Sensor offline or ledger edited, so the declared figure is used"}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[15px] text-[var(--slate)]">{L("A village is flagged when its declared figure is more than 15 points above what the sensors measure.")}</p>
      </section>

      <section className="mt-10" aria-labelledby="worked">
        <h2 id="worked" className="text-[28px]">Worked example: {ex.village.name}, live</h2>
        <div className="-mx-4 mt-3 overflow-x-auto px-4">
          <table className="data-table min-w-[560px]">
            <thead><tr><th>{L("Indicator")}</th><th className="text-right">{L("Value")}</th><th className="text-right">{L("Weight")}</th><th>{L("Evidence")}</th><th className="text-right">{L("Points")}</th></tr></thead>
            <tbody>
              {keys.map((k) => (
                <tr key={k}>
                  <td>{L(INDICATOR_INFO[k].label)}</td>
                  <td className="num text-right">{ex.indicators[k]}</td>
                  <td className="num text-right">× {WEIGHTS[k].toFixed(2)}</td>
                  <td>× {CONFIDENCE_WEIGHT[ex.confidence[k]].toFixed(2)} <span className="text-[13px] text-[var(--slate)]">{CONFIDENCE_LABEL[ex.confidence[k]].en}</span></td>
                  <td className="num text-right font-semibold">{ex.points[k]}</td>
                </tr>
              ))}
              <tr><td colSpan={4} className="font-semibold">{L("Village score")}</td><td className="num text-right text-[20px] font-bold">{ex.score}</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
