"use client";

import { useRef, useState } from "react";
import { useSim } from "@/components/SimProvider";
import { PageHeader, timeAgo } from "@/components/ui";
import VoiceInput from "@/components/VoiceInput";
import { SENSORS, VILLAGES, villageById } from "@/lib/data";
import { bnDigits } from "@/lib/summary";
import { CATEGORY_LABEL, CitizenReport, ReportCategory } from "@/lib/types";
import { L, phraseLang } from "@/lib/phrases";

const CATS: ReportCategory[] = ["handpump", "streetlight", "bin", "tank", "other"];
const STATUSES: CitizenReport["status"][] = ["Open", "In progress", "Resolved"];

function checkText(r: CitizenReport, bn: boolean) {
  const label = SENSORS.find((s) => s.id === r.matchedSensor)?.label;
  if (r.check === "confirmed") return bn ? `সেন্সর নিশ্চিত করেছে${label ? `: ${label}` : ""}` : `Sensor confirms${label ? `: ${label} reports a fault` : ""}`;
  if (r.check === "not-confirmed") return bn ? "সেন্সরে ঠিক দেখাচ্ছে, সরেজমিনে দেখা হবে" : L("Sensors show this working, needs a site visit");
  return bn ? "এই সমস্যার সেন্সর নেই, সরেজমিনে দেখা হবে" : L("No sensor covers this, needs a site visit");
}

function CheckChip({ r, bn }: { r: CitizenReport; bn: boolean }) {
  if (r.status === "Resolved") return <span className="text-[13px] font-semibold text-[var(--paddy)]">{bn ? "সমাধান হয়েছে" : L("Fixed and closed")}</span>;
  return <span className="text-[13px] font-semibold" style={{ color: r.check === "confirmed" ? "var(--sindoor)" : "var(--slate)" }}>{checkText(r, bn)}</span>;
}

async function compress(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = url;
    });
    const scale = Math.min(1, 640 / Math.max(img.width, img.height));
    const c = document.createElement("canvas");
    c.width = Math.round(img.width * scale);
    c.height = Math.round(img.height * scale);
    c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", 0.6);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function Progress({ status }: { status: CitizenReport["status"] }) {
  const idx = STATUSES.indexOf(status);
  return (
    <ol className="flex items-center gap-1.5 text-[11px] text-[var(--slate)]" aria-label={`Status: ${status}`}>
      {STATUSES.map((s, i) => (
        <li key={s} className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ background: i <= idx ? (idx === 2 ? "var(--paddy)" : "var(--ink)") : "#e2d6bf" }} />
          <span className={i === idx ? "font-semibold text-[var(--ink)]" : ""}>{s}</span>
          {i < 2 && <span className="h-px w-3 bg-[#e2d6bf]" />}
        </li>
      ))}
    </ol>
  );
}

