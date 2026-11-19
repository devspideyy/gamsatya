"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { RIVER_DANGER_M, SENSORS, SIRENS_PER_VILLAGE, VILLAGES } from "@/lib/data";
import { allSnapshots, Declaration, noise, VillageSnapshot } from "@/lib/sim";
import { appendRecord, LedgerRecord, verifyChain, VerifyResult } from "@/lib/ledger";
import { translate, DictKey } from "@/lib/i18n";
import { L as phrase, setPhraseLang } from "@/lib/phrases";
import {
  ALERT_TEMPLATES, AlertKind, CitizenReport, Incident, IncidentKind, Lang, ReportCategory, Role, Sos, SosStep, VillageAlert,
} from "@/lib/types";
import { villageById } from "@/lib/data";

export interface PhotoEvidence { photo: string; lat?: number; lng?: number; ts: number }

function sosPath(villageId: string): SosStep[] {
  const v = villageById(villageId);
  const twoG = v?.network === "2G";
  return [
    { label: "Mobile internet", detail: twoG ? "No data on 2G, could not send" : "Sent over 4G", after: 1500, ok: !twoG },
    { label: `LoRa radio to ${v?.gateway ?? "gateway"}`, detail: "Reached the panchayat gateway", after: 3500, ok: true },
    { label: "SMS to volunteer", detail: "Ward volunteer and ASHA worker notified", after: 6500, ok: true },
    { label: "Block control room", detail: "Logged and acknowledged", after: 9500, ok: true },
  ];
}

const TICK = 4000;
const LEDGER_MAX = 80;

interface Ctx {
  now: number;
  role: Role | null;
  setRole: (r: Role | null) => void;
  villageId: string;
  setVillageId: (id: string) => void;
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: DictKey) => string;
  /** Translate an English UI phrase into the current language */
  L: (en: string) => string;
  online: boolean;
  snaps: VillageSnapshot[];
  snapOf: (id: string) => VillageSnapshot;
  reports: CitizenReport[];
  addReport: (r: Omit<CitizenReport, "id" | "ts" | "status" | "check" | "matchedSensor">) => CitizenReport;
  setReportStatus: (id: string, s: CitizenReport["status"]) => void;
  alerts: VillageAlert[];
  sendAlert: (kind: AlertKind, villageIds: string[], source?: VillageAlert["source"], custom?: { en: string; bn: string }) => VillageAlert;
  sos: Sos[];
  sendSos: (villageId: string, text: string) => void;
  markSos: (id: string, status?: Sos["status"]) => void;
  incidents: Incident[];
  startFire: (villageId: string) => void;
  offline: string[];
  setOffline: (sensorId: string, off: boolean) => void;
  paused: boolean;
  setPaused: (p: boolean) => void;
  lowData: boolean;
  setLowData: (on: boolean) => void;
  photos: Record<string, PhotoEvidence>;
  addPhoto: (assetId: string, p: PhotoEvidence) => void;
  ledger: LedgerRecord[];
  verify: VerifyResult;
  tamper: (sensorId?: string) => LedgerRecord | null;
  restoreLedger: () => void;
  storm: boolean;
  setStorm: (on: boolean) => void;
  declarations: Record<string, Declaration>;
  submitDeclaration: (villageId: string, d: Declaration) => void;
  deviceFeed: DeviceReading[];
  acceptDeviceReadings: (list: DeviceReading[]) => void;
  resetDemo: () => void;
}

export interface DeviceReading { deviceId: string; sensorId: string; value: number; ts: number; verified: boolean }

const SimContext = createContext<Ctx | null>(null);

export function useSim() {
  const c = useContext(SimContext);
  if (!c) throw new Error("useSim must be used inside SimProvider");
  return c;
}

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked; demo keeps working in memory */
  }
}

export function crossCheck(villageId: string, category: ReportCategory, snaps: VillageSnapshot[]) {
  if (category === "other") return { check: "no-sensor" as const };
  const snap = snaps.find((s) => s.village.id === villageId);
  const same = snap?.readings.filter((r) => r.sensor.type === category) ?? [];
  if (!same.length) return { check: "no-sensor" as const };
  const bad = same.find((r) => !r.ok);
  return bad ? { check: "confirmed" as const, matchedSensor: bad.sensor.id } : { check: "not-confirmed" as const };
}

