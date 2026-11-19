"use client";

import { useState } from "react";
import { useSim } from "@/components/SimProvider";
import { PageHeader } from "@/components/ui";
import { SENSORS, VILLAGES, villageById } from "@/lib/data";
import { sha256, payload } from "@/lib/ledger";
import { downloadCsv, today } from "@/lib/csv";
import { L } from "@/lib/phrases";

function fmtValue(sensorId: string, value: number) {
  if (sensorId.includes("streetlight")) return value > 5 ? `On, ${value.toFixed(0)} W` : "Off";
  if (sensorId.includes("handpump")) return `${value.toFixed(1)} L/min`;
  if (sensorId.includes("river")) return `${value.toFixed(2)} m`;
  return `${Math.round(value)}%`;
}

export default function LedgerPage() {
  const { ledger, verify, tamper, restoreLedger, role, villageId } = useSim();
  const [filter, setFilter] = useState<string>(role === "panchayat" ? villageId : "All");
  const [checking, setChecking] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [limit, setLimit] = useState(20);

  const brokenAt = verify.ok ? undefined : verify.brokenAt;
  const brokenRecord = ledger.find((r) => r.i === brokenAt);
  const rows = [...ledger].reverse().filter((r) => filter === "All" || r.villageId === filter);
  const shownRows = rows.slice(0, limit);
  const deviceCount = ledger.filter((r) => r.source === "device").length;

  function reverify() {
    setChecking(true);
    setTimeout(() => setChecking(false), 700);
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={L("Data ledger")}
        lede={L("Each device signs its readings, and every reading's fingerprint includes the one before it. Change one old number and the chain breaks, so nobody can quietly rewrite a village's history.")}
      />

      <section className="border-l-4 py-1 pl-5" style={{ borderColor: verify.ok ? "var(--paddy)" : "var(--sindoor)" }} aria-live="polite">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden className="shrink-0">
              <circle cx="22" cy="22" r="20" fill={verify.ok ? "var(--paddy-tint)" : "var(--sindoor-tint)"} stroke={verify.ok ? "var(--paddy)" : "var(--sindoor)"} strokeWidth="2" />
              {verify.ok
                ? <path d="M13 22.5l6 6 12-13" fill="none" stroke="var(--paddy)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
                : <path d="M15 15l14 14M29 15L15 29" stroke="var(--sindoor)" strokeWidth="3.2" strokeLinecap="round" />}
            </svg>
            <div>
              <p className="text-[19px] font-semibold" style={{ color: verify.ok ? "var(--paddy)" : "var(--sindoor)" }}>
                {checking ? "Checking every fingerprint…" : verify.ok ? `Chain intact. All ${ledger.length} records verified.` : `Chain broken at record ${brokenAt}.`}
              </p>
              <p className="text-[14px] text-[var(--slate)]">
                {verify.ok
                  ? `${deviceCount ? `${deviceCount} records came signed from real devices. ` : ""}New readings are added every few seconds.`
                  : `${verify.reason}. ${brokenRecord ? `${villageById(brokenRecord.villageId)?.name}'s data is now marked unverified and its trust score drops.` : ""}`}
              </p>
              {lastAction && <p className="mt-1 text-[13px] text-[#7d5208]">{lastAction}</p>}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="btn btn-ghost" onClick={reverify}>{L("Verify again")}</button>
            <button className="btn btn-ghost" onClick={() => downloadCsv(`gramsatya-ledger-audit-${today()}.csv`, [
              ["No.", "Time", "Village", "Sensor", "Value", "Source", "Previous fingerprint", "Fingerprint", "Check"],
              ...ledger.map((r) => [r.i, new Date(r.ts).toISOString(), r.villageId, r.sensorId, r.value.toFixed(2), r.source, r.prevHash, r.hash,
                brokenAt !== undefined && r.i === brokenAt ? "MISMATCH" : brokenAt !== undefined && r.i > brokenAt ? "after edit" : "ok"]),
            ])}>{L("Download audit (CSV)")}</button>
            {!verify.ok && brokenAt !== undefined && (
              <button className="btn btn-ghost" onClick={() => {
                setFilter("All");
                setLimit(Math.max(limit, ledger.length));
                setTimeout(() => document.getElementById(`rec-${brokenAt}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
              }}>Show record {brokenAt}</button>
            )}
            {verify.ok ? (
              <button className="btn btn-danger" onClick={() => {
                const r = tamper();
                if (r) setLastAction(`Demo: changed ${SENSORS.find((s) => s.id === r.sensorId)?.label} in ${villageById(r.villageId)?.name} from "${fmtValue(r.sensorId, r.value)}" to look like it was working, without updating its fingerprint.`);
              }}>{L("Simulate tampering")}</button>
            ) : (
              <button className="btn btn-primary" onClick={() => { restoreLedger(); setLastAction("Restored from the copies held on each device and the block server."); }}>{L("Restore from device copies")}</button>
            )}
          </div>
        </div>
      </section>


      <section className="mt-10" aria-labelledby="reg">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h2 id="reg" className="text-[24px]">{L("Register, newest first")}</h2>
          <select className="rounded-md border border-[var(--line)] bg-white px-2 py-1 text-[14px]" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label={L("Filter by village")}>
            <option value="All">{L("All villages")}</option>
            {VILLAGES.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </div>
        <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
          <table className="data-table min-w-[860px]">
            <thead>
              <tr><th className="w-8" aria-label="Chain" /><th>{L("No.")}</th><th>{L("Time")}</th><th>{L("Village")}</th><th>{L("Sensor")}</th><th>{L("Reading")}</th><th>{L("Source")}</th><th>{L("Fingerprint")}</th><th>{L("Check")}</th></tr>
            </thead>
            <tbody>
              {shownRows.map((r, idx) => {
                const bad = brokenAt !== undefined && r.i === brokenAt;
                const after = brokenAt !== undefined && r.i > brokenAt;
                const recomputed = bad ? sha256(payload(r)) : r.hash;
                return (
                  <tr key={r.i} id={`rec-${r.i}`} style={{ background: bad ? "var(--sindoor-tint)" : after ? "#fdf7ea" : undefined }}>
                    <td className="relative !py-0">
                      <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2" style={{ background: idx === shownRows.length - 1 ? "transparent" : bad || after ? "var(--sindoor)" : "#d9c49a" }} aria-hidden />
                      <span className="relative mx-auto block h-3 w-3 rounded-full border-2 bg-white" style={{ borderColor: bad ? "var(--sindoor)" : after ? "var(--turmeric)" : "var(--paddy)" }} aria-hidden />
                    </td>
                    <td className="num text-[var(--slate)]">{r.i}</td>
                    <td className="num whitespace-nowrap">{new Date(r.ts).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", second: "2-digit" })}</td>
                    <td>{villageById(r.villageId)?.name}</td>
                    <td className="whitespace-nowrap">{SENSORS.find((s) => s.id === r.sensorId)?.label}</td>
                    <td className="num whitespace-nowrap font-medium" style={{ color: bad ? "var(--sindoor)" : undefined }}>{fmtValue(r.sensorId, r.value)}{bad && " (edited)"}</td>
                    <td className="whitespace-nowrap text-[13px]" style={{ color: r.source === "device" ? "var(--river)" : "var(--slate)" }}>{r.source === "device" ? <b>{L("ESP32, signed")}</b> : "Simulated node"}</td>
                    <td className="whitespace-nowrap text-[13px]">
                      <code className="text-[var(--ink)]">{r.hash.slice(0, 12)}</code>
                      {bad && <span className="block text-[12px] text-[var(--sindoor)]">now computes to <code>{recomputed.slice(0, 12)}</code></span>}
                    </td>
                    <td className="whitespace-nowrap text-[13px]">
                      {bad ? <span className="font-semibold text-[var(--sindoor)]">{L("Fingerprint mismatch")}</span> : after ? <span className="text-[#7d5208]">{L("Built on an edited record")}</span> : <span className="text-[var(--paddy)]">{L("Verified")}</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {rows.length > limit && (
          <div className="pt-3">
            <button className="text-[14px] font-semibold text-[var(--river)] hover:underline" onClick={() => setLimit(limit + 30)}>Show {Math.min(30, rows.length - limit)} older records</button>
          </div>
        )}
      </section>
    </div>
  );
}
