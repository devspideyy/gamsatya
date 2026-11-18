"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSim } from "./SimProvider";
import { VILLAGES } from "@/lib/data";
import type { DictKey } from "@/lib/i18n";
import type { Role } from "@/lib/types";

/** One stroke icon family (1.8px, round joins) used for every nav item */
const ICON: Record<string, string> = {
  dashboard: "M4 19V9l8-5 8 5v10M9 19v-6h6v6",
  villages: "M3 20h18M5 20V10l4-3 4 3v10M13 20v-7l3-2 3 2v7",
  reports: "M5 4h14v11H10l-5 4z M9 9h6",
  alerts: "M12 4a5 5 0 0 0-5 5v3.5L5.5 15h13L17 12.5V9a5 5 0 0 0-5-5zM10 18a2 2 0 0 0 4 0",
  assets: "M12 3.5c3 4 5.5 7 5.5 10.2a5.5 5.5 0 0 1-11 0C6.5 10.5 9 7.5 12 3.5z",
  ledger: "M6 4h9l3 3v13H6z M9 10h6M9 14h6",
  devices: "M8 8h8v8H8zM10 4v4M14 4v4M10 16v4M14 16v4M4 10h4M4 14h4M16 10h4M16 14h4",
  funds: "M4 20h16M6 17v-5M10 17V8M14 17v-7M18 17V5",
  myVillage: "M4 19V9l8-5 8 5v10M9 19v-6h6v6",
  report: "M5 4h14v11H10l-5 4z M9 9h6",
};

const NAV: Record<Role, { key: DictKey; icon: string; href: (v: string) => string }[]> = {
  citizen: [
    { key: "myVillage", icon: "myVillage", href: (v) => `/v/${v}` },
    { key: "report", icon: "report", href: () => "/reports" },
    { key: "alerts", icon: "alerts", href: () => "/alerts" },
  ],
  panchayat: [
    { key: "dashboard", icon: "dashboard", href: () => "/dashboard" },
    { key: "reports", icon: "reports", href: () => "/reports" },
    { key: "alerts", icon: "alerts", href: () => "/alerts" },
    { key: "assets", icon: "assets", href: () => "/assets" },
    { key: "ledger", icon: "ledger", href: () => "/ledger" },
    { key: "devices", icon: "devices", href: () => "/devices" },
  ],
  block: [
    { key: "villages", icon: "villages", href: () => "/dashboard" },
    { key: "assets", icon: "assets", href: () => "/assets" },
    { key: "reports", icon: "reports", href: () => "/reports" },
    { key: "alerts", icon: "alerts", href: () => "/alerts" },
    { key: "ledger", icon: "ledger", href: () => "/ledger" },
  ],
  district: [
    { key: "funds", icon: "funds", href: () => "/funds" },
    { key: "villages", icon: "villages", href: () => "/dashboard" },
    { key: "assets", icon: "assets", href: () => "/assets" },
    { key: "alerts", icon: "alerts", href: () => "/alerts" },
  ],
};

export function NavIcon({ name, size = 18 }: { name: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" aria-hidden>
      <path d={ICON[name]} />
    </svg>
  );
}

