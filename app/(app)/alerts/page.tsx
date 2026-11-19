"use client";

import { useEffect, useState } from "react";
import { useSim } from "@/components/SimProvider";
import { PageHeader, timeAgo } from "@/components/ui";
import IncidentBoard from "@/components/IncidentBoard";
import { RIVER_DANGER_M, VILLAGES, villageById } from "@/lib/data";
import { speak } from "@/lib/speak";
import { ALERT_TEMPLATES, AlertKind, VillageAlert } from "@/lib/types";
import { L } from "@/lib/phrases";

const KINDS: AlertKind[] = ["Cyclone", "Flood", "Heatwave", "Evacuate"];
const KIND_BN: Record<AlertKind, string> = { Cyclone: "ঘূর্ণিঝড়", Flood: "বন্যা", Heatwave: "তাপপ্রবাহ", Evacuate: "সরে যান" };

function Gauge({ name, value }: { name: string; value: number }) {
  const max = 6;
  const pct = Math.min(100, (value / max) * 100);
  const danger = (RIVER_DANGER_M / max) * 100;
  const over = value >= RIVER_DANGER_M;
  const near = value >= RIVER_DANGER_M - 0.5;
  return (
    <div className="flex items-end gap-3">
      <div className="relative h-52 w-6 text-right text-[11px] text-[var(--slate)]" aria-hidden>
        {[6, 4, 2, 0].map((m) => (
          <span key={m} className="num absolute right-0 -translate-y-1/2" style={{ bottom: `${(m / max) * 100}%` }}>{m}m</span>
        ))}
      </div>
      <div className="relative h-52 w-11 overflow-hidden rounded-md border border-[var(--line)] bg-[#fbf7ee]" role="img" aria-label={`${name} river level ${value.toFixed(2)} metres, danger line ${RIVER_DANGER_M} metres`}>
        <div className="absolute inset-x-0 bottom-0 transition-[height] duration-700" style={{ height: `${pct}%`, background: over ? "var(--sindoor)" : near ? "var(--turmeric)" : "var(--river)" }} />
        <div className="absolute inset-x-0 border-t-2 border-dashed border-[var(--sindoor)]" style={{ bottom: `${danger}%` }} />
      </div>
      <div className="pb-1">
        <p className="text-[14px] font-semibold">{name}</p>
        <p className="num text-[22px] font-bold" style={{ color: over ? "var(--sindoor)" : "var(--ink)" }}>{value.toFixed(2)} m</p>
        <p className={`text-[12px] ${over ? "font-semibold text-[var(--sindoor)]" : near ? "text-[#7d5208]" : "text-[var(--slate)]"}`}>
          {over ? "Above danger line" : near ? "Close to danger line" : `Danger line ${RIVER_DANGER_M} m`}
        </p>
      </div>
    </div>
  );
}

function DeliveryDots({ alert }: { alert: VillageAlert }) {
  const done = alert.deliveries.filter((d) => d.status === "Delivered").length;
  const failed = alert.deliveries.filter((d) => d.status === "No reply").length;
  return (
    <div>
      <div className="flex flex-wrap gap-1" aria-hidden>
        {alert.deliveries.map((d) => (
          <span key={d.node} title={`${d.node}: ${d.status}`} className="h-3 w-3 rounded-full transition-colors"
            style={{ background: d.status === "Delivered" ? "var(--paddy)" : d.status === "No reply" ? "var(--sindoor)" : "#e2d6bf" }} />
        ))}
      </div>
      <p className="mt-1 text-[12px] text-[var(--slate)]">
        {done} of {alert.deliveries.length} sirens confirmed{failed ? `, ${failed} not replying: send a volunteer` : ""}
      </p>
    </div>
  );
}

function AlertCard({ a, big }: { a: VillageAlert; big?: boolean }) {
  const [note, setNote] = useState<string | null>(null);
  const meta = `${a.source === "Manual" ? "Sent by the panchayat" : "Sent automatically by the river gauge"}, ${timeAgo(a.ts)}, ${a.villageIds.map((id) => villageById(id)?.name).join(", ")}`;
  return (
    <article className={big ? "rounded-lg border-l-[6px] border-[var(--sindoor)] bg-white p-5" : "border-t border-[var(--line)] py-4"}>
      <p className="text-[13px] text-[var(--slate)]"><b className="text-[var(--sindoor)]">{a.kind} / {KIND_BN[a.kind]}</b>. {meta}</p>
      <p className={`mt-1.5 font-semibold leading-snug ${big ? "text-[21px]" : "text-[17px]"}`} lang="bn">{a.bn}</p>
      <p className="mt-1 text-[14px] text-[var(--slate)]">{a.en}</p>
      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-4 text-[14px] font-semibold text-[var(--river)]">
          <button className="hover:underline" onClick={() => setNote(speak(a.bn, "bn-IN").note ?? null)}>শুনুন</button>
          <button className="hover:underline" onClick={() => speak(a.en, "en-IN")}>{L("Listen in English")}</button>
        </div>
        {!big && <DeliveryDots alert={a} />}
      </div>
      {note && <p className="mt-2 text-[12px] text-[#7d5208]">{note}</p>}
    </article>
  );
}

