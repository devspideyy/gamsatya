"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { useSim } from "./SimProvider";
import { Seal, Sparkline } from "./ui";
import InsightsPanel from "./InsightsPanel";
import SensorRegister from "./SensorRegister";
import { history, INDICATOR_INFO, scoreBand } from "@/lib/sim";
import type { Indicator } from "@/lib/data";
import type { Declaration, VillageSnapshot } from "@/lib/sim";

function DeclarationForm({ snap, onDone }: { snap: VillageSnapshot; onDone: () => void }) {
  const { submitDeclaration } = useSim();
  const [d, setD] = useState<Declaration>(snap.declared);
  const fields: [keyof Declaration, string][] = [["water", "Water supply working"], ["energy", "Streetlights working"], ["sanitation", "Waste bins cleared"]];
  return (
    <form className="mt-5 rounded-lg border border-[var(--line)] bg-[var(--paper)] p-4"
      onSubmit={(e) => { e.preventDefault(); submitDeclaration(snap.village.id, d); onDone(); }}>
      <p className="font-semibold">This month&apos;s declaration</p>
      <p className="text-[14px] text-[var(--slate)]">Enter the figures you will report on the portal. GramSatya checks them against the sensors as soon as you submit.</p>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {fields.map(([k, label]) => (
          <label key={k} className="text-[14px] font-medium">{label}
            <span className="mt-1 flex items-center gap-1">
              <input type="number" inputMode="numeric" min={0} max={100} name={k} autoComplete="off" required className="field num" value={d[k]}
                onChange={(e) => setD({ ...d, [k]: Math.max(0, Math.min(100, Number(e.target.value))) })} />
              <span className="text-[var(--slate)]">%</span>
            </span>
          </label>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="submit" className="btn btn-primary">Submit declaration</button>
        <button type="button" className="btn btn-ghost" onClick={onDone}>Cancel</button>
      </div>
    </form>
  );
}

const ROWS: Indicator[] = ["water", "energy", "sanitation", "assets", "governance"];

function QrInline({ villageId, name }: { villageId: string; name: string }) {
  const [src, setSrc] = useState("");
  const [url, setUrl] = useState("");
  useEffect(() => {
    const u = `${window.location.origin}/v/${villageId}`;
    setUrl(u);
    QRCode.toDataURL(u, { margin: 1, width: 480, color: { dark: "#1d2847", light: "#ffffff" } }).then(setSrc).catch(() => setSrc(""));
  }, [villageId]);
  return (
    <div className="panel mt-4 flex items-center gap-4 p-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {src ? <img src={src} alt={`QR code for ${name}'s public page`} width={112} height={112} /> : <div className="h-28 w-28 bg-[#f1eadc]" />}
      <div className="min-w-0 text-[14px]">
        <p>Print this for the panchayat office wall. Villagers scan it to see this scorecard in Bengali, no login needed.</p>
        <p className="mt-1 truncate text-[13px] text-[var(--slate)]">{url}</p>
        {src && <a href={src} download={`gramsatya-${villageId}-qr.png`} className="mt-2 inline-block font-semibold text-[var(--river)] hover:underline">Download QR code</a>}
      </div>
    </div>
  );
}

export default function VillageScorecard({ villageId, officer = false }: { villageId: string; officer?: boolean }) {
  const { snapOf, now, lang, verify, ledger, role } = useSim();
  const [showQr, setShowQr] = useState(false);
  const [declaring, setDeclaring] = useState(false);
  const snap = snapOf(villageId);
  const v = snap.village;
  const bn = lang === "bn";
  const dayKey = new Date(now).toDateString();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const past = useMemo(() => history(v, now, 30), [v.id, dayKey]);
  const trend = [...past.slice(0, -1).map((p) => p.score), snap.score];
  const delta = snap.score - trend[0];
  const ledgerBroken = !verify.ok && ledger.find((r) => r.i === verify.brokenAt)?.villageId === v.id;
  const claims: Partial<Record<Indicator, number>> = snap.declared;
  const flagged = snap.mismatches.length > 0;

  const verdict = ledgerBroken
    ? "Someone edited this village's past readings. Its data is no longer trusted."
    : flagged
      ? "The panchayat declares more than the sensors measure."
      : `Declared figures match the sensors. The village is ${scoreBand(snap.score).label.toLowerCase()}.`;

  return (
    <div>
      {officer && <Link href="/dashboard" className="mb-4 inline-block text-[14px] font-semibold text-[var(--river)] hover:underline">All villages</Link>}

      <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 pb-5">
        <div>
          <h1 className="text-[44px] leading-none md:text-[60px]">
            {bn ? v.nameBn : v.name} <span className="text-[26px] text-[var(--brass)] md:text-[32px]" lang={bn ? "en" : "bn"}>{bn ? v.name : v.nameBn}</span>
          </h1>
          <p className="mt-3 text-[15px] text-[var(--slate)]">
            Gram Panchayat, {v.population.toLocaleString("en-IN")} people.{" "}
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap"><span className="live-dot" aria-hidden />Live at {new Date(now).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", second: "2-digit" })}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/v/${v.id}`} className="btn btn-ghost">Public page</Link>
          <button className="btn btn-ghost" onClick={() => setShowQr(!showQr)} aria-expanded={showQr}>{showQr ? "Hide QR code" : "QR code"}</button>
        </div>
      </header>
      <div className="stitch" aria-hidden />
      {showQr && <QrInline villageId={v.id} name={v.name} />}

      <section className="panel mt-8 grid items-start gap-x-10 gap-y-6 p-5 md:grid-cols-[200px_1fr] md:p-8" aria-label="Declared against measured">
        <div className="flex justify-center md:block"><Seal score={snap.score} name={v.name} size={200} verified={!ledgerBroken} /></div>
        <div>
          <h2 className="max-w-[40rem] text-[26px] leading-snug md:text-[30px]" style={{ color: flagged || ledgerBroken ? "var(--sindoor)" : "var(--ink)" }} aria-live="polite">{verdict}</h2>

          <table className="mt-5 w-full text-[15px]">
            <thead>
              <tr className="text-left text-[13px] text-[var(--slate)]">
                <th className="pb-2 font-medium">Indicator</th>
                <th className="pb-2 text-right font-medium">Declared</th>
                <th className="pb-2 text-right font-medium">Measured</th>
                <th className="hidden w-[38%] pb-2 pl-6 font-medium sm:table-cell"><span className="sr-only">Comparison</span></th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((k) => {
                const measured = snap.indicators[k];
                const claimed = claims[k];
                const over = snap.mismatches.some((m) => m.indicator === k);
                return (
                  <tr key={k} className="border-t border-[var(--line)]">
                    <td className="py-2.5">
                      <span className="font-medium">{bn ? INDICATOR_INFO[k].labelBn : INDICATOR_INFO[k].label}</span>
                      <span className="block text-[12px] text-[var(--slate)]">{INDICATOR_INFO[k].pai}</span>
                    </td>
                    <td className="num py-2.5 text-right">
                      {claimed === undefined ? <span className="text-[13px] text-[var(--slate)]">Not declared</span>
                        : <span className={over ? "text-[var(--slate)] line-through decoration-[var(--sindoor)] decoration-2" : ""}>{claimed}%</span>}
                    </td>
                    <td className="num py-2.5 text-right text-[17px] font-bold" style={{ color: over ? "var(--sindoor)" : scoreBand(measured).color }}>{measured}%</td>
                    <td className="hidden py-2.5 pl-6 sm:table-cell">
                      <div className="relative h-2.5 rounded-full bg-[#ebe2d0]" aria-hidden>
                        <div className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-500" style={{ width: `${measured}%`, background: over ? "var(--sindoor)" : scoreBand(measured).color }} />
                        {claimed !== undefined && <div className="absolute -top-1 h-[18px] w-[3px] rounded bg-[var(--ink)]" style={{ left: `calc(${claimed}% - 2px)` }} title={`Declared ${claimed}%`} />}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <p className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[14px] text-[var(--slate)]">
            <span>Data trust <b className="num" style={{ color: snap.trust >= 80 ? "var(--paddy)" : snap.trust >= 60 ? "var(--turmeric)" : "var(--sindoor)" }}>{snap.trust}%</b></span>
            <span className="inline-flex items-center gap-2">{delta >= 0 ? "Up" : "Down"} <b className="num text-[var(--ink)]">{Math.abs(delta)}</b> points in 30 days <Sparkline values={trend} /></span>
            <span style={{ color: ledgerBroken ? "var(--sindoor)" : undefined }}>
              {ledgerBroken ? <Link href="/ledger" className="font-semibold underline">Ledger edited</Link> : "Ledger intact"}
            </span>
            <span className="hidden text-[13px] lg:inline"><span className="mr-1 inline-block h-3 w-[3px] translate-y-0.5 rounded bg-[var(--ink)]" />marks the declared figure</span>
          </p>
          {role === "panchayat" && !officer && (declaring
            ? <DeclarationForm snap={snap} onDone={() => setDeclaring(false)} />
            : <button className="btn btn-primary mt-5" onClick={() => setDeclaring(true)}>Submit this month&apos;s declaration</button>)}
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.15fr]">
        <div className="panel p-5 md:p-7"><InsightsPanel snap={snap} /></div>
        <div className="panel p-5 md:p-7"><SensorRegister snap={snap} /></div>
      </div>
    </div>
  );
}