/** Brand mark: a seal with an alpana petal ring and a tick */
export function Mark({ size = 30, light = false }: { size?: number; light?: boolean }) {
  const c = light ? "#f6f0e3" : "var(--ink)";
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden>
      {Array.from({ length: 12 }, (_, i) => (
        <ellipse key={i} cx="20" cy="3.6" rx="1.7" ry="3" fill="var(--brass)" transform={`rotate(${i * 30} 20 20)`} opacity="0.9" />
      ))}
      <circle cx="20" cy="20" r="13.5" fill="none" stroke={c} strokeWidth="2.2" />
      <path d="M14.5 20.5l3.8 3.8 7.5-8.3" fill="none" stroke={light ? "#e9c46a" : "var(--sindoor)"} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Wordmark({ light = false }: { light?: boolean; compact?: boolean }) {
  return (
    <Link href="/" className="flex min-h-[44px] items-center gap-2.5" aria-label="GramSatya home">
      <Mark light={light} />
      <span className="leading-none">
        <span className="block text-[20px]" style={{ fontFamily: "var(--font-display)", color: light ? "#f6f0e3" : "var(--ink)" }}>GramSatya</span>
        <span className="block text-[12px] tracking-wide" style={{ fontFamily: "var(--font-display)", color: light ? "#d9c49a" : "var(--brass)" }} lang="bn">গ্রামসত্য</span>
      </span>
    </Link>
  );
}

export function LangToggle({ light = false }: { light?: boolean }) {
  const { lang, setLang } = useSim();
  return (
    <button
      onClick={() => setLang(lang === "en" ? "bn" : "en")}
      className={`min-h-[44px] rounded-md px-2.5 text-[15px] font-semibold ${light ? "text-[#f6f0e3] hover:bg-white/10" : "text-[var(--ink)] hover:bg-[var(--line-soft)]"}`}
      aria-label={lang === "en" ? "বাংলায় দেখুন" : "Switch to English"}
      lang={lang === "en" ? "bn" : "en"}
    >
      {lang === "en" ? "বাংলা" : "English"}
    </button>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { role, setRole, villageId, setVillageId, lang, t, online } = useSim();
  const path = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!role) router.replace("/");
  }, [role, router]);
  if (!role) return null;

  const items = NAV[role];
  const showVillage = role === "panchayat" || role === "citizen";
  const isActive = (href: string, key: DictKey) =>
    path === href || path.startsWith(href + "/") || (key === "villages" && path.startsWith("/village/"));

  return (
    <div className="min-h-dvh">
      <a href="#main" className="skip-link">Skip to content</a>
      <header className="laal-paar sticky top-0 z-[600] bg-[var(--ink)] text-[#f6f0e3]">
        <div className="mx-auto flex max-w-[1180px] items-center gap-6 px-4 md:px-6">
          <Wordmark light />
          <nav className="hidden items-stretch gap-0.5 lg:flex" aria-label="Main">
            {items.map((it) => {
              const href = it.href(villageId);
              const active = isActive(href, it.key);
              return (
                <Link key={it.key} href={href} aria-current={active ? "page" : undefined}
                  className={`flex min-h-[60px] items-center gap-2 whitespace-nowrap border-b-[3px] px-2.5 text-[15px] transition-colors ${active ? "border-[#e9c46a] text-white" : "border-transparent text-[#cfd3e2] hover:text-white"}`}>
                  <NavIcon name={it.icon} /> {t(it.key)}
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-1">
            {showVillage && (
              <select aria-label="Village" value={villageId} onChange={(e) => setVillageId(e.target.value)}
                className="min-h-[44px] w-[136px] rounded-md bg-transparent px-1.5 text-[15px] font-semibold text-[#f6f0e3] hover:bg-white/10 md:w-[180px] [&>option]:bg-[var(--card)] [&>option]:text-[var(--ink)]">
                {VILLAGES.map((v) => <option key={v.id} value={v.id}>{lang === "bn" ? v.nameBn : v.name}</option>)}
              </select>
            )}
            <LangToggle light />
            <button className="hidden min-h-[44px] whitespace-nowrap rounded-md px-2.5 text-[14px] text-[#cfd3e2] hover:bg-white/10 hover:text-white xl:block"
              onClick={() => { setRole(null); router.push("/"); }} title={t("switchRole")}>
              {t(role)}
            </button>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 lg:hidden" aria-label="Main">
          {items.map((it) => {
            const href = it.href(villageId);
            const active = isActive(href, it.key);
            return (
              <Link key={it.key} href={href} aria-current={active ? "page" : undefined}
                className={`flex min-h-[44px] shrink-0 items-center gap-1.5 border-b-[3px] px-2.5 text-[14px] ${active ? "border-[#e9c46a] text-white" : "border-transparent text-[#cfd3e2]"}`}>
                <NavIcon name={it.icon} size={16} /> {t(it.key)}
              </Link>
            );
          })}
          <button className="flex min-h-[44px] shrink-0 items-center px-2.5 text-[14px] text-[#e9c46a]" onClick={() => { setRole(null); router.push("/"); }}>{t("switchRole")}</button>
        </nav>
      </header>
      {!online && <div className="bg-[var(--turmeric-tint)] px-4 py-2 text-center text-[15px] text-[#6b4606]" role="status">{t("offline")}</div>}
      <main id="main" className="mx-auto w-full max-w-[1180px] px-4 pb-20 pt-8 md:px-6 md:pt-10">{children}</main>
    </div>
  );
}