function seedReports(now: number): CitizenReport[] {
  const h = 3_600_000;
  return [
    { id: "r1", villageId: "radhaganj", category: "handpump", text: "Handpump near the primary school gives no water for 2 weeks.", ts: now - 9 * 24 * h, status: "Open", check: "confirmed", matchedSensor: "radhaganj-handpump-1" },
    { id: "r2", villageId: "radhaganj", category: "streetlight", text: "Road to the bus stand is dark at night. Unsafe for girls coming back from tuition.", ts: now - 6 * 24 * h, status: "In progress", check: "confirmed", matchedSensor: "radhaganj-streetlight-2" },
    { id: "r3", villageId: "nalbon", category: "bin", text: "Bin at the haat is overflowing, dogs spreading garbage.", ts: now - 30 * h, status: "Open", check: "no-sensor" },
    { id: "r4", villageId: "kusumpur", category: "handpump", text: "Handpump 2 was broken, now repaired. Thank you.", ts: now - 20 * 24 * h, status: "Resolved", check: "confirmed" },
    { id: "r5", villageId: "dakshin-mathabhanga", category: "tank", text: "No tap water in our para since last week.", ts: now - 4 * 24 * h, status: "Open", check: "confirmed", matchedSensor: "dakshin-mathabhanga-tank-1" },
    { id: "r6", villageId: "kusumpur", category: "streetlight", text: "Light near the ghat is off.", ts: now - 2 * 24 * h, status: "In progress", check: "confirmed", matchedSensor: "kusumpur-streetlight-6" },
  ];
}

