"use client";

import { useMemo, useState } from "react";
import { useSim } from "./SimProvider";
import MapView from "./MapView";
import { VILLAGES, villageById } from "@/lib/data";
import { CAT_LABEL, cellTotal, MIN_SHOWN, SAFETY_CATS, SAFETY_CELLS, type SafetyCat } from "@/lib/safety";
import { L, villageName } from "@/lib/phrases";

export default function SafetyMap() {
  const { snaps, lang } = useSim();
  const [cat, setCat] = useState<SafetyCat | "All">("All");
  const [days, setDays] = useState<30 | 90>(90);
  const [village, setVillage] = useState("All");

  const totals = SAFETY_CELLS.map((c) => cellTotal(c, cat, days));
  const max = Math.max(...totals, 1);
  const inScope = (i: number) => village === "All" || SAFETY_CELLS[i].nearestVillage === village;
  const ranked = SAFETY_CELLS.map((c, i) => ({ c, n: totals[i] })).filter(({ c, n }) => n >= MIN_SHOWN && inScope(c.index)).sort((a, b) => b.n - a.n);
  const [picked, setPicked] = useState<number | null>(null);
  const sel = picked !== null && inScope(picked) ? SAFETY_CELLS[picked] : ranked[0]?.c;

  const focus = useMemo<[number, number, number, number] | undefined>(() => {
    if (village === "All") return undefined;
    const v = villageById(village)!;
    return [v.lat - 0.025, v.lng - 0.03, v.lat + 0.025, v.lng + 0.03];
  }, [village]);

  const cells = SAFETY_CELLS.map((c, i) => {
    const n = totals[i];
    const hidden = n < MIN_SHOWN;
    const dim = !inScope(i);
    return {
      south: c.south, west: c.west, north: c.north, east: c.east,
      color: hidden ? "#9a927f" : "#a3241b",
      opacity: dim ? 0.03 : hidden ? 0.06 : 0.18 + (n / max) * 0.55,
      label: `${L("Square")} ${c.code}: ${hidden ? L("fewer than 3 reports") : `${n} ${L("reports")}`}, ${L("near")} ${villageName(villageById(c.nearestVillage)!, lang)}`,
      selected: sel?.index === i,
    };
  });
  const points = VILLAGES.map((v) => ({ lat: v.lat, lng: v.lng, radius: 5, color: "#1d2847", label: villageName(v, lang) }));

  const selSnap = sel ? snaps.find((s) => s.village.id === sel.nearestVillage) : undefined;
  const lights = selSnap?.readings.filter((r) => r.sensor.type === "streetlight") ?? [];
  const lightsOn = lights.filter((r) => r.ok && !r.offline).length;
  const selTotal = sel ? cellTotal(sel, "All", days) : 0;

  return (
    <section className="panel mt-6 p-5 md:p-7" aria-labelledby="smap-h">
      <h2 id="smap-h" className="text-[26px]">{L("Safety reports on the map")}</h2>
      <p className="mt-1 text-[15px] text-[var(--slate)]">{L("Counts in squares of about 2 km. Squares with fewer than 3 reports stay blank so nobody can be identified. Sample data.")}</p>

      <div className="mt-4 flex flex-wrap gap-3">
        <label className="text-[13px] text-[var(--slate)]">{L("Type")}
          <select className="field mt-1 block !w-auto" value={cat} onChange={(e) => setCat(e.target.value as SafetyCat | "All")}>
            <option value="All">{L("All types")}</option>
            {SAFETY_CATS.map((k) => <option key={k} value={k}>{CAT_LABEL[k][lang]}</option>)}
          </select>
        </label>
        <label className="text-[13px] text-[var(--slate)]">{L("Period")}
          <select className="field mt-1 block !w-auto" value={days} onChange={(e) => setDays(Number(e.target.value) as 30 | 90)}>
            <option value={30}>{L("Last 30 days")}</option>
            <option value={90}>{L("Last 90 days")}</option>
          </select>
        </label>
        <label className="text-[13px] text-[var(--slate)]">{L("Village")}
          <select className="field mt-1 block !w-auto" value={village} onChange={(e) => { setVillage(e.target.value); setPicked(null); }}>
            <option value="All">{L("Whole block")}</option>
            {VILLAGES.map((v) => <option key={v.id} value={v.id}>{villageName(v, lang)}</option>)}
          </select>
        </label>
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <MapView height={430} points={points} cells={cells} focus={focus} onCellClick={(i) => setPicked(i)} />
          <div className="mt-2 flex flex-wrap items-center gap-3 text-[13px] text-[var(--slate)]">
            <span>{L("Fewer")}</span>
            <span className="h-3 w-40 rounded-sm" style={{ background: "linear-gradient(90deg, rgba(163,36,27,0.18), rgba(163,36,27,0.73))" }} aria-hidden />
            <span>{L("More reports")}</span>
            <span className="ml-2">{L("Tap a square for details.")}</span>
          </div>
        </div>

        <div>
          {sel ? (
            <div aria-live="polite">
              <p className="text-[13px] text-[var(--slate)]">{L("Square")} {sel.code}, {L("near")} {villageName(villageById(sel.nearestVillage)!, lang)} ({sel.distanceKm} km)</p>
              <p className="mt-1 text-[34px] leading-none" style={{ fontFamily: "var(--font-display)" }}>
                {selTotal < MIN_SHOWN ? L("Fewer than 3") : selTotal} <span className="text-[17px] text-[var(--slate)]">{L("reports")}, {days === 30 ? L("last 30 days") : L("last 90 days")}</span>
              </p>
              {selTotal >= MIN_SHOWN && (
                <>
                  <ul className="mt-4 space-y-2">
                    {SAFETY_CATS.map((k) => {
                      const n = cellTotal(sel, k, days);
                      return (
                        <li key={k}>
                          <div className="flex justify-between text-[14px]"><span>{CAT_LABEL[k][lang]}</span><b className="num">{n < MIN_SHOWN ? "<3" : n}</b></div>
                          <div className="mt-1 h-2 rounded-full bg-[#ebe2d0]"><div className="h-2 rounded-full bg-[var(--sindoor)]" style={{ width: `${(n / Math.max(1, selTotal)) * 100}%`, opacity: n < MIN_SHOWN ? 0.3 : 1 }} /></div>
                        </li>
                      );
                    })}
                  </ul>
                  <p className="mt-4 text-[14px]"><b className="num">{Math.round(sel.afterDark * 100)}%</b> {L("of reports were after dark (6 pm to 6 am).")}</p>
                </>
              )}
              {lights.length > 0 && (
                <p className="mt-2 text-[14px]">
                  {L("Streetlights in this village right now")}: <b className="num" style={{ color: lightsOn === lights.length ? "var(--paddy)" : "var(--sindoor)" }}>{lightsOn} / {lights.length}</b>
                </p>
              )}
              {selTotal >= MIN_SHOWN && (
                <p className="mt-3 rounded-md bg-[var(--paper)] p-3 text-[14px]">
                  <b>{L("Suggested action")}:</b>{" "}
                  {sel.counts["Dark street"] >= Math.max(sel.counts.Harassment, sel.counts.Theft)
                    ? L("Fix dark streetlights first and add one near the busiest path.")
                    : L("Ask the beat officer for evening patrols and put up the helpline number.")}
                </p>
              )}
            </div>
          ) : <p className="text-[var(--slate)]">{L("No square has 3 or more reports for this filter.")}</p>}

          <h3 className="mt-6 text-[15px]">{L("Busiest squares")}</h3>
          <ol className="mt-1">
            {ranked.slice(0, 5).map(({ c, n }) => (
              <li key={c.index}>
                <button onClick={() => setPicked(c.index)} className={`flex min-h-[40px] w-full items-center justify-between border-t border-[var(--line-soft)] text-left text-[14px] ${sel?.index === c.index ? "font-semibold" : ""}`}>
                  <span>{L("Square")} {c.code}, {villageName(villageById(c.nearestVillage)!, lang)}</span><span className="num">{n}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
