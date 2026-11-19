"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useSim } from "@/components/SimProvider";
import { LangToggle, Mark, NavIcon, Wordmark } from "@/components/AppShell";
import { VILLAGES } from "@/lib/data";
import { L, villageName } from "@/lib/phrases";
import type { Role } from "@/lib/types";

const PASSWORD = "demo1234";
const gpCode = (id: string) => `WB-GP-${id.replace(/-/g, "").slice(0, 6).toUpperCase()}`;

const ROLE_INFO: Record<Role, { title: string; bn: string; intro: string; icon: string; home: (v: string) => string }> = {
  panchayat: { title: "Panchayat secretary", bn: "পঞ্চায়েত সচিব", intro: "For the Gram Panchayat office. Sign in with your panchayat code.", icon: "dashboard", home: () => "/dashboard" },
  block: { title: "Block officer", bn: "ব্লক আধিকারিক", intro: "For the Block Development Office. Sign in with your employee ID.", icon: "villages", home: () => "/dashboard" },
  district: { title: "District officer", bn: "জেলা আধিকারিক", intro: "For the District Magistrate's office. Sign in with your employee ID.", icon: "funds", home: () => "/funds" },
  citizen: { title: "Villager", bn: "গ্রামবাসী", intro: "For villagers. Sign in with your mobile number and a one-time code.", icon: "myVillage", home: (v) => `/v/${v}` },
};
const DEMO_ID: Partial<Record<Role, string>> = { block: "BDO-SCB-0142", district: "DM-S24P-0007" };