export default function SimProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(0);
  const [role, setRoleState] = useState<Role | null>(null);
  const [villageId, setVillageIdState] = useState("radhaganj");
  const [lang, setLangState] = useState<Lang>("en");
  const [online, setOnline] = useState(true);
  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [alerts, setAlerts] = useState<VillageAlert[]>([]);
  const [sos, setSos] = useState<Sos[]>([]);
  const [ledger, setLedger] = useState<LedgerRecord[]>([]);
  const [storm, setStormState] = useState(false);
  const [surge, setSurge] = useState<Record<string, number>>({});
  const [overrides, setOverrides] = useState<Record<string, { value: number; ts: number }>>({});
  const [deviceFeed, setDeviceFeed] = useState<DeviceReading[]>([]);
  const [declarations, setDeclarations] = useState<Record<string, Declaration>>({});
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [offline, setOfflineList] = useState<string[]>([]);
  const [paused, setPaused] = useState(false);
  const [lowData, setLowDataState] = useState(false);
  const [photos, setPhotos] = useState<Record<string, PhotoEvidence>>({});
  const lastDeviceTs = useRef(0);
  const lastLedgerTick = useRef(0);
  const autoAlerted = useRef<Set<string>>(new Set());

  // --- mount: load persisted state
  useEffect(() => {
    const t = Date.now();
    setNow(t);
    setRoleState(load<Role | null>("gs.role", null));
    setVillageIdState(load("gs.village", "radhaganj"));
    setLangState(load<Lang>("gs.lang", "en"));
    setReports(load<CitizenReport[]>("gs.reports", seedReports(t)));
    setAlerts(load<VillageAlert[]>("gs.alerts", []));
    setSos(load<Sos[]>("gs.sos", []));
    setDeclarations(load<Record<string, Declaration>>("gs.declarations", {}));
    setIncidents(load<Incident[]>("gs.incidents", []));
    setLowDataState(load("gs.lowData", false));
    setPhotos(load<Record<string, PhotoEvidence>>("gs.photos", {}));
    setOnline(navigator.onLine);
    setMounted(true);
    const on = () => setOnline(true), off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  useEffect(() => { if (mounted) save("gs.reports", reports); }, [reports, mounted]);
  useEffect(() => { document.documentElement.lang = lang === "en" ? "en" : lang; }, [lang]);
  useEffect(() => { if (mounted) save("gs.alerts", alerts); }, [alerts, mounted]);
  useEffect(() => { if (mounted) save("gs.sos", sos); }, [sos, mounted]);
  useEffect(() => { if (mounted) save("gs.declarations", declarations); }, [declarations, mounted]);
  useEffect(() => { if (mounted) save("gs.incidents", incidents); }, [incidents, mounted]);
  useEffect(() => { if (mounted) save("gs.photos", photos); }, [photos, mounted]);

  // --- clock
  useEffect(() => {
    if (!mounted) return;
    if (paused) return;
    const id = setInterval(() => setNow(Date.now()), TICK);
    return () => clearInterval(id);
  }, [mounted, paused]);

  // --- storm surge simulation
  useEffect(() => {
    if (!mounted) return;
    setSurge((prev) => {
      const next: Record<string, number> = {};
      for (const v of VILLAGES.filter((x) => x.coastal)) {
        const cur = prev[v.id] ?? 0;
        // Storm intensity climbs to 1 over about 20 seconds, Haripur Char a little faster
        next[v.id] = storm ? Math.min(1, cur + (v.id === "haripur-char" ? 0.22 : 0.18)) : Math.max(0, cur - 0.3);
      }
      return next;
    });
  }, [now, storm, mounted]);

  // --- readings from real devices (ESP32, device simulator, or the virtual device on the Devices page)
  const acceptDeviceReadings = useCallback((list: DeviceReading[]) => {
    if (!list.length) return;
    const key = (r: DeviceReading) => `${r.ts}|${r.sensorId}|${r.deviceId}`;
    setDeviceFeed((prev) => {
      const seen = new Set(prev.map(key));
      return [...list.filter((r) => !seen.has(key(r))), ...prev].sort((a, b) => b.ts - a.ts).slice(0, 50);
    });
    setOverrides((prev) => {
      const next = { ...prev };
      for (const r of [...list].sort((a, b) => a.ts - b.ts)) if (r.verified) next[r.sensorId] = { value: r.value, ts: r.ts };
      return next;
    });
    const fresh = list.filter((r) => r.verified && r.ts > lastDeviceTs.current).sort((a, b) => a.ts - b.ts);
    if (fresh.length) {
      lastDeviceTs.current = fresh[fresh.length - 1].ts;
      setLedger((chain) => {
        let c = chain;
        for (const r of fresh) {
          const s = SENSORS.find((x) => x.id === r.sensorId);
          if (s) c = appendRecord(c, { ts: r.ts, sensorId: s.id, villageId: s.villageId, value: r.value, source: "device" });
        }
        return c.slice(-LEDGER_MAX);
      });
    }
  }, []);

  useEffect(() => {
    if (!mounted || !online) return;
    let cancelled = false;
    const poll = async () => {
      try {
        const res = await fetch("/api/ingest", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { recent: DeviceReading[] };
        if (!cancelled && data.recent?.length) acceptDeviceReadings(data.recent);
      } catch {
        /* offline or API not reachable */
      }
    };
    poll();
    const id = setInterval(poll, 5000);
    return () => { cancelled = true; clearInterval(id); };
  }, [mounted, online, acceptDeviceReadings]);

  const resolution = useMemo(() => {
    const out: Record<string, number | undefined> = {};
    for (const v of VILLAGES) {
      const rs = reports.filter((r) => r.villageId === v.id);
      out[v.id] = rs.length ? (100 * rs.filter((r) => r.status === "Resolved").length) / rs.length : undefined;
    }
    return out;
  }, [reports]);

  const verify = useMemo(() => verifyChain(ledger), [ledger]);
  // A string (not a Set) so snapshots only recompute when the broken village actually changes
  const brokenVillage = useMemo(() => {
    if (verify.ok || verify.brokenAt === undefined) return "";
    return ledger.find((x) => x.i === verify.brokenAt)?.villageId ?? "";
  }, [verify, ledger]);

  const snaps = useMemo(
    () => (now ? allSnapshots(now, { surge, overrides, reportResolution: resolution, brokenLedger: new Set(brokenVillage ? [brokenVillage] : []), declarations, offline: new Set(offline) }) : []),
    [now, surge, overrides, resolution, brokenVillage, declarations, offline],
  );

  // --- ledger: seed history then append simulated readings each tick
  useEffect(() => {
    if (!snaps.length) return;
    if (ledger.length && lastLedgerTick.current === now) return;
    lastLedgerTick.current = now;
    setLedger((chain) => {
      let c = chain;
      if (!c.length) {
        for (let k = 40; k >= 1; k--) {
          const at = now - k * TICK * 3;
          const s = SENSORS[Math.floor(noise("seed", at) * SENSORS.length)];
          const r = snaps.find((x) => x.village.id === s.villageId)!.readings.find((x) => x.sensor.id === s.id)!;
          c = appendRecord(c, { ts: at, sensorId: s.id, villageId: s.villageId, value: r.value, source: "simulated" });
        }
      }
      const picks = [Math.floor(noise("tick-a", now) * SENSORS.length), Math.floor(noise("tick-b", now) * SENSORS.length)];
      for (const p of picks) {
        const s = SENSORS[p];
        const r = snaps.find((x) => x.village.id === s.villageId)!.readings.find((x) => x.sensor.id === s.id)!;
        if (r.source === "device") continue;
        c = appendRecord(c, { ts: now, sensorId: s.id, villageId: s.villageId, value: r.value, source: "simulated" });
      }
      return c.slice(-LEDGER_MAX);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snaps, now]);

  // --- alerts
  const sendAlert = useCallback<Ctx["sendAlert"]>((kind, villageIds, source = "Manual", custom) => {
    const tpl = custom ?? ALERT_TEMPLATES[kind];
    const id = `al-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const deliveries = villageIds.flatMap((vid) =>
      Array.from({ length: SIRENS_PER_VILLAGE }, (_, i) => ({ node: `${vid}-siren-${i + 1}`, villageId: vid, status: "Sending" as const })),
    );
    const alert: VillageAlert = { id, ts: Date.now(), villageIds, kind, en: tpl.en, bn: tpl.bn, source, deliveries };
    setAlerts((a) => [alert, ...a].slice(0, 30));
    deliveries.forEach((d, idx) => {
      const failed = d.node === "dakshin-mathabhanga-siren-3";
      setTimeout(() => {
        setAlerts((all) => all.map((al) => al.id !== id ? al : {
          ...al,
          deliveries: al.deliveries.map((x) => (x.node === d.node ? { ...x, status: failed ? "No reply" : "Delivered" } : x)),
        }));
      }, 700 + idx * 450 + (failed ? 4000 : 0));
    });
    return alert;
  }, []);

  useEffect(() => {
    for (const s of snaps) {
      if (!s.river) continue;
      if (s.river.value >= RIVER_DANGER_M && !autoAlerted.current.has(s.village.id)) {
        autoAlerted.current.add(s.village.id);
        sendAlert("Flood", [s.village.id], "Auto (river gauge)");
      }
      if (s.river.value < RIVER_DANGER_M - 0.6) autoAlerted.current.delete(s.village.id);
    }
  }, [snaps, sendAlert]);

  // --- four-stage flood incidents driven by the river gauges
  useEffect(() => {
    if (!snaps.length) return;
    setIncidents((list) => {
      let changed = false;
      let next = list;
      for (const s of snaps) {
        if (!s.river) continue;
        const lvl = s.river.value;
        const open = next.find((i) => i.kind === "Flood" && i.villageId === s.village.id && !i.stages.resolved);
        if (!open && lvl >= 3.8) {
          next = [{ id: `inc-${Date.now()}-${s.village.id}`, kind: "Flood", villageId: s.village.id, stages: { watch: now },
            notes: [{ ts: now, text: `River gauge at ${lvl.toFixed(2)} m. Watch started.` }] }, ...next];
          changed = true;
          continue;
        }
        if (!open) continue;
        const upd: Incident = { ...open, stages: { ...open.stages }, notes: [...open.notes] };
        if (lvl >= 4.2 && !upd.stages.warning) { upd.stages.warning = now; upd.notes.push({ ts: now, text: `River at ${lvl.toFixed(2)} m. Warning: volunteers alerted, shelters opened.` }); }
        if (lvl >= RIVER_DANGER_M && !upd.stages.emergency) {
          upd.stages.emergency = now;
          upd.responder = { team: "SDRF boat team, Gosaba", at: now + 40_000 };
          upd.notes.push({ ts: now, text: `Danger line crossed at ${lvl.toFixed(2)} m. Sirens sounded, SDRF requested.` });
        }
        if (!storm && lvl < 3.8) { upd.stages.resolved = now; upd.notes.push({ ts: now, text: "Water back below the watch line. Incident closed." }); }
        if (JSON.stringify(upd) !== JSON.stringify(open)) { next = next.map((i) => (i.id === open.id ? upd : i)); changed = true; }
      }
      return changed ? next.slice(0, 30) : list;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snaps]);

  const startFire = useCallback((vid: string) => {
    const id = `inc-fire-${Date.now()}`;
    const t0 = Date.now();
    setIncidents((x) => [{ id, kind: "Fire" as IncidentKind, villageId: vid, stages: { watch: t0 }, notes: [{ ts: t0, text: "Two villagers report smoke near the haat." }] }, ...x]);
    const step = (ms: number, f: (i: Incident) => Incident) => setTimeout(() => setIncidents((x) => x.map((i) => (i.id === id ? f(i) : i))), ms);
    step(4000, (i) => ({ ...i, stages: { ...i.stages, warning: Date.now() }, notes: [...i.notes, { ts: Date.now(), text: "Photo report confirms fire in a thatched shop. Ward volunteer on the way." }] }));
    step(8000, (i) => ({ ...i, stages: { ...i.stages, emergency: Date.now() }, responder: { team: "Fire tender, Canning station", at: Date.now() + 30_000 }, notes: [...i.notes, { ts: Date.now(), text: "Fire spreading. Siren sounded, fire service called." }] }));
    step(18000, (i) => ({ ...i, stages: { ...i.stages, resolved: Date.now() }, notes: [...i.notes, { ts: Date.now(), text: "Fire out. No injuries. Damage report filed." }] }));
    sendAlert("Evacuate", [vid], "Manual", { en: "Fire near the haat. Keep away from the market area and let the fire tender through.", bn: "হাটের কাছে আগুন। বাজার এলাকা থেকে দূরে থাকুন, দমকলকে পথ দিন।" });
  }, [sendAlert]);

  setPhraseLang(lang);
  const ctx: Ctx = {
    now,
    role,
    setRole: (r) => { setRoleState(r); save("gs.role", r); },
    villageId,
    setVillageId: (id) => { setVillageIdState(id); save("gs.village", id); },
    lang,
    setLang: (l) => { setLangState(l); save("gs.lang", l); },
    t: (k) => translate(k, lang),
    L: phrase,
    online,
    snaps,
    snapOf: (id) => snaps.find((s) => s.village.id === id) ?? snaps[0],
    reports,
    addReport: (r) => {
      const check = crossCheck(r.villageId, r.category, snaps);
      const rep: CitizenReport = { ...r, ...check, id: `r-${Date.now()}`, ts: Date.now(), status: "Open", savedOffline: !online };
      setReports((x) => [rep, ...x]);
      return rep;
    },
    setReportStatus: (id, s) => setReports((x) => x.map((r) => (r.id === id ? { ...r, status: s } : r))),
    alerts,
    sendAlert,
    sos,
    sendSos: (vid, text) => setSos((x) => [{ id: `s-${Date.now()}`, ts: Date.now(), villageId: vid, text, status: "New" as const, path: sosPath(vid) }, ...x].slice(0, 30)),
    markSos: (id, status = "Help sent") => setSos((x) => x.map((s) => (s.id === id ? { ...s, status } : s))),
    incidents,
    startFire,
    offline,
    setOffline: (sid, off) => setOfflineList((x) => (off ? [...new Set([...x, sid])] : x.filter((y) => y !== sid))),
    paused,
    setPaused,
    lowData,
    setLowData: (on) => { setLowDataState(on); save("gs.lowData", on); },
    photos,
    addPhoto: (aid, p) => setPhotos((x) => ({ ...x, [aid]: p })),
    ledger,
    verify,
    tamper: (sensorId) => {
      const target = (sensorId ? [...ledger].reverse().find((r) => r.sensorId === sensorId) : undefined)
        ?? [...ledger].reverse().find((r) => r.villageId === "radhaganj" && r.value < 1)
        ?? [...ledger].reverse().find((r) => r.villageId === "radhaganj")
        ?? ledger[Math.floor(ledger.length / 2)];
      if (!target) return null;
      const fake = target.sensorId.includes("streetlight") ? 18.4 : target.sensorId.includes("handpump") ? 12.2 : target.sensorId.includes("bin") ? 35 : target.value + 40;
      setLedger((c) => c.map((r) => (r.i === target.i ? { ...r, value: fake, edited: true } : r)));
      return target;
    },
    restoreLedger: () => { setLedger([]); setNow(Date.now()); },
    storm,
    setStorm: setStormState,
    declarations,
    submitDeclaration: (vid, d) => setDeclarations((x) => ({ ...x, [vid]: d })),
    deviceFeed,
    acceptDeviceReadings,
    resetDemo: () => {
      for (const k of ["gs.reports", "gs.alerts", "gs.sos", "gs.declarations", "gs.incidents", "gs.photos"]) localStorage.removeItem(k);
      setDeclarations({});
      setIncidents([]);
      setOfflineList([]);
      setPhotos({});
      setPaused(false);
      setReports(seedReports(Date.now()));
      setAlerts([]);
      setSos([]);
      setLedger([]);
      setStormState(false);
      autoAlerted.current.clear();
      setNow(Date.now());
    },
  };

  if (!mounted || !snaps.length) {
    return (
      <div className="grid min-h-dvh place-items-center text-[var(--slate)]">
        <p>{phrase("Loading village data…")}</p>
      </div>
    );
  }
  return <SimContext.Provider value={ctx}>{children}</SimContext.Provider>;
}
