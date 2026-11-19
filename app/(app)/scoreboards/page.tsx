"use client";

import Link from "next/link";
import { useState } from "react";
import { useSim } from "@/components/SimProvider";
import { PageHeader, ScoreText, TrustText } from "@/components/ui";
import { downloadCsv, today } from "@/lib/csv";
import { CONFIDENCE_LABEL } from "@/lib/sim";
import { L } from "@/lib/phrases";

type Level = "block" | "district" | "state";
const ROW = 76;

// Other blocks and districts are fixed demo figures so the higher levels have something to rank against.
const OTHER_BLOCKS = [
  { name: "Basanti", score: 58 }, { name: "Canning I", score: 64 }, { name: "Kultali", score: 52 },
  { name: "Patharpratima", score: 55 }, { name: "Namkhana", score: 61 },
];
const OTHER_DISTRICTS = [
  { name: "North 24 Parganas", score: 63 }, { name: "Purba Medinipur", score: 66 },
  { name: "Howrah", score: 69 }, { name: "Nadia", score: 62 },
];

const RULES = [
  ["Paper counts less", "A figure that is only declared counts at 45%. Sensors count at 100%, citizen reports at 75%. Filling in forms cannot win the table."],
  ["Over-reporting is visible", "If the declared figure is more than 15 points above the measurement, the village is flagged on every screen."],
  ["Edits break the chain", "A village whose past readings were changed drops to Unverified until the ledger is restored from signed copies."],
  ["Silent sensors do not help", "A node that stops reporting does not keep its last good value. Its indicator falls back to the declaration."],
  ["Points need evidence", "Citizen points are only given for reports a sensor or a photo with location confirms."],
];

