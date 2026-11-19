"use client";

import Link from "next/link";
import { useState } from "react";
import { useSim } from "@/components/SimProvider";
import { PageHeader, rupees, ScoreText } from "@/components/ui";
import { VILLAGES } from "@/lib/data";
import { downloadCsv, today } from "@/lib/csv";
import MapView from "@/components/MapView";
import { L } from "@/lib/phrases";

const TRUST_LINE = 70;
const HOLD_SHARE = 0.3;

export default function FundsPage() {
  const { snaps, verify, ledger } = useSim();
  const [budget, setBudget] = useState(10_000_000);
  const [w, setW] = useState({ need: 50, risk: 30, people: 20 });
  const total = w.need + w.risk + w.people || 1;
  const maxPop = Math.max(...VILLAGES.map((v) => v.population));
  const brokenVillage = !verify.ok ? ledger.find((r) => r.i === verify.brokenAt)?.villageId : undefined;

  const rows = snaps.map((s) => {
    const parts = {
      need: ((100 - s.score) / 100) * (w.need / total),
      risk: s.village.risk * (w.risk / total),
      people: (s.village.population / maxPop) * (w.people / total),
    };
    const index = parts.need + parts.risk + parts.people;
    const trust = brokenVillage === s.village.id ? Math.min(s.trust, 50) : s.trust;
    return { s, parts, index, trust, hold: trust < TRUST_LINE };
  });
  const sum = rows.reduce((a, r) => a + r.index, 0) || 1;
  const ranked = rows.map((r) => ({ ...r, amount: (budget * r.index) / sum })).sort((a, b) => b.index - a.index);
  const held = ranked.filter((r) => r.hold).reduce((a, r) => a + r.amount * HOLD_SHARE, 0);

  return (
    <div>
      <PageHeader
        title={L("Where should the next rupee go?")}
        lede={L("Villages are ranked by verified need. If a village's data trust is below 70%, part of its money waits until a field check confirms the data.")}
      >
        <button className="btn btn-ghost" onClick={() => downloadCsv(`gramsatya-csr-report-${today()}.csv`, [
          ["Rank", "Village", "Population", "Score", "Data trust %", "Suggested amount (Rs)", "Release now (Rs)", "Held until verified (Rs)", "Sensor faults", "Ponds failing"],
          ...ranked.map((r, i) => {
            const now = r.hold ? r.amount * (1 - HOLD_SHARE) : r.amount;
            return [i + 1, r.s.village.name, r.s.village.population, r.s.score, r.trust, Math.round(r.amount), Math.round(now), Math.round(r.amount - now), r.s.faults.length, r.s.assets.filter((a) => a.status !== "Working").length];
          }),
        ])}>{L("Download CSR report (CSV)")}</button>
      </PageHeader>

      <div className="grid gap-x-12 gap-y-10 lg:grid-cols-[320px_1fr]">
        <section aria-labelledby="formula" className="lg:sticky lg:top-24 lg:self-start">
          <h2 id="formula" className="sr-only">Budget and formula</h2>
          <label className="block text-[14px] text-[var(--slate)]" htmlFor="budget">{L("Budget to allocate")}</label>
          <p className="num text-[40px] font-bold leading-tight">{rupees(budget)}</p>
          <input id="budget" type="range" min={1_000_000} max={50_000_000} step={500_000} value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="w-full accent-[var(--ink)]" />
          <div className="flex justify-between text-[12px] text-[var(--slate)]"><span>₹10 L</span><span>₹5 Cr</span></div>

          <div className="mt-8 border-t border-[var(--line)] pt-4">
            {([
              ["need", "Low village score", "var(--ink)"],
              ["risk", "Flood and cyclone risk", "var(--sindoor)"],
              ["people", "Population", "var(--river)"],
            ] as const).map(([k, label, color]) => (
              <div key={k} className="mb-4">
                <div className="flex items-baseline justify-between text-[15px]">
                  <label htmlFor={`w-${k}`} className="flex items-center gap-2 font-medium"><i className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: color }} />{label}</label>
                  <span className="num font-semibold">{Math.round((w[k] / total) * 100)}%</span>
                </div>
                <input id={`w-${k}`} type="range" min={0} max={100} value={w[k]} onChange={(e) => setW({ ...w, [k]: Number(e.target.value) })} className="w-full accent-[var(--ink)]" />
              </div>
            ))}
          </div>
          <p className="border-t border-[var(--line)] pt-4 text-[14px] text-[var(--slate)]">
            {L("On hold until data is checked:")} <b className="num text-[#7d5208]">{rupees(Math.round(held))}</b>
          </p>
          <div className="mt-6 border-t border-[var(--line)] pt-4">
            <p className="mb-2 font-semibold">{L("Where the money goes")}</p>
            <MapView height={280} points={ranked.map((r) => ({
              lat: r.s.village.lat, lng: r.s.village.lng,
              radius: 7 + Math.round((r.amount / budget) * 40),
              color: r.hold ? "#a06a0c" : "#1d2847",
              ring: r.hold,
              label: `${r.s.village.name}: ${rupees(Math.round(r.amount))}${r.hold ? ", part held" : ""}`,
              href: `/village/${r.s.village.id}`,
            }))} />
            <p className="mt-2 text-[13px] text-[var(--slate)]">{L("Bigger circle, bigger share. Ringed villages have money on hold.")}</p>
          </div>
        </section>

        <section aria-labelledby="ranking">
          <h2 id="ranking" className="sr-only">Ranking and suggested split</h2>
          <ol>
            {ranked.map((r, i) => {
              const release = r.hold ? r.amount * (1 - HOLD_SHARE) : r.amount;
              const max = ranked[0].index;
              return (
                <li key={r.s.village.id} className="grid grid-cols-[36px_1fr_auto] gap-x-4 border-t border-[var(--line)] py-5 first:border-t-0 first:pt-0">
                  <span className="num text-[26px] font-bold leading-none text-[var(--slate)]">{i + 1}</span>
                  <div className="min-w-0">
                    <Link href={`/village/${r.s.village.id}`} className="text-[19px] font-semibold hover:underline">{r.s.village.name}</Link>
                    <p className="mt-0.5 text-[14px] text-[var(--slate)]">
                      {L("Score")} <ScoreText score={r.s.score} />, {r.s.village.risk > 0.7 ? "high" : r.s.village.risk > 0.4 ? "medium" : "low"} flood risk, {r.s.village.population.toLocaleString("en-IN")} people, data trust{" "}
                      <b style={{ color: r.hold ? "#7d5208" : "var(--paddy)" }}>{r.trust}%</b>
                    </p>
                    <div className="mt-2.5 flex h-2 max-w-md overflow-hidden rounded-full bg-[#ebe2d0]" role="img"
                      aria-label={`Need index ${Math.round(r.index * 100)}`} style={{ width: `${(r.index / max) * 100}%` }}>
                      <div style={{ flex: r.parts.need, background: "var(--ink)" }} />
                      <div style={{ flex: r.parts.risk, background: "var(--sindoor)" }} />
                      <div style={{ flex: r.parts.people, background: "var(--river)" }} />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="num text-[22px] font-bold">{rupees(Math.round(r.amount))}</p>
                    {r.hold
                      ? <p className="text-[13px] text-[#7d5208]">{rupees(Math.round(release))} now, {rupees(Math.round(r.amount - release))} held</p>
                      : <p className="text-[13px] text-[var(--slate)]">{L("Release in full")}</p>}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      </div>
    </div>
  );
}
