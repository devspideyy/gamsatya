"use client";

import Link from "next/link";
import { LangToggle, SiteFooter, Wordmark } from "@/components/AppShell";
import { useSim } from "@/components/SimProvider";
import { L } from "@/lib/phrases";

export default function InfoLayout({ children }: { children: React.ReactNode }) {
  const { role } = useSim();
  return (
    <div className="min-h-dvh">
      <a href="#main" className="skip-link">{L("Skip to content")}</a>
      <header className="laal-paar bg-[var(--ink)]">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-4 px-4 py-2 md:px-6">
          <Wordmark light />
          <div className="flex items-center gap-2">
            <Link href={role ? "/dashboard" : "/"} className="min-h-[44px] content-center px-2 text-[15px] text-[#cfd3e2] hover:text-white">{role ? "Back to the app" : "Home"}</Link>
            <LangToggle light />
          </div>
        </div>
      </header>
      <main id="main" className="mx-auto w-full max-w-[920px] px-4 pb-12 pt-8 md:px-6 md:pt-10">{children}</main>
      <SiteFooter />
    </div>
  );
}