function CitizenAlerts() {
  const { alerts, villageId, sendSos, sos, lang } = useSim();
  const v = villageById(villageId)!;
  const mine = alerts.filter((a) => a.villageIds.includes(villageId));
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  const bn = lang === "bn";
  const mySos = sos.filter((s) => s.villageId === villageId);

  return (
    <div className="space-y-5">
      <PageHeader title={bn ? "সতর্কবার্তা" : L("Alerts for your village")} lede={bn ? `${v.nameBn}-এর জন্য পঞ্চায়েতের পাঠানো সতর্কবার্তা।` : `Warnings sent by the panchayat for ${v.name}. They also play on the village sirens, even without internet.`} />
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-3">
          {mine.length === 0 ? (
            <div className="border-t border-[var(--line)] pt-4">
              <p className="text-[17px] font-semibold">{bn ? "এখন কোনো সতর্কবার্তা নেই।" : L("No alerts right now.")}</p>
              <p className="mt-1 text-[var(--slate)]">{bn ? "ঝড় বা বন্যার খবর এলে এখানে দেখাবে এবং সাইরেনে বাজবে।" : L("If a storm or flood is coming, the warning shows here and plays on the sirens.")}</p>
            </div>
          ) : mine.map((a) => <AlertCard key={a.id} a={a} big />)}
        </div>
        <section className="rounded-lg bg-white p-5" aria-labelledby="sos-title">
          <h2 id="sos-title" className="text-[19px]">{bn ? "বিপদে পড়েছেন?" : L("Need help now?")}</h2>
          <p className="mt-1 text-[14px] text-[var(--slate)]">{bn ? "পঞ্চায়েত অফিসে জরুরি বার্তা যাবে, নেটওয়ার্ক না থাকলেও রেডিওর মাধ্যমে।" : L("Your SOS goes to the panchayat office, over radio if the mobile network is down.")}</p>
          <textarea className="field mt-3" rows={3} value={text} onChange={(e) => setText(e.target.value)}
            placeholder={bn ? "কী হয়েছে? কোথায় আছেন? (না লিখলেও চলবে)" : L("What happened and where are you? (optional)")} />
          <button className="btn btn-danger mt-3 w-full !py-3 text-[16px]" onClick={() => { sendSos(villageId, text || "SOS, no details"); setText(""); setSent(true); }}>
            {bn ? "জরুরি সাহায্য চান" : L("Send SOS")}
          </button>
          {sent && <p className="mt-3 rounded-md bg-[var(--paddy-tint)] p-3 text-[14px] text-[var(--paddy)]" role="status">{bn ? "আপনার বার্তা পঞ্চায়েতে পৌঁছেছে।" : L("Your SOS reached the panchayat office.")}</p>}
          {mySos.length > 0 && (
            <ul className="mt-4 space-y-1 text-[13px]">
              {mySos.slice(0, 4).map((s) => (
                <li key={s.id} className="flex justify-between gap-2"><span className="truncate">{s.text}</span><span className={s.status === "Help sent" ? "text-[var(--paddy)]" : "text-[var(--slate)]"}>{s.status}</span></li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function OfficerAlerts() {
  const { alerts, sendAlert, snaps, storm, setStorm, role, villageId, sos, markSos } = useSim();
  const own = role === "panchayat";
  const [kind, setKind] = useState<AlertKind>("Cyclone");
  const [targets, setTargets] = useState<string[]>(own ? [villageId] : VILLAGES.filter((v) => v.coastal).map((v) => v.id));
  const [bnText, setBnText] = useState(ALERT_TEMPLATES.Cyclone.bn);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => { setBnText(ALERT_TEMPLATES[kind].bn); }, [kind]);
  useEffect(() => { if (own) setTargets([villageId]); }, [own, villageId]);

  const gauges = snaps.filter((s) => s.river);
  const sirens = targets.length * 3;
  const visibleSos = own ? sos.filter((s) => s.villageId === villageId) : sos;
  const visibleAlerts = own ? alerts.filter((a) => a.villageIds.includes(villageId)) : alerts;

  return (
    <div className="space-y-5">
      <PageHeader title={L("Disaster alerts")} lede={`Bengali voice alerts travel to ${VILLAGES.length * 3} village sirens over LoRa radio, so they still work when mobile networks fail.`} />
      <IncidentBoard villageFilter={own ? villageId : undefined} />

      <div className="grid gap-x-12 gap-y-10 lg:grid-cols-[1fr_1.2fr]">
        <section aria-labelledby="gauges">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 id="gauges" className="text-[24px]">{L("River gauges")}</h2>
            <button className={`btn !py-1.5 text-[13px] ${storm ? "btn-danger" : "btn-ghost"}`} onClick={() => setStorm(!storm)} aria-pressed={storm}>
              {storm ? "Stop storm simulation" : "Simulate storm surge"}
            </button>
          </div>
          <div className="flex flex-wrap gap-8">
            {gauges.map((g) => <Gauge key={g.village.id} name={g.village.name} value={g.river!.value} />)}
          </div>
          <p className="mt-4 text-[13px] text-[var(--slate)]">
            When a gauge crosses {RIVER_DANGER_M} m, a flood warning goes out on its own, with no one needing to press a button.
            {storm && <b className="text-[var(--sindoor)]"> {L("Storm surge running: the water rises every 4 seconds and should cross the line in about 20 seconds.")}</b>}
          </p>
        </section>

        <section className="rounded-lg bg-white p-5" aria-labelledby="compose">
          <h2 id="compose" className="mb-3 text-[24px]">{L("Send an alert")}</h2>
          <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup" aria-label={L("Alert type")}>
            {KINDS.map((k) => (
              <button key={k} role="radio" aria-checked={kind === k} onClick={() => setKind(k)}
                className={`rounded-lg border px-2 py-2 text-left text-[14px] ${kind === k ? "border-[var(--ink)] bg-[var(--ink)] text-white" : "border-[var(--line)] bg-white"}`}>
                <span className="block font-semibold">{k}</span>
                <span className="block text-[12px] opacity-80">{KIND_BN[k]}</span>
              </button>
            ))}
          </div>
          {!own && (
            <fieldset className="mb-3">
              <legend className="mb-1.5 text-[13px] text-[var(--slate)]">{L("Send to")}</legend>
              <div className="flex flex-wrap gap-2">
                {VILLAGES.map((v) => {
                  const on = targets.includes(v.id);
                  return (
                    <label key={v.id} className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-[13px] ${on ? "border-[var(--ink)] bg-[#efe7d7]" : "border-[var(--line)] bg-white"}`}>
                      <input type="checkbox" className="accent-[var(--ink)]" checked={on} onChange={() => setTargets(on ? targets.filter((x) => x !== v.id) : [...targets, v.id])} />
                      {v.name}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          )}
          <label className="block text-[13px] text-[var(--slate)]" htmlFor="bn-msg">{L("Message in Bengali (you can edit it)")}</label>
          <textarea id="bn-msg" lang="bn" className="field mt-1 text-[15px]" rows={3} value={bnText} onChange={(e) => setBnText(e.target.value)} />
          <p className="mt-1 text-[13px] text-[var(--slate)]">English: {ALERT_TEMPLATES[kind].en}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="btn btn-ghost" onClick={() => setNote(speak(bnText, "bn-IN").note ?? null)}>{L("Listen first")}</button>
            <button className="btn btn-danger" disabled={!targets.length || !bnText.trim()}
              onClick={() => { sendAlert(kind, targets, "Manual", { bn: bnText, en: ALERT_TEMPLATES[kind].en }); speak(bnText, "bn-IN"); }}>
              Broadcast to {sirens} sirens
            </button>
          </div>
          {note && <p className="mt-2 text-[12px] text-[#7d5208]">{note}</p>}
        </section>
      </div>

      <div className="mt-12 grid gap-x-12 gap-y-10 border-t border-[var(--ink)] pt-8 lg:grid-cols-[1.4fr_1fr]">
        <section aria-labelledby="log">
          <h2 id="log" className="text-[24px]">Sent alerts ({visibleAlerts.length})</h2>
          {visibleAlerts.length === 0 ? (
            <p className="mt-3 text-[var(--slate)]">{L("None yet. Send one above, or start the storm simulation and watch the river gauge send one by itself.")}</p>
          ) : (
            <div className="mt-2">{visibleAlerts.map((a) => <AlertCard key={a.id} a={a} />)}</div>
          )}
        </section>
        <section aria-labelledby="sos-in">
          <h2 id="sos-in" className="mb-3 text-[24px]">SOS from villagers ({visibleSos.filter((s) => s.status === "New").length} new)</h2>
          {visibleSos.length === 0 ? (
            <p className="text-[14px] text-[var(--slate)]">{L("No SOS messages. Villagers can send one from the citizen view, even over radio.")}</p>
          ) : (
            <ul className="space-y-2">
              {visibleSos.map((s) => (
                <li key={s.id} className="border-l-4 bg-white py-2.5 pl-3 pr-3" style={{ borderColor: s.status === "New" ? "var(--sindoor)" : "var(--paddy)" }}>
                  <p className="text-[14px] font-semibold">{villageById(s.villageId)?.name}</p>
                  <p className="text-[14px]">{s.text}</p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-[12px] text-[var(--slate)]">{timeAgo(s.ts)}</span>
                    {s.status === "New" ? (
                      <button className="btn btn-primary !py-1 text-[13px]" onClick={() => markSos(s.id)}>{L("Mark help sent")}</button>
                    ) : <span className="text-[13px] font-semibold text-[var(--paddy)]">{L("Help sent")}</span>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

export default function AlertsPage() {
  const { role } = useSim();
  return role === "citizen" ? <CitizenAlerts /> : <OfficerAlerts />;
}