function CitizenReports() {
  const { villageId, addReport, reports, lang, online } = useSim();
  const bn = lang === "bn";
  const v = villageById(villageId)!;
  const [cat, setCat] = useState<ReportCategory | null>(null);
  const [text, setText] = useState("");
  const [audio, setAudio] = useState<string | undefined>();
  const [photo, setPhoto] = useState<string | undefined>();
  const [loc, setLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [locNote, setLocNote] = useState<string | null>(null);
  const [done, setDone] = useState<CitizenReport | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const mine = reports.filter((r) => r.villageId === villageId).sort((a, b) => b.ts - a.ts);

  function locate() {
    if (!navigator.geolocation) { setLocNote("This phone cannot share location."); return; }
    setLocNote(bn ? "অবস্থান খোঁজা হচ্ছে…" : L("Finding your location…"));
    navigator.geolocation.getCurrentPosition(
      (p) => { setLoc({ lat: p.coords.latitude, lng: p.coords.longitude }); setLocNote(null); },
      () => { setLoc({ lat: v.lat + 0.002, lng: v.lng - 0.001 }); setLocNote(bn ? "অবস্থান পাওয়া যায়নি, গ্রামের কেন্দ্র ব্যবহার করা হল।" : L("Location was blocked, so the village centre is used instead.")); },
      { timeout: 8000 },
    );
  }

  function submit() {
    if (!cat) return;
    const r = addReport({ villageId, category: cat, text: text.trim() || (audio ? L("Voice note") : CATEGORY_LABEL[cat].en), photo, audio, lat: loc?.lat, lng: loc?.lng });
    setDone(r);
    setCat(null); setText(""); setPhoto(undefined); setLoc(null); setAudio(undefined);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="space-y-5">
      <PageHeader title={bn ? "সমস্যা জানান" : L("Report a problem")} lede={bn ? `${v.nameBn}-এ কিছু খারাপ হলে জানান। কাছের সেন্সর দিয়ে সঙ্গে সঙ্গে যাচাই হবে।` : `Tell the panchayat what is broken in ${v.name}. Your report is checked against the nearest sensors straight away.`} />
      <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
        <section className="rounded-lg bg-white p-5" aria-labelledby="form-title">
          <h2 id="form-title" className="mb-3 text-[24px]">{bn ? "কী সমস্যা?" : L("What is the problem?")}</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" role="radiogroup" aria-label={L("Problem type")}>
            {CATS.map((c) => (
              <button key={c} role="radio" aria-checked={cat === c} onClick={() => setCat(c)}
                className={`rounded-lg border p-3 text-left ${cat === c ? "border-[var(--ink)] bg-[var(--ink)] text-white" : "border-[var(--line)] bg-white hover:bg-[#f8f2e6]"}`}>
                <span className="block text-[15px] font-semibold" lang="bn">{CATEGORY_LABEL[c].bn}</span>
                <span className="block text-[12px] opacity-80">{CATEGORY_LABEL[c].en}</span>
              </button>
            ))}
          </div>
          <VoiceInput lang={lang} onText={setText} onAudio={setAudio} onCategory={(c) => setCat(c)} />
          <label htmlFor="desc" className="mt-4 block text-[13px] text-[var(--slate)]">{bn ? "বিস্তারিত (ঐচ্ছিক)" : L("Details (optional)")}</label>
          <textarea id="desc" className="field mt-1" rows={3} value={text} onChange={(e) => setText(e.target.value)}
            placeholder={bn ? "যেমন: স্কুলের পাশের নলকূপে দুই সপ্তাহ জল নেই" : "For example: the handpump next to the school has had no water for two weeks"} />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <label className="btn btn-ghost cursor-pointer">
              {photo ? (bn ? "ছবি বদলান" : L("Change photo")) : (bn ? "ছবি তুলুন" : L("Add a photo"))}
              <input ref={fileRef} type="file" accept="image/*" capture="environment" className="sr-only"
                onChange={async (e) => { const f = e.target.files?.[0]; if (f) setPhoto(await compress(f)); }} />
            </label>
            <button className="btn btn-ghost" onClick={locate}>{loc ? (bn ? "অবস্থান যোগ হয়েছে" : L("Location added")) : (bn ? "আমার অবস্থান যোগ করুন" : L("Add my location"))}</button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {photo && <img src={photo} alt="Photo you added" className="h-12 w-12 rounded-md border border-[var(--line)] object-cover" />}
          </div>
          {locNote && <p className="mt-2 text-[12px] text-[var(--slate)]">{locNote}</p>}
          <button className="btn btn-primary mt-4 w-full !py-3 text-[16px]" disabled={!cat} onClick={submit}>
            {bn ? "অভিযোগ পাঠান" : L("Send report")}
          </button>
          {!cat && <p className="mt-2 text-center text-[12px] text-[var(--slate)]">{bn ? "আগে সমস্যার ধরন বেছে নিন" : L("Pick the type of problem first")}</p>}
          {done && (
            <div className={`mt-4 rounded-lg p-3 text-[14px] ${done.check === "confirmed" ? "bg-[var(--sindoor-tint)]" : "bg-[#f1eadc]"}`} role="status">
              <p className="font-semibold">
                {done.savedOffline || !online
                  ? (bn ? "অভিযোগ এই ফোনে জমা আছে, অনলাইন হলে পাঠানো হবে।" : L("Report saved on this phone. It will sync when you are back online."))
                  : (bn ? "অভিযোগ পঞ্চায়েতে পাঠানো হয়েছে।" : L("Report sent to the panchayat."))}
              </p>
              <p className="mt-1">{checkText(done, bn)}</p>
            </div>
          )}
        </section>

        <section aria-labelledby="mine-title">
          <h2 id="mine-title" className="mb-1 text-[24px]">{bn ? bnDigits(`${v.nameBn}-এর অভিযোগ (${mine.length})`) : `Reports from ${v.name} (${mine.length})`}</h2>
          <ul>
            {mine.map((r) => (
              <li key={r.id} className="border-t border-[var(--line)] py-4 first:border-t-0">
                <div className="flex gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {r.photo && <img src={r.photo} alt="" className="h-14 w-14 shrink-0 rounded-md object-cover" />}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="font-semibold">{CATEGORY_LABEL[r.category][phraseLang()]}</p>
                      <span className="text-[12px] text-[var(--slate)]">{timeAgo(r.ts)}</span>
                    </div>
                    <p className="text-[14px] text-[var(--slate)]">{r.text}</p>
                    {r.audio && <audio controls src={r.audio} className="mt-1 h-9 max-w-full" aria-label={L("Voice note")} />}
                    <div className="mt-2 flex flex-wrap items-center gap-2"><CheckChip r={r} bn={bn} /></div>
                    <div className="mt-2"><Progress status={r.status} /></div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function OfficerReports() {
  const { reports, setReportStatus, role, villageId, lang } = useSim();
  const bn = lang === "bn";
  const own = role === "panchayat";
  const [status, setStatus] = useState<"All" | CitizenReport["status"]>("All");
  const [check, setCheck] = useState<"All" | "confirmed" | "other">("All");
  const [village, setVillage] = useState<string>("All");

  const scope = (own ? reports.filter((r) => r.villageId === villageId) : reports).slice().sort((a, b) => b.ts - a.ts);
  const rows = scope.filter((r) =>
    (status === "All" || r.status === status) &&
    (check === "All" || (check === "confirmed" ? r.check === "confirmed" : r.check !== "confirmed")) &&
    (own || village === "All" || r.villageId === village));
  const open = scope.filter((r) => r.status !== "Resolved");
  const confirmed = open.filter((r) => r.check === "confirmed").length;
  const resolvedPct = scope.length ? Math.round((100 * scope.filter((r) => r.status === "Resolved").length) / scope.length) : 0;

  return (
    <div className="space-y-5">
      <PageHeader
        title={L("Citizen reports")}
        lede={`${open.length} open, ${confirmed} of them confirmed by sensors. ${resolvedPct}% of all reports are resolved. Resolving reports raises the village's responsiveness score.`}
      />
      <div className="flex flex-wrap items-end gap-3 pb-2">
        <label className="text-[13px] text-[var(--slate)]">{L("Status")}
          <select className="field mt-1 !py-1.5" value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
            <option>{L("All")}</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
        <label className="text-[13px] text-[var(--slate)]">{L("Sensor check")}
          <select className="field mt-1 !py-1.5" value={check} onChange={(e) => setCheck(e.target.value as typeof check)}>
            <option value="All">{L("All")}</option><option value="confirmed">{L("Confirmed by sensor")}</option><option value="other">{L("Needs a site visit")}</option>
          </select>
        </label>
        {!own && (
          <label className="text-[13px] text-[var(--slate)]">{L("Village")}
            <select className="field mt-1 !py-1.5" value={village} onChange={(e) => setVillage(e.target.value)}>
              <option value="All">{L("All villages")}</option>{VILLAGES.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </label>
        )}
        <span className="ml-auto text-[13px] text-[var(--slate)]">{rows.length} shown</span>
      </div>

      <ul>
        {rows.length === 0 && <li className="border-t border-[var(--line)] py-5 text-[var(--slate)]">{L("No reports match these filters.")}</li>}
        {rows.map((r) => (
          <li key={r.id} className="border-t border-[var(--line)] py-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {r.photo && <img src={r.photo} alt="Photo from the villager" className="h-20 w-20 shrink-0 rounded-md object-cover" />}
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{CATEGORY_LABEL[r.category][phraseLang()]} <span className="font-normal text-[var(--slate)]">in {villageById(r.villageId)?.name}, {timeAgo(r.ts)}</span></p>
                <p className="mt-0.5 text-[14px]">{r.text}</p>
                {r.audio && <audio controls src={r.audio} className="mt-1 h-9 max-w-full" aria-label={L("Voice note")} />}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <CheckChip r={r} bn={bn} />
                  {r.lat && r.lng && (
                    <a className="text-[13px] font-semibold text-[var(--river)] hover:underline" target="_blank" rel="noreferrer"
                      href={`https://www.openstreetmap.org/?mlat=${r.lat}&mlon=${r.lng}#map=17/${r.lat}/${r.lng}`}>{L("See location")}</a>
                  )}
                </div>
              </div>
              <label className="shrink-0 text-[13px] text-[var(--slate)]">{L("Status")}
                <select className="field mt-1 block !w-36 !py-1.5" value={r.status} onChange={(e) => setReportStatus(r.id, e.target.value as CitizenReport["status"])}>
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </label>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ReportsPage() {
  const { role } = useSim();
  return role === "citizen" ? <CitizenReports /> : <OfficerReports />;
}
