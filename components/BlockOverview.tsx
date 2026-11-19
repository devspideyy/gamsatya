"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSim } from "./SimProvider";
import MapView from "./MapView";
import { PageHeader, ScoreText, Sparkline, TrustText } from "./ui";
import { BLOCK_NAME, RIVER_DANGER_M, VILLAGES } from "@/lib/data";
import { history, INDICATOR_INFO, scoreAt, scoreBand } from "@/lib/sim";
import { L } from "@/lib/phrases";

type SortKey = "score" | "trust" | "name";

export default function BlockOverview() {
  const { snaps, now, reports, verify, ledger } = useSim();
  const [sort, setSort] = useState<SortKey>("score");
  const [replay, setReplay] = useState(0); // hours ago, 0 = live
  const dayKey = new Date(now).toDateString();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const hists = useMemo(() => Object.fromEntries(VILLAGES.map((v) => [v.id, history(v, now, 30).map((h) => h.score)])), [dayKey]);

  const population = VILLAGES.reduce((s, v) => s + v.population, 0);
  const overReporting = snaps.filter((s) => s.mismatches.length);
  const openReports = reports.filter((r) => r.status !== "Resolved").length;
  const allAssets = snaps.flatMap((s) => s.assets);
  const failing = allAssets.filter((a) => a.status !== "Working").length;
  const brokenVillage = !verify.ok ? ledger.find((r) => r.i === verify.brokenAt)?.villageId : undefined;

  const flags: { tone: "bad" | "warn"; title: string; detail: string; href: string }[] = [];
  for (const s of snaps) {
    if (s.river && s.river.value >= RIVER_DANGER_M - 0.5)
      flags.push({ tone: s.river.ok ? "warn" : "bad", title: `${s.village.name}: river at ${s.river.value.toFixed(2)} m`, detail: `Danger line ${RIVER_DANGER_M} m.`, href: "/alerts" });
    if (brokenVillage === s.village.id)
      flags.push({ tone: "bad", title: `${s.village.name}: past readings were edited`, detail: "Ledger chain broken. Treat its data as unverified.", href: "/ledger" });
    if (s.mismatches.length)
      flags.push({ tone: "bad", title: `${s.village.name} declares more than its sensors measure`,
        detail: s.mismatches.map((m) => `${INDICATOR_INFO[m.indicator].label} ${m.claimed}% declared, ${m.measured}% measured`).join(". ") + ".", href: `/village/${s.village.id}` });
    for (const a of s.assets.filter((x) => x.status === "Dried up"))
      flags.push({ tone: "warn", title: `${a.asset.name} has dried up`, detail: `${a.asset.scheme}, built ${a.asset.builtOn}, now ${a.current}% full.`, href: "/assets" });
  }

  const rows = [...snaps].sort((a, b) =>
    sort === "name" ? a.village.name.localeCompare(b.village.name) : sort === "trust" ? a.trust - b.trust : a.score - b.score);

  const hex = (score: number) => {
    const l = scoreBand(score).label;
    return l === "Good" ? "#3b6834" : l === "Needs work" ? "#a06a0c" : "#a3241b";
  };
  const points = snaps.map((s) => {
    const sc = replay ? scoreAt(s.village, now, replay) : s.score;
    return {
    lat: s.village.lat, lng: s.village.lng, radius: 12,
    label: `${s.village.name}: score ${sc}${replay ? ` (${replay} h ago)` : `, data trust ${s.trust}%`}`,
    color: hex(sc),
    ring: s.mismatches.length > 0 || brokenVillage === s.village.id,
    href: `/village/${s.village.id}`,
  };
  });

  return (
    <div>
      <PageHeader
        title={BLOCK_NAME.replace(" (demo data)", "")}
        lede={<>
          {VILLAGES.length} villages, {population.toLocaleString("en-IN")} people.{" "}
          {overReporting.length
            ? <b className="text-[var(--sindoor)]">{overReporting.map((s) => s.village.name).join(", ")} declare{overReporting.length === 1 ? "s" : ""} more than the sensors measure.</b>
            : "Every village's declared figures match its sensors."}{" "}
          {openReports} citizen reports are open, and {failing} of {allAssets.length} ponds and dams have dried up or are at risk.
        </>}
      >
        <label className="flex items-center gap-2 text-[14px] text-[var(--slate)]">
          {L("Sort")}
          <select className="rounded-md border border-[var(--line)] bg-white px-2 py-1 text-[14px] text-[var(--ink)]" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            <option value="score">{L("Lowest score first")}</option>
            <option value="trust">{L("Lowest data trust first")}</option>
            <option value="name">{L("Name")}</option>
          </select>
        </label>
      </PageHeader>

      <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
        <table className="w-full min-w-[760px] text-[15px]">
          <thead>
            <tr className="text-left text-[13px] text-[var(--slate)]">
              <th className="pb-2 font-medium">{L("Village")}</th>
              <th className="pb-2 font-medium">{L("Score")}</th>
              <th className="pb-2 font-medium">{L("Declared against measured")}</th>
              <th className="pb-2 font-medium">{L("Data trust")}</th>
              <th className="pb-2 pl-4 text-right font-medium">{L("Sensor faults")}</th>
              <th className="pb-2 pl-4 text-right font-medium">{L("Open reports")}</th>
              <th className="pb-2 pl-6 font-medium">30 days</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.village.id} className="border-t border-[var(--line)] align-top">
                <td className="py-3 pr-4">
                  <Link href={`/village/${s.village.id}`} className="text-[16px] font-semibold hover:underline">{s.village.name}</Link>
                  <span className="block text-[12px] text-[var(--slate)]">{s.village.population.toLocaleString("en-IN")} people{s.village.coastal ? ", coastal" : ""}</span>
                </td>
                <td className="py-3 pr-4"><ScoreText score={s.score} /></td>
                <td className="py-3 pr-4 text-[14px]">
                  {s.mismatches.length
                    ? <span className="text-[var(--sindoor)]">{s.mismatches.map((m) => `${INDICATOR_INFO[m.indicator].label} ${m.claimed}% vs ${m.measured}%`).join(", ")}</span>
                    : <span className="text-[var(--slate)]">{L("Matches")}</span>}
                </td>
                <td className="py-3 pr-4"><TrustText trust={brokenVillage === s.village.id ? Math.min(s.trust, 60) : s.trust} /></td>
                <td className="num py-3 pl-4 text-right">{s.faults.length}</td>
                <td className="num py-3 pl-4 text-right">{reports.filter((r) => r.villageId === s.village.id && r.status !== "Resolved").length}</td>
                <td className="py-3 pl-6"><Sparkline values={hists[s.village.id]} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-10 grid gap-x-10 gap-y-8 border-t border-[var(--line)] pt-8 lg:grid-cols-[1fr_1.1fr]">
        <section aria-labelledby="flags">
          <h2 id="flags" className="text-[24px]">{L("Needs review")}</h2>
          {flags.length === 0 ? (
            <p className="mt-3 text-[var(--slate)]">{L("Nothing needs review right now.")}</p>
          ) : (
            <ul className="mt-2">
              {flags.map((f, i) => (
                <li key={i} className="border-t border-[var(--line)] py-3 first:border-0">
                  <Link href={f.href} className="group block">
                    <p className="text-[15px] font-semibold group-hover:underline" style={{ color: f.tone === "bad" ? "var(--sindoor)" : "#7d5208" }}>{f.title}</p>
                    <p className="text-[14px] text-[var(--slate)]">{f.detail}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section aria-labelledby="bmap">
          <h2 id="bmap" className="mb-3 text-[24px]">{L("Map")}</h2>
          <MapView points={points} height={300} />
          <label className="mt-3 block text-[14px]">
            <span className="flex justify-between"><span className="font-semibold">{L("Replay the last 72 hours")}</span><span className="num text-[var(--slate)]">{replay ? `${replay} h ago` : "Live"}</span></span>
            <input type="range" min={0} max={72} step={3} value={replay} onChange={(e) => setReplay(Number(e.target.value))} className="w-full accent-[var(--ink)]" aria-label={L("Hours ago")} />
          </label>
          <p className="mt-1 text-[13px] text-[var(--slate)]">{L("Colour shows the score. A dark ring means the village's data needs checking.")}</p>
        </section>
      </div>
    </div>
  );
}
