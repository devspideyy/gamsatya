"use client";

import { useSim } from "./SimProvider";
import { villageById } from "@/lib/data";
import { downloadCsv, today } from "@/lib/csv";
import type { Incident, Stage } from "@/lib/types";
import { L } from "@/lib/phrases";

const STAGES: { key: Stage; en: string; bn: string }[] = [
  { key: "watch", en: "Watch", bn: "নজর" },
  { key: "warning", en: "Warning", bn: "সতর্কতা" },
  { key: "emergency", en: "Emergency", bn: "জরুরি" },
  { key: "resolved", en: "Resolved", bn: "সমাধান" },
];

const clock = (ts?: number) => (ts ? new Date(ts).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", second: "2-digit" }) : "");
const secs = (a?: number, b?: number) => (a && b ? `${Math.max(0, Math.round((b - a) / 1000))} s` : "–");

function Stepper({ inc }: { inc: Incident }) {
  const reached = STAGES.filter((s) => inc.stages[s.key]).length;
  return (
    <ol className="grid grid-cols-4 gap-1.5" aria-label="Incident stages">
      {STAGES.map((s, i) => {
        const at = inc.stages[s.key];
        const color = !at ? "var(--line)" : s.key === "resolved" ? "var(--paddy)" : s.key === "emergency" ? "var(--sindoor)" : s.key === "warning" ? "#c4840f" : "var(--river)";
        return (
          <li key={s.key} className="border-t-[4px] pt-1.5" style={{ borderColor: color }} aria-current={i === reached - 1 ? "step" : undefined}>
            <p className="text-[14px] font-semibold" style={{ color: at ? "var(--ink)" : "var(--slate)" }}>{s.en} <span className="font-normal text-[var(--slate)]" lang="bn">{s.bn}</span></p>
            <p className="num text-[12px] text-[var(--slate)]">{at ? clock(at) : "Not reached"}</p>
          </li>
        );
      })}
    </ol>
  );
}

export default function IncidentBoard({ villageFilter }: { villageFilter?: string }) {
  const { incidents } = useSim();
  const list = villageFilter ? incidents.filter((i) => i.villageId === villageFilter) : incidents;

  function exportLog() {
    downloadCsv(`gramsatya-incident-log-${today()}.csv`, [
      ["Incident", "Type", "Village", "Watch", "Warning", "Emergency", "Resolved", "Watch to emergency", "Responder", "Notes"],
      ...list.map((i) => [i.id, i.kind, villageById(i.villageId)?.name, clock(i.stages.watch), clock(i.stages.warning), clock(i.stages.emergency), clock(i.stages.resolved),
        secs(i.stages.watch, i.stages.emergency), i.responder?.team ?? "", i.notes.map((n) => `${clock(n.ts)} ${n.text}`).join(" | ")]),
    ]);
  }

  return (
    <section className="panel mb-8 p-5 md:p-7" aria-labelledby="inc-h">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="inc-h" className="text-[26px]">{L("Incidents")}</h2>
        {list.length > 0 && <button className="btn btn-ghost" onClick={exportLog}>{L("Download incident log (CSV)")}</button>}
      </div>
      {list.length === 0 ? (
        <p className="mt-2 text-[var(--slate)]">{L("No incidents. Open the demo console and run Flood or Fire to see the four stages fill in.")}</p>
      ) : (
        <ul className="mt-2">
          {list.slice(0, 4).map((inc) => (
            <li key={inc.id} className="border-t border-[var(--line)] py-4 first:border-0">
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-[18px] font-semibold">{inc.kind} in {villageById(inc.villageId)?.name}</p>
                <p className="text-[14px] text-[var(--slate)]">
                  {L("Watch to emergency")} <b className="num text-[var(--ink)]">{secs(inc.stages.watch, inc.stages.emergency)}</b>
                  {inc.responder && <>, {inc.responder.team} assigned</>}
                </p>
              </div>
              <Stepper inc={inc} />
              <ul className="mt-3 space-y-0.5 text-[14px] text-[var(--slate)]">
                {[...inc.notes].reverse().slice(0, 3).map((n, i) => <li key={i}><span className="num">{clock(n.ts)}</span> {n.text}</li>)}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