export default function LoginPage() {
  const { role: param } = useParams<{ role: string }>();
  const router = useRouter();
  const { setRole, setVillageId, lang } = useSim();
  const role = (Object.keys(ROLE_INFO).includes(param) ? param : "panchayat") as Role;
  const info = ROLE_INFO[role];

  const [village, setVillage] = useState("radhaganj");
  const [userId, setUserId] = useState(role === "panchayat" ? gpCode("radhaganj") : DEMO_ID[role] ?? "");
  const [password, setPassword] = useState(PASSWORD);
  const [phone, setPhone] = useState("98300 12345");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function finish(v: string) {
    setBusy(true);
    setRole(role);
    setVillageId(v);
    setTimeout(() => router.push(info.home(v)), 350);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (role === "citizen") {
      if (!otpSent) { setOtpSent(true); return; }
      if (otp.trim() !== "1234") { setError(L("Wrong details. Use the demo login shown below.")); return; }
      return finish(village);
    }
    if (role === "panchayat") {
      const match = VILLAGES.find((v) => gpCode(v.id) === userId.trim().toUpperCase());
      if (!match || password !== PASSWORD) { setError(L("Wrong details. Use the demo login shown below.")); return; }
      return finish(match.id);
    }
    if (userId.trim().toUpperCase() !== DEMO_ID[role] || password !== PASSWORD) { setError(L("Wrong details. Use the demo login shown below.")); return; }
    finish("radhaganj");
  }

  return (
    <div className="min-h-dvh">
      <header className="laal-paar bg-[var(--ink)]">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between px-4 py-2 md:px-6">
          <Wordmark light />
          <LangToggle light />
        </div>
      </header>

      <main className="mx-auto grid max-w-[1000px] gap-10 px-4 py-10 md:grid-cols-[1fr_420px] md:py-16">
        <div>
          <Link href="/" className="text-[15px] font-semibold text-[var(--river)] hover:underline">{L("Back")}</Link>
          <div className="mt-6 flex items-center gap-3 text-[var(--brass)]"><Mark size={44} /><NavIcon name={info.icon} size={28} /></div>
          <h1 className="mt-4 text-[40px] leading-tight md:text-[52px]">{L(info.title)}</h1>
          <p className="mt-1 text-[22px] text-[var(--brass)]" style={{ fontFamily: "var(--font-display)" }} lang="bn">{info.bn}</p>
          <p className="mt-4 max-w-md text-[17px] text-[var(--slate)]">{L(info.intro)}</p>

          <h2 className="mt-10 text-[20px]">{L("Other ways to sign in")}</h2>
          <ul className="mt-2">
            {(Object.keys(ROLE_INFO) as Role[]).filter((r) => r !== role).map((r) => (
              <li key={r}>
                <Link href={`/login/${r}`} className="flex min-h-[48px] items-center gap-3 border-t border-[var(--line)] text-[16px] hover:underline">
                  <NavIcon name={ROLE_INFO[r].icon} /> {L(ROLE_INFO[r].title)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <form onSubmit={submit} className="panel h-fit p-6 md:p-8" aria-labelledby="signin-h">
          <h2 id="signin-h" className="text-[28px]">{L("Sign in")}</h2>

          {role === "panchayat" && (
            <>
              <label className="mt-5 block text-[14px] font-medium">{L("Panchayat code")}
                <select className="field mt-1" value={userId} onChange={(e) => setUserId(e.target.value)} autoComplete="username">
                  {VILLAGES.map((v) => <option key={v.id} value={gpCode(v.id)}>{gpCode(v.id)} ({villageName(v, lang)})</option>)}
                </select>
              </label>
              <label className="mt-4 block text-[14px] font-medium">{L("Password")}
                <input className="field mt-1" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
              </label>
            </>
          )}

          {(role === "block" || role === "district") && (
            <>
              <label className="mt-5 block text-[14px] font-medium">{L("Employee ID")}
                <input className="field mt-1 uppercase" value={userId} onChange={(e) => setUserId(e.target.value)} autoComplete="username" spellCheck={false} required />
              </label>
              <label className="mt-4 block text-[14px] font-medium">{L("Password")}
                <input className="field mt-1" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
              </label>
              <p className="mt-3 text-[14px] text-[var(--slate)]">{role === "block" ? L("Your block") : L("Your district")}: <b className="text-[var(--ink)]">{role === "block" ? "Sundarbans coastal" : "South 24 Parganas"}</b></p>
            </>
          )}

          {role === "citizen" && (
            <>
              <label className="mt-5 block text-[14px] font-medium">{L("Your village")}
                <select className="field mt-1" value={village} onChange={(e) => setVillage(e.target.value)}>
                  {VILLAGES.map((v) => <option key={v.id} value={v.id}>{villageName(v, lang)}</option>)}
                </select>
              </label>
              <label className="mt-4 block text-[14px] font-medium">{L("Mobile number")}
                <input className="field num mt-1" type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </label>
              {otpSent && (
                <label className="mt-4 block text-[14px] font-medium">{L("Enter OTP")}
                  <input className="field num mt-1 tracking-[0.4em]" inputMode="numeric" autoComplete="one-time-code" maxLength={4} value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} autoFocus required />
                  <span className="mt-1 block text-[13px] font-normal text-[var(--paddy)]" role="status">{L("OTP sent. For the demo, use 1234.")}</span>
                </label>
              )}
            </>
          )}

          {error && <p className="mt-3 text-[14px] font-semibold text-[var(--sindoor)]" role="alert">{error}</p>}
          <button type="submit" className="btn btn-primary mt-6 w-full !min-h-[50px] text-[16px]" disabled={busy}>
            {busy ? L("Signing in…") : role === "citizen" && !otpSent ? L("Send OTP") : L("Sign in")}
          </button>

          <div className="mt-5 rounded-md bg-[var(--paper)] p-3 text-[13px] text-[var(--slate)]">
            <b className="text-[var(--ink)]">{L("Demo login")}:</b>{" "}
            {role === "citizen" ? "OTP 1234" : role === "panchayat" ? `${gpCode("radhaganj")} / ${PASSWORD}` : `${DEMO_ID[role]} / ${PASSWORD}`}
          </div>
          {role === "citizen" && (
            <Link href={`/v/${village}`} className="mt-4 block text-[14px] font-semibold text-[var(--river)] hover:underline">{L("Or open your village's public page without signing in")}</Link>
          )}
        </form>
      </main>
    </div>
  );
}
