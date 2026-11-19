"use client";

import { useEffect, useState } from "react";
import { useSim } from "@/components/SimProvider";
import { PageHeader, timeAgo } from "@/components/ui";
import { VILLAGES, villageById } from "@/lib/data";
import SafetyMap from "@/components/SafetyMap";
import type { Sos } from "@/lib/types";
import { L } from "@/lib/phrases";

function SosTimeline({ s, now }: { s: Sos; now: number }) {
  const { markSos } = useSim();
  const steps = s.path ?? [];
  return (
    <li className="border-t border-[var(--line)] py-4 first:border-0">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-semibold">{villageById(s.villageId)?.name} <span className="font-normal text-[var(--slate)]">({villageById(s.villageId)?.network} network), {timeAgo(s.ts, now)}</span></p>
        <span className="text-[14px] font-semibold" style={{ color: s.status === "Safe" ? "var(--paddy)" : s.status === "Help sent" ? "var(--river)" : "var(--sindoor)" }}>{s.status}</span>
      </div>
      <p className="text-[15px]">{s.text}</p>
      <ol className="mt-3 grid gap-2 sm:grid-cols-4">
        {steps.map((st) => {
          const done = now - s.ts >= st.after;
          return (
            <li key={st.label} className="border-t-[3px] pt-2" style={{ borderColor: !done ? "var(--line)" : st.ok ? "var(--paddy)" : "var(--sindoor)" }}>
              <p className="text-[14px] font-semibold">{st.label}</p>
              <p className="text-[13px] text-[var(--slate)]">{done ? `${st.detail}, ${Math.round(st.after / 1000)}s` : "Waiting"}</p>
            </li>
          );
        })}
      </ol>
      <div className="mt-3 flex gap-2">
        {s.status === "New" && <button className="btn btn-primary" onClick={() => markSos(s.id, "Help sent")}>{L("Mark help sent")}</button>}
        {s.status !== "Safe" && <button className="btn btn-ghost" onClick={() => markSos(s.id, "Safe")}>{L("Mark safe")}</button>}
      </div>
    </li>
  );
}

const ROUTES = [
  { villageId: "radhaganj", name: "School to bus stand", lights: [1, 2, 3] },
  { villageId: "radhaganj", name: "Haat to health centre", lights: [4, 5, 6] },
  { villageId: "kusumpur", name: "Ghat to temple road", lights: [5, 6] },
  { villageId: "haripur-char", name: "Embankment path to shelter", lights: [1, 2, 3, 4] },
  { villageId: "dakshin-mathabhanga", name: "Tube well lane to school", lights: [1, 4, 5] },
  { villageId: "lahiripur", name: "Jetty to market", lights: [1, 3, 4] },
  { villageId: "bijoynagar", name: "Bus stop to girls' hostel", lights: [2, 5, 6] },
  { villageId: "sonagaon", name: "College road", lights: [2, 3, 4] },
];

export default function SafetyPage() {
  const { sos, sendSos, villageId, role, snaps } = useSim();
  const [now, setNow] = useState(Date.now());
  const [sosVillage, setSosVillage] = useState(role === "citizen" || role === "panchayat" ? villageId : "nalbon");
  const [queue, setQueue] = useState([
    { id: "m1", text: "Men drinking near the school gate after dark", cell: "C4", status: "Pending" },
    { id: "m2", text: "Phone snatched near the bus stand", cell: "B2", status: "Pending" },
    { id: "m3", text: "Names a neighbour as a thief", cell: "D5", status: "Pending" },
  ]);
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);

  const officer = role === "block" || role === "district";
  const visible = role === "panchayat" || role === "citizen" ? sos.filter((s) => s.villageId === villageId) : sos;

  return (
    <div>
      <PageHeader title={L("Safety")} lede={L("An SOS reaches help even without internet: it falls back to LoRa radio and SMS. Safety data is shown only as area counts, never names or exact locations.")} />

      <section className="panel p-5 md:p-7" aria-labelledby="sos-h">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="sos-h" className="text-[26px]">SOS</h2>
          <div className="flex flex-wrap gap-2">
            {role !== "citizen" && (
              <select className="field !w-auto" value={sosVillage} onChange={(e) => setSosVillage(e.target.value)} aria-label={L("Village sending the SOS")}>
                {VILLAGES.map((v) => <option key={v.id} value={v.id}>{v.name} ({v.network})</option>)}
              </select>
            )}
            <button className="btn btn-danger" onClick={() => sendSos(sosVillage, "Woman alone on the embankment road, being followed.")}>{L("Send a test SOS")}</button>
          </div>
        </div>
        {visible.length === 0 ? (
          <p className="mt-3 text-[var(--slate)]">{L("No SOS yet. Send a test from a 2G village to see the fallback path.")}</p>
        ) : (
          <ul className="mt-2">{visible.slice(0, 5).map((s) => <SosTimeline key={s.id} s={s} now={now} />)}</ul>
        )}
      </section>

      <SafetyMap />

      <div className="mt-6 grid gap-6">
        <section className="panel p-5 md:p-7" aria-labelledby="routes-h">
          <h2 id="routes-h" className="text-[24px]">{L("Safe routes after dark")}</h2>
          <p className="mt-1 text-[14px] text-[var(--slate)]">{L("Each route is checked against the live streetlight sensors along it.")}</p>
          <ul className="mt-3">
            {ROUTES.map((r) => {
              const snap = snaps.find((s) => s.village.id === r.villageId);
              const lights = r.lights.map((n) => snap?.readings.find((x) => x.sensor.id === `${r.villageId}-streetlight-${n}`)).filter(Boolean);
              const on = lights.filter((l) => l!.ok && !l!.offline).length;
              const safe = on === lights.length;
              return (
                <li key={r.name} className="flex items-center justify-between gap-3 border-t border-[var(--line-soft)] py-3 first:border-0">
                  <div>
                    <p className="font-semibold">{r.name}</p>
                    <p className="text-[13px] text-[var(--slate)]">{villageById(r.villageId)?.name}, {on} of {lights.length} lights on</p>
                  </div>
                  <span className="text-[14px] font-semibold" style={{ color: safe ? "var(--paddy)" : "var(--sindoor)" }}>{safe ? "Fully lit" : "Dark stretch"}</span>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      {officer && (
        <section className="panel mt-6 p-5 md:p-7" aria-labelledby="mod-h">
          <h2 id="mod-h" className="text-[24px]">{L("Moderation queue")}</h2>
          <p className="mt-1 text-[14px] text-[var(--slate)]">{L("Villager safety tags are checked before they count. Anything naming a person is rejected.")}</p>
          <ul className="mt-3">
            {queue.map((q) => (
              <li key={q.id} className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line-soft)] py-3 first:border-0">
                <div>
                  <p>{q.text}</p>
                  <p className="text-[13px] text-[var(--slate)]">Square {q.cell}</p>
                </div>
                {q.status === "Pending" ? (
                  <div className="flex gap-2">
                    <button className="btn btn-primary" onClick={() => setQueue(queue.map((x) => (x.id === q.id ? { ...x, status: "Approved" } : x)))}>{L("Approve")}</button>
                    <button className="btn btn-ghost" onClick={() => setQueue(queue.map((x) => (x.id === q.id ? { ...x, status: "Rejected" } : x)))}>{L("Reject")}</button>
                  </div>
                ) : <span className="font-semibold" style={{ color: q.status === "Approved" ? "var(--paddy)" : "var(--sindoor)" }}>{q.status}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