export default function ScoreboardsPage() {
  const { snaps, reports } = useSim();
  const [level, setLevel] = useState<Level>("block");

  const villages = [...snaps].sort((a, b) => b.score - a.score);
  const blockScore = Math.round(snaps.reduce((a, s) => a + s.score, 0) / snaps.length);
  const blocks = [...OTHER_BLOCKS, { name: "Sundarbans coastal (this block)", score: blockScore, ours: true }].sort((a, b) => b.score - a.score);
  const districtScore = Math.round(blocks.reduce((a, b) => a + b.score, 0) / blocks.length);
  const districts = [...OTHER_DISTRICTS, { name: "South 24 Parganas", score: districtScore, ours: true }].sort((a, b) => b.score - a.score);

  // Opt-in citizen points: 10 per sensor-confirmed report, 5 more if it carried a photo
  const points = new Map<string, number>();
  reports.forEach((r, i) => {
    const who = `Reporter ${String.fromCharCode(65 + (i % 5))}${(i * 37) % 90 + 10}`;
    const p = (r.check === "confirmed" ? 10 : 0) + (r.photo ? 5 : 0);
    if (p) points.set(who, (points.get(who) ?? 0) + p);
  });
  const reporters = [...points.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  function exportRanking() {
    downloadCsv(`gramsatya-village-ranking-${today()}.csv`, [
      ["Rank", "Village", "Score", "Data trust %", "Water", "Streetlights", "Sanitation", "Water assets", "Responsiveness", "Flags"],
      ...villages.map((s, i) => [i + 1, s.village.name, s.score, s.trust, s.indicators.water, s.indicators.energy, s.indicators.sanitation, s.indicators.assets, s.indicators.governance,
        s.mismatches.map((m) => `${m.indicator} declared ${m.claimed} measured ${m.measured}`).join("; ")]),
    ]);
  }

  return (
    <div>
      <PageHeader title={L("Rankings")} lede={L("Villages ranked on evidence, not on paperwork. Scores update live, so rows move when a flood hits or a fault is fixed.")}>
        <button className="btn btn-ghost" onClick={exportRanking}>{L("Download ranking (CSV)")}</button>
      </PageHeader>

      <div className="mb-5 flex gap-2" role="tablist" aria-label={L("Level")}>
        {(["block", "district", "state"] as Level[]).map((l) => (
          <button key={l} role="tab" aria-selected={level === l} onClick={() => setLevel(l)}
            className={`min-h-[44px] rounded-full border px-4 text-[15px] font-semibold ${level === l ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--card)]" : "border-[var(--line)] bg-[var(--card)]"}`}>
            {l === "block" ? "Villages in the block" : l === "district" ? "Blocks in the district" : "Districts in the state"}
          </button>
        ))}
      </div>

      {level === "block" ? (
        <div className="panel overflow-hidden">
          <div className="relative" style={{ height: villages.length * ROW }}>
            {snaps.map((s) => {
              const rank = villages.findIndex((x) => x.village.id === s.village.id);
              const declaredOnly = (Object.keys(s.confidence) as (keyof typeof s.confidence)[]).filter((k) => s.confidence[k] !== "sensor" && s.confidence[k] !== "citizen");
              return (
                <div key={s.village.id} className="absolute inset-x-0 grid grid-cols-[48px_1fr_auto] items-center gap-4 border-b border-[var(--line-soft)] px-5 transition-transform duration-700 ease-out"
                  style={{ height: ROW, transform: `translateY(${rank * ROW}px)` }}>
                  <span className="num text-[28px] text-[var(--brass)]" style={{ fontFamily: "var(--font-display)" }}>{rank + 1}</span>
                  <div className="min-w-0">
                    <Link href={`/village/${s.village.id}`} className="text-[17px] font-semibold hover:underline">{s.village.name}</Link>
                    <p className="truncate text-[13px] text-[var(--slate)]">
                      {L("Data trust")} <TrustText trust={s.trust} />
                      {s.mismatches.length > 0 && <span className="text-[var(--sindoor)]">, declares more than measured</span>}
                      {declaredOnly.length > 0 && <span>, {declaredOnly.length} indicator{declaredOnly.length > 1 ? "s" : ""} {CONFIDENCE_LABEL[s.confidence[declaredOnly[0]]].en.toLowerCase()}</span>}
                    </p>
                  </div>
                  <ScoreText score={s.score} />
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <ol className="panel overflow-hidden">
          {(level === "district" ? blocks : districts).map((b, i) => (
            <li key={b.name} className="grid grid-cols-[48px_1fr_auto] items-center gap-4 border-b border-[var(--line-soft)] px-5 py-4 last:border-0"
              style={{ background: "ours" in b ? "var(--turmeric-tint)" : undefined }}>
              <span className="num text-[28px] text-[var(--brass)]" style={{ fontFamily: "var(--font-display)" }}>{i + 1}</span>
              <span className="text-[17px] font-semibold">{b.name}{"ours" in b && <span className="ml-2 text-[13px] font-normal text-[var(--slate)]">live from sensors</span>}</span>
              <ScoreText score={b.score} />
            </li>
          ))}
          <li className="px-5 py-3 text-[13px] text-[var(--slate)]">{L("Other blocks and districts use fixed demo figures. Only this block is live.")}</li>
        </ol>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="panel p-5 md:p-7" aria-labelledby="rules">
          <h2 id="rules" className="text-[24px]">{L("Rules that stop gaming")}</h2>
          <dl className="mt-3">
            {RULES.map(([t, d]) => (
              <div key={t} className="border-t border-[var(--line-soft)] py-3 first:border-0">
                <dt className="font-semibold">{t}</dt>
                <dd className="text-[15px] text-[var(--slate)]">{d}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section className="panel p-5 md:p-7" aria-labelledby="pts">
          <h2 id="pts" className="text-[24px]">{L("Citizen reporters")}</h2>
          <p className="mt-1 text-[14px] text-[var(--slate)]">{L("Only villagers who opt in appear here, under a code instead of a name.")}</p>
          <ol className="mt-3">
            {reporters.map(([who, p], i) => (
              <li key={who} className="flex items-center justify-between border-t border-[var(--line-soft)] py-2.5 first:border-0">
                <span><span className="num mr-3 text-[var(--brass)]">{i + 1}</span>{who}</span>
                <b className="num">{p} pts</b>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
