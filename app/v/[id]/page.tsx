"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useSim } from "@/components/SimProvider";
import { LangToggle, Wordmark } from "@/components/AppShell";
import { Seal, timeAgo } from "@/components/ui";
import { villageById } from "@/lib/data";
import { INDICATOR_INFO } from "@/lib/sim";
import { bnDigits, summarize, Tone } from "@/lib/summary";
import { speak } from "@/lib/speak";
import { CATEGORY_LABEL } from "@/lib/types";
import { L, phraseLang, villageName } from "@/lib/phrases";

const TONE: Record<Tone, { color: string; en: string; bn: string }> = {
  good: { color: "var(--paddy)", en: "Working", bn: "ঠিক আছে" },
  warn: { color: "var(--turmeric)", en: "Partly working", bn: "আংশিক" },
  bad: { color: "var(--sindoor)", en: "Problem", bn: "সমস্যা" },
};

export default function PublicVillagePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { snapOf, lang, alerts, reports, setRole, setVillageId, now, verify, ledger } = useSim();
  const [note, setNote] = useState<string | null>(null);
  const village = villageById(id);

  if (!village) {
    return (
      <main className="mx-auto max-w-xl p-6">
        <Wordmark />
        <h1 className="mt-8 text-[24px]">{L("This village page does not exist")}</h1>
        <p className="mt-2 text-[var(--slate)]">{L("The QR code or link may be wrong. Ask the panchayat office for the correct one.")}</p>
        <Link href="/" className="btn btn-primary mt-4">{L("Go to GramSatya")}</Link>
      </main>
    );
  }

  const bn = lang === "bn";
  const snap = snapOf(village.id);
  const items = summarize(snap);
  const problems = items.filter((i) => i.tone !== "good").length;
  const alert = alerts.find((a) => a.villageIds.includes(village.id) && now - a.ts < 24 * 3_600_000);
  const open = reports.filter((r) => r.villageId === village.id && r.status !== "Resolved");
  const ledgerBroken = !verify.ok && ledger.find((r) => r.i === verify.brokenAt)?.villageId === village.id;

  function goAs(path: string) {
    setRole("citizen");
    setVillageId(village!.id);
    router.push(path);
  }

  return (
    <div className="min-h-dvh">
      <header className="laal-paar bg-[var(--ink)]">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <Wordmark light />
          <LangToggle light />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        <p className="text-[13px] text-[var(--slate)]">{bn ? "সর্বজনীন পাতা, সবাই দেখতে পারেন" : L("Public page. Anyone can see this, no login needed.")}</p>

        <section className="mt-3 flex flex-col items-center gap-5 sm:flex-row sm:items-center" aria-labelledby="vname">
          <Seal score={snap.score} name={village.name} size={176} verified={!ledgerBroken} />
          <div className="text-center sm:text-left">
            <h1 id="vname" className="text-[46px] leading-none">
              {villageName(village)}
            </h1>
            <p className="mt-1 text-[16px] text-[var(--slate)]">{bn ? `${village.name} গ্রাম পঞ্চায়েত` : `${village.nameBn}, Gram Panchayat`}</p>
            <p className="mt-3 text-[20px] font-semibold" style={{ color: problems ? "var(--sindoor)" : "var(--paddy)" }}>
              {problems
                ? bn ? bnDigits(`এখন ${problems}টি পরিষেবায় সমস্যা চলছে`) : `${problems} public service${problems > 1 ? "s have" : " has"} a problem right now`
                : bn ? "সব পরিষেবা ঠিক আছে" : L("All public services are working")}
            </p>
            <p className="mt-1 flex items-center justify-center gap-1.5 text-[13px] text-[var(--slate)] sm:justify-start">
              <span className="live-dot" aria-hidden />{bn ? "সেন্সর থেকে সরাসরি তথ্য" : L("Live from sensors, not from paper forms")}
            </p>
          </div>
        </section>

        {alert && (
          <section className="mt-6 rounded-[10px] border-2 border-[var(--sindoor)] bg-[var(--sindoor-tint)] p-4" aria-labelledby="alert-h" role="alert">
            <h2 id="alert-h" className="text-[15px] text-[var(--sindoor)]">{bn ? "সতর্কবার্তা" : L("Warning")}, {timeAgo(alert.ts)}</h2>
            <p className="mt-1 text-[19px] font-semibold leading-snug" lang="bn">{alert.bn}</p>
            {!bn && <p className="mt-1 text-[15px]">{alert.en}</p>}
            <button className="btn btn-danger mt-3" onClick={() => setNote(speak(bn ? alert.bn : alert.en, bn ? "bn-IN" : "en-IN").note ?? null)}>{bn ? "শুনুন" : L("Listen")}</button>
            {note && <p className="mt-2 text-[12px]">{note}</p>}
          </section>
        )}

        <section className="mt-8 border-y border-[var(--ink)]" aria-label={bn ? "আজকের পরিষেবা" : L("Public services today")}>
          {items.map((it) => (
            <div key={it.key} className="flex items-center gap-4 border-t border-[var(--line)] py-3.5 first:border-t-0">
              <span className="h-3.5 w-3.5 shrink-0 rounded-full" style={{ background: TONE[it.tone].color }} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-[16px] font-semibold">{bn ? it.labelBn : it.label}</p>
                <p className="text-[14px] text-[var(--slate)]">{bn ? it.textBn : it.text}</p>
              </div>
              <span className="text-[13px] font-semibold" style={{ color: TONE[it.tone].color }}>{bn ? TONE[it.tone].bn : TONE[it.tone].en}</span>
            </div>
          ))}
        </section>

        <section className="mt-4 text-[15px]" aria-label="Data check">
          {ledgerBroken ? (
            <p className="font-semibold text-[var(--sindoor)]">{bn ? "এই গ্রামের পুরনো তথ্য বদলানো হয়েছে। তথ্য যাচাই চলছে।" : L("Someone changed this village's past data. It is being checked.")}</p>
          ) : snap.mismatches.length ? (
            <p>
              <b className="text-[var(--sindoor)]">{bn ? "পঞ্চায়েতের ঘোষিত তথ্য সেন্সরের সাথে মেলেনি। " : "The panchayat's own report does not match the sensors. "}</b>
              {snap.mismatches.map((m) => bn
                ? bnDigits(`${INDICATOR_INFO[m.indicator].labelBn}: ঘোষিত ${m.claimed}%, মাপা ${m.measured}%`)
                : `${INDICATOR_INFO[m.indicator].label}: reported ${m.claimed}%, measured ${m.measured}%`).join(bn ? "। " : ". ")}{bn ? "।" : "."}
            </p>
          ) : (
            <p className="text-[var(--paddy)]">{bn ? "পঞ্চায়েতের ঘোষিত তথ্য সেন্সরের সাথে মিলছে।" : L("The panchayat's own report matches what the sensors measure.")}</p>
          )}
        </section>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button className="btn btn-primary !py-3.5 text-[16px]" onClick={() => goAs("/reports")}>{bn ? "সমস্যা জানান" : L("Report a problem")}</button>
          <button className="btn btn-ghost !py-3.5 text-[16px]" onClick={() => goAs("/alerts")}>{bn ? "সতর্কবার্তা ও জরুরি সাহায্য" : L("Alerts and SOS")}</button>
        </div>

        <section className="mt-6" aria-labelledby="open-h">
          <h2 id="open-h" className="text-[24px]">{bn ? bnDigits(`খোলা অভিযোগ: ${open.length}টি`) : `Open complaints: ${open.length}`}</h2>
          <ul className="mt-2">
            {open.slice(0, 4).map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 border-t border-[var(--line)] py-3">
                <div className="min-w-0">
                  <p className="font-medium">{CATEGORY_LABEL[r.category][phraseLang()]}</p>
                  <p className="truncate text-[13px] text-[var(--slate)]">{r.text}</p>
                </div>
                <span className="shrink-0 text-[12px] text-[var(--slate)]">{r.status}, {timeAgo(r.ts)}</span>
              </li>
            ))}
            {open.length === 0 && <li className="text-[var(--slate)]">{bn ? "কোনো খোলা অভিযোগ নেই।" : L("No open complaints.")}</li>}
          </ul>
        </section>

        <footer className="mt-10 border-t border-[var(--line)] pt-4 text-[12px] text-[var(--slate)]">
          {L("GramSatya prototype for the BharatSeva state hackathon. All village data on this page is simulated.")} <Link href="/" className="font-semibold text-[var(--river)] hover:underline">{L("Officer login")}</Link>
        </footer>
      </main>
    </div>
  );
}
