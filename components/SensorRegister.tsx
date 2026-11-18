"use client";

import Link from "next/link";
import type { SensorType } from "@/lib/data";
import { faultSince, Reading, VillageSnapshot } from "@/lib/sim";

const ORDER: { type: SensorType; label: string; good: string }[] = [
  { type: "handpump", label: "Handpumps", good: "flowing" },
  { type: "streetlight", label: "Streetlights", good: "on" },
  { type: "tank", label: "Water tanks", good: "above 25%" },
  { type: "bin", label: "Waste bins", good: "not overflowing" },
  { type: "river", label: "River gauge", good: "below danger line" },
];

function fmt(r: Reading) {
  if (r.sensor.type === "river") return `${r.value.toFixed(2)} m`;
  if (r.sensor.type === "handpump") return `${r.value.toFixed(1)} L/min`;
  if (r.sensor.type === "streetlight") return r.value > 5 ? "On" : "Off";
  return `${Math.round(r.value)}%`;
}

export default function SensorRegister({ snap }: { snap: VillageSnapshot }) {
  return (
    <section aria-labelledby="register-title">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="register-title" className="text-[24px]">Live sensors</h2>
        <Link href="/devices" className="text-[14px] font-semibold text-[var(--river)] hover:underline">Connect a device</Link>
      </div>
      <div className="mt-2">
        {ORDER.map(({ type, label, good }) => {
          const rs = snap.readings.filter((r) => r.sensor.type === type);
          if (!rs.length) return null;
          const ok = rs.filter((r) => r.ok).length;
          return (
            <div key={type} className="grid grid-cols-1 gap-x-4 gap-y-2 border-t border-[var(--line)] py-3 sm:grid-cols-[150px_1fr]">
              <p className="text-[15px]">
                <span className="font-semibold">{label}</span>
                <span className={`block text-[13px] ${ok === rs.length ? "text-[var(--slate)]" : "font-semibold text-[var(--sindoor)]"}`}>{ok} of {rs.length} {good}</span>
              </p>
              <ul className="flex flex-wrap gap-1.5">
                {rs.map((r) => {
                  const since = !r.ok && r.source !== "device" ? faultSince(r.sensor.id) : undefined;
                  const bad = !r.ok;
                  return (
                    <li key={r.sensor.id} title={`${r.sensor.label}${since !== undefined ? `, faulty for ${since} days` : ""}`}
                      className="min-w-[84px] rounded-md px-2.5 py-1.5"
                      style={{ background: bad ? "var(--sindoor-tint)" : r.source === "device" ? "var(--river-tint)" : "#efe7d7" }}>
                      <span className="block text-[11px] text-[var(--slate)]">
                        No. {r.sensor.label.split(" ").pop()}{r.source === "device" && <b className="ml-1 text-[var(--river)]">ESP32</b>}
                      </span>
                      <span className="num block text-[14px] font-semibold" style={{ color: bad ? "var(--sindoor)" : "var(--ink)" }}>{fmt(r)}</span>
                      {since !== undefined && <span className="block text-[11px] text-[var(--sindoor)]">{since} days</span>}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
