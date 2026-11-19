"use client";

import { useEffect, useState } from "react";
import { useSim } from "./SimProvider";
import { Insight, ruleInsights } from "@/lib/insights";
import { bnDigits } from "@/lib/summary";
import { speak } from "@/lib/speak";
import type { VillageSnapshot } from "@/lib/sim";
import { L } from "@/lib/phrases";

const PRIORITY = {
  high: { color: "var(--sindoor)", en: "Urgent", bn: "জরুরি" },
  medium: { color: "#7d5208", en: "This week", bn: "এই সপ্তাহে" },
  low: { color: "var(--slate)", en: "Plan", bn: "পরিকল্পনা" },
};

export default function InsightsPanel({ snap }: { snap: VillageSnapshot }) {
  const { reports, lang } = useSim();
  const [provider, setProvider] = useState<string>("rules");
  const [ai, setAi] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const bn = lang === "bn";
  const openReports = reports.filter((r) => r.villageId === snap.village.id && r.status !== "Resolved").length;

  useEffect(() => {
    fetch("/api/insights").then((r) => r.json()).then((d) => setProvider(d.provider ?? "rules")).catch(() => setProvider("rules"));
  }, []);
  useEffect(() => { setAi(null); }, [snap.village.id]);

  const shown = ai ?? ruleInsights({ snap, openReports });

  async function generate() {
    setLoading(true);
    setNote(null);
    try {
      const res = await fetch("/api/insights", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ snap, openReports }) });
      setAi((await res.json()) as Insight);
    } catch {
      setNote("Could not reach the AI service, so the built-in plan is shown.");
    } finally {
      setLoading(false);
    }
  }

  function listen() {
    const text = bn ? [shown.summaryBn, ...shown.actions.map((a) => a.bn)].join("। ") : [shown.summaryEn, ...shown.actions.map((a) => a.en)].join(". ");
    setNote(speak(text, bn ? "bn-IN" : "en-IN").note ?? null);
  }

  return (
    <section aria-labelledby="fix-title">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="fix-title" className="text-[24px]">{bn ? "আগে যা সারাতে হবে" : L("What to fix first")}</h2>
        <div className="flex gap-4 text-[14px] font-semibold text-[var(--river)]">
          <button onClick={listen} className="hover:underline">{bn ? "শুনুন" : L("Listen")}</button>
          {provider !== "rules" && <button onClick={generate} disabled={loading} className="hover:underline disabled:opacity-50">{loading ? "Asking…" : `Ask AI (${provider})`}</button>}
        </div>
      </div>
      <p className="mt-2 text-[15px] leading-relaxed text-[var(--slate)]">{bn ? bnDigits(shown.summaryBn) : shown.summaryEn}</p>
      {shown.actions.length === 0 ? (
        <p className="mt-4 font-semibold text-[var(--paddy)]">{bn ? "এখন কোনো কাজ বাকি নেই।" : L("Nothing needs fixing right now.")}</p>
      ) : (
        <ol className="mt-4">
          {shown.actions.map((a, i) => (
            <li key={i} className="grid grid-cols-[28px_1fr] gap-x-2 border-t border-[var(--line)] py-3">
              <span className="num pt-px text-[15px] font-bold text-[var(--slate)]">{i + 1}</span>
              <span className="text-[15px] leading-snug">
                <span className="mr-2 text-[13px] font-semibold" style={{ color: PRIORITY[a.priority].color }}>{bn ? PRIORITY[a.priority].bn : PRIORITY[a.priority].en}</span>
                {bn ? bnDigits(a.bn) : a.en}
              </span>
            </li>
          ))}
        </ol>
      )}
      <p className="mt-2 text-[12px] text-[var(--slate)]">
        From {ai ? shown.source : "built-in rules, updated live"}.
        {note && <span className="ml-1 text-[#7d5208]">{note}</span>}
      </p>
    </section>
  );
}
