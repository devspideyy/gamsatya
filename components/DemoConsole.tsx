"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSim } from "./SimProvider";
import { SENSORS, VILLAGES, villageById } from "@/lib/data";
import { L } from "@/lib/phrases";

/** One drawer that runs every scripted demo, so a live pitch never depends on hunting through pages. */
export default function DemoConsole() {
  const sim = useSim();
  const [open, setOpen] = useState(false);
  const [node, setNode] = useState("radhaganj-handpump-1");
  const [fireVillage, setFireVillage] = useState("radhaganj");
  const [log, setLog] = useState<string[]>([]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const note = (s: string) => setLog((l) => [`${new Date().toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", second: "2-digit" })}  ${s}`, ...l].slice(0, 6));
  const isOff = sim.offline.includes(node);
  const sensor = SENSORS.find((s) => s.id === node);

  return (
    <>
      <button onClick={() => setOpen(true)} aria-haspopup="dialog"
        className="fixed bottom-5 right-5 z-[700] flex min-h-[48px] items-center gap-2 rounded-full bg-[var(--sindoor)] px-5 font-semibold text-white shadow-[0_8px_24px_-8px_rgba(0,0,0,0.5)] hover:bg-[#861c15]">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><path d="M5 3l14 9-14 9z" /></svg>
        {L("Demo console")}
      </button>
      {open && (
        <div className="fixed inset-0 z-[800] flex justify-end bg-black/30" onClick={() => setOpen(false)}>
          <aside role="dialog" aria-modal="true" aria-labelledby="console-title" onClick={(e) => e.stopPropagation()}
            className="h-full w-full max-w-[400px] overflow-y-auto bg-[var(--card)] p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 id="console-title" className="text-[26px]">{L("Demo console")}</h2>
              <button className="btn btn-ghost !min-h-[40px]" onClick={() => setOpen(false)}>{L("Close")}</button>
            </div>
            <p className="mt-1 text-[14px] text-[var(--slate)]">{L("Runs the scripted scenarios. Nothing real is sent: sirens, SMS and calls are simulated.")}</p>

            <section className="mt-5 border-t border-[var(--line)] pt-4">
              <h3 className="text-[15px]">{L("Live sensor feed")}</h3>
              <button className="btn btn-ghost mt-2 w-full" onClick={() => { sim.setPaused(!sim.paused); note(sim.paused ? "Live feed resumed" : "Live feed paused"); }}>
                {sim.paused ? "Resume live feed" : "Pause live feed"}
              </button>
            </section>

            <section className="mt-5 border-t border-[var(--line)] pt-4">
              <h3 className="text-[15px]">{L("Scenarios")}</h3>
              <div className="mt-2 grid gap-2">
                <button className={`btn ${sim.storm ? "btn-danger" : "btn-primary"}`} onClick={() => { sim.setStorm(!sim.storm); note(sim.storm ? "Flood stopped, water receding" : "Flood started at Haripur Char and Dakshin Mathabhanga"); }}>
                  {sim.storm ? "Stop flood" : "Flood: storm surge on the river"}
                </button>
                <div className="flex gap-2">
                  <select className="field !w-auto flex-1" value={fireVillage} onChange={(e) => setFireVillage(e.target.value)} aria-label={L("Village for the fire")}>
                    {VILLAGES.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                  <button className="btn btn-primary" onClick={() => { sim.startFire(fireVillage); note(`Fire scenario started in ${villageById(fireVillage)?.name}`); }}>{L("Fire")}</button>
                </div>
                <button className="btn btn-primary" onClick={() => { sim.sendSos("nalbon", "Elderly man fell near the embankment, cannot walk."); note("SOS from Nalbon (2G only)"); }}>
                  {L("SOS from a 2G village")}
                </button>
              </div>
              <p className="mt-2 text-[13px] text-[var(--slate)]">
                {L("Watch them on")} <Link className="font-semibold text-[var(--river)] underline" href="/alerts" onClick={() => setOpen(false)}>{L("Alerts")}</Link> and{" "}
                <Link className="font-semibold text-[var(--river)] underline" href="/safety" onClick={() => setOpen(false)}>{L("Safety")}</Link>.
              </p>
            </section>

            <section className="mt-5 border-t border-[var(--line)] pt-4">
              <h3 className="text-[15px]">{L("Any sensor node")}</h3>
              <select className="field mt-2" value={node} onChange={(e) => setNode(e.target.value)} aria-label={L("Sensor node")}>
                {VILLAGES.map((v) => (
                  <optgroup key={v.id} label={v.name}>
                    {SENSORS.filter((s) => s.villageId === v.id).map((s) => <option key={s.id} value={s.id}>{s.label}{sim.offline.includes(s.id) ? " (offline)" : ""}</option>)}
                  </optgroup>
                ))}
              </select>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button className="btn btn-ghost" onClick={() => note(sim.verify.ok ? `Chain verified: all ${sim.verify.checked} records valid` : `Chain broken at record ${sim.verify.brokenAt}`)}>{L("Verify chain")}</button>
                <button className="btn btn-ghost" onClick={() => { const r = sim.tamper(node); note(r ? `Edited a past reading of ${sensor?.label}, ${villageById(r.villageId)?.name}` : "No reading to edit yet"); }}>{L("Edit a reading")}</button>
                <button className="btn btn-ghost" onClick={() => { sim.setOffline(node, !isOff); note(`${sensor?.label} ${isOff ? "back online" : "lost power"}`); }}>{isOff ? "Power back" : "Power loss"}</button>
                <button className="btn btn-ghost" onClick={() => { sim.setOffline(node, false); sim.restoreLedger(); note("Node restored, ledger rebuilt from signed copies"); }}>{L("Restore")}</button>
              </div>
              <p className="mt-2 text-[13px] text-[var(--slate)]">{L("Power loss marks the node unverified. If every sensor behind an indicator is offline, that indicator falls back to the declared figure at 45% weight.")}</p>
            </section>

            <section className="mt-5 border-t border-[var(--line)] pt-4">
              <button className="btn btn-ghost w-full" onClick={() => { sim.resetDemo(); note("All demo data reset"); }}>{L("Reset all demo data")}</button>
              {log.length > 0 && (
                <ul className="mt-3 space-y-1 text-[13px] text-[var(--slate)]" aria-live="polite">
                  {log.map((l, i) => <li key={i} className="num">{l}</li>)}
                </ul>
              )}
            </section>
          </aside>
        </div>
      )}
    </>
  );
}
