"use client";

import { useRouter } from "next/navigation";
import { useSim } from "@/components/SimProvider";
import { LangToggle, Wordmark } from "@/components/AppShell";
import { Seal } from "@/components/ui";
import type { Role } from "@/lib/types";
import { L } from "@/lib/phrases";

const ROLES: { role: Role; en: string; bn: string; does: string; home: (v: string) => string; village?: string }[] = [
  { role: "panchayat", en: "Panchayat secretary", bn: "পঞ্চায়েত সচিব", does: "Live scorecard, what to fix first, citizen reports, siren alerts.", home: () => "/dashboard", village: "radhaganj" },
  { role: "block", en: "Block officer", bn: "ব্লক আধিকারিক", does: "Every village side by side, over-reporting flagged, ponds audited.", home: () => "/dashboard" },
  { role: "district", en: "District officer", bn: "জেলা আধিকারিক", does: "Rank villages by verified need and split a budget.", home: () => "/funds" },
  { role: "citizen", en: "Villager", bn: "গ্রামবাসী", does: "See your village, report a broken handpump, get flood alerts.", home: (v) => `/v/${v}`, village: "radhaganj" },
];

const FORM_LABEL = { energy: "Streetlights working", water: "Water supply working", sanitation: "Waste bins cleared" } as const;

export default function Landing() {
  const { snapOf, lang } = useSim();
  const router = useRouter();
  const demo = snapOf("radhaganj");
  const bn = lang === "bn";

  // Each role signs in on its own screen
  function enter(r: (typeof ROLES)[number]) {
    router.push(`/login/${r.role}`);
  }

  return (
    <div className="min-h-dvh">
      <div className="laal-paar bg-[var(--ink)] text-[#f6f0e3]">
      <header className="mx-auto flex max-w-[1180px] items-center justify-between px-5 py-3 md:px-6">
        <Wordmark light />
        <LangToggle light />
      </header>

      <div className="mx-auto max-w-[1180px] px-5 md:px-6">
        <section className="grid items-center gap-x-16 gap-y-14 pb-20 pt-8 lg:grid-cols-[1fr_480px] lg:pt-14" aria-labelledby="hero">
          <div>
            <p className="text-[24px] leading-snug text-[#d9c49a] md:text-[30px]" style={{ fontFamily: "var(--font-display)" }} lang="bn">
              যে গ্রামের তথ্য জাল করা যায় না
            </p>
            <h1 id="hero" className="mt-3 text-[46px] leading-[1.04] md:text-[68px]">
              {L("A village whose data cannot be faked.")}
            </h1>
            <p className="mt-6 max-w-[33rem] text-[18px] leading-relaxed text-[#cfd3e2]">
              {bn
                ? "পঞ্চায়েত কাগজে যা ঘোষণা করে, সস্তা সোলার সেন্সর তা প্রতি মুহূর্তে যাচাই করে। মিথ্যা তথ্য ধরা পড়ে, পুরনো তথ্য বদলানো যায় না।"
                : L("Panchayats are ranked on numbers they report themselves. GramSatya checks those numbers against low-cost solar sensors, every few seconds, and keeps a record nobody can quietly rewrite.")}
            </p>
            <button className="btn mt-8 !min-h-[52px] bg-[#f6f0e3] !px-6 text-[16px] text-[var(--ink)] hover:bg-white" onClick={() => enter(ROLES[0])}>{L("See Radhaganj's scorecard")}</button>
          </div>

          {/* The memorable moment: a self-declaration, stamped over by what the sensors measured */}
          <figure className="relative mx-auto w-full max-w-[480px]">
            <div className="rounded-[4px] bg-[#fffcf5] px-7 pb-14 pt-6 text-[var(--ink)] shadow-[0_20px_40px_-20px_rgba(0,0,0,0.6)]">
              <div className="flex items-baseline justify-between gap-3 border-b-2 border-[var(--ink)] pb-2">
                <p className="text-[15px] font-semibold">{L("Monthly self-declaration")}</p>
                <p className="text-[13px] text-[var(--slate)]">{demo.village.name} GP</p>
              </div>
              <table className="mt-1 w-full text-[15px]">
                <caption className="sr-only">What the panchayat declared, and what sensors measured</caption>
                <thead>
                  <tr className="text-left text-[12px] text-[var(--slate)]">
                    <th className="py-2 font-medium"><span className="sr-only">{L("Indicator")}</span></th>
                    <th className="py-2 text-right font-medium">{L("Declared")}</th>
                    <th className="py-2 text-right font-medium">{L("Sensors")}</th>
                  </tr>
                </thead>
                <tbody>
                  {(["energy", "water", "sanitation"] as const).map((k) => (
                    <tr key={k} className="h-11 border-b border-dashed border-[#e2d6bf]">
                      <td>{L(FORM_LABEL[k])}</td>
                      <td className="num text-right"><span className="line-through decoration-[var(--sindoor)] decoration-2">{demo.declared[k]}%</span></td>
                      <td className="num text-right text-[17px] font-bold text-[var(--sindoor)]">{demo.indicators[k]}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-7 w-48 border-t border-[var(--ink)] pt-1 text-[12px] text-[var(--slate)]">Secretary, {demo.village.name}</div>
            </div>
            <div className="absolute -bottom-10 right-0 sm:-right-8">
              <Seal score={demo.score} name={demo.village.name} size={164} />
            </div>
            <figcaption className="mt-14 text-[13px] text-[#cfd3e2]">{L("Live demo data. The sensor figures update every 4 seconds.")}</figcaption>
          </figure>
        </section>
      </div>
      </div>

      <main className="mx-auto max-w-[1180px] px-5 md:px-6">

        <section className="py-14" aria-labelledby="enter">
          <h2 id="enter" className="text-[32px]">{bn ? "কোন চোখে দেখবেন?" : L("Open GramSatya as")}</h2>
          <ul className="mt-4">
            {ROLES.map((r) => (
              <li key={r.role} className="border-t border-[var(--line)] last:border-b">
                <button onClick={() => enter(r)} className="group grid w-full grid-cols-1 items-baseline gap-x-8 gap-y-1 py-4 text-left md:grid-cols-[280px_1fr_auto]">
                  <span className="text-[19px] font-semibold group-hover:underline">
                    {L(r.en)} <span className="ml-1 text-[15px] font-normal text-[var(--slate)]" lang="bn">{r.bn}</span>
                  </span>
                  <span className="text-[15px] text-[var(--slate)]">{L(r.does)}</span>
                  <span className="hidden text-[15px] font-semibold text-[var(--river)] md:block">{L("Open")}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="mx-auto max-w-[1180px] px-5 pb-10 text-[13px] text-[var(--slate)] md:px-6">
        <span className="mr-6 inline-flex gap-5 text-[14px] font-semibold">
          <a href="/method" className="text-[var(--river)] hover:underline">{L("How the score works")}</a>
          <a href="/trust" className="text-[var(--river)] hover:underline">{L("Trust and limits")}</a>
          <a href="/pilot" className="text-[var(--river)] hover:underline">{L("Pilot plan")}</a>
        </span>
        {L("Prototype for the BharatSeva state hackathon. Village names, sensors and figures are simulated.")}
      </footer>
    </div>
  );
}
