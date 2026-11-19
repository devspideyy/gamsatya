"use client";

import Link from "next/link";
import type { SensorType } from "@/lib/data";
import { faultSince, Reading, VillageSnapshot } from "@/lib/sim";
import { L } from "@/lib/phrases";

const ORDER: { type: SensorType; label: string; good: string }[] = [
  { type: "handpump", label: "Handpumps", good: "flowing" },
  { type: "streetlight", label: "Streetlights", good: "on" },
  { type: "tank", label: "Water tanks", good: "above 25%" },
  { type: "bin", label: "Waste bins", good: "not overflowing" },
  { type: "river", label: "River gauge", good: "below danger line" },
];

function fmt(r: Reading) {
  if (r.offline) return "Offline";
  if (r.sensor.type === "river") return `${r.value.toFixed(2)} m`;
  if (r.sensor.type === "handpump") return `${r.value.toFixed(1)} L/min`;
  if (r.sensor.type === "streetlight") return r.value > 5 ? "On" : "Off";
  return `${Math.round(r.value)}%`;
}

export default function SensorRegister({ snap }: { snap: VillageSnapshot }) {
  return (
    <section aria-labelledby="register-title">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="register-title" className="text-[24px]">{L("Live sensors")}</h2>
        <Link href="/devices" className="text-[14px] font-semibold text-[var(--river)] hover:underline">{L("Connect a device")}</Link>
      </div>
      <div className="mt-2">
        {ORDER.map(({ type, label, good }) => {
          const rs = snap.readings.filter((r) => r.sensor.type === type);
          if (!rs.length) return null;
          const ok = rs.filter((r) => r.ok).length;
          return (
            <div key={type} className="grid grid-cols-1 gap-x-4 gap-y-2 border-t border-[var(--line)] py-3 sm:grid-cols-[150px_1fr]">
              <p className="text-[15px]">
                <span className="font-semibold">{L(label)}</span>
                <span className={`block text-[13px] ${ok === rs.length ? "text-[var(--slate)]" : "font-semibold text-[var(--sindoor)]"}`}>{ok} / {rs.length} {L(good)}</span>
              </p>
              <ul className="flex flex-wrap gap-1.5">
                {rs.map((r) => {
                  const since = !r.ok && r.source !== "device" ? faultSince(r.sensor.id) : undefined;
                  const bad = !r.ok && !r.offline;
                  return (
                    <li key={r.sensor.id}>
                    <Link href={`/a/${r.sensor.id}`} title={`${r.sensor.label}${since !== undefined ? `, faulty for ${since} days` : ""}. Open its record.`}
                      className="block min-w-[84px] rounded-md px-2.5 py-1.5 hover:outline hover:outline-2 hover:outline-[var(--brass-soft)]"
                      style={{ background: r.offline ? "#e4ddd0" : bad ? "var(--sindoor-tint)" : r.source === "device" ? "var(--river-tint)" : "#efe7d7" }}>
                      <span className="block text-[11px] text-[var(--slate)]">
                        No. {r.sensor.label.split(" ").pop()}{r.source === "device" && <b className="ml-1 text-[var(--river)]">ESP32</b>}
                      </span>
                      <span className="num block text-[14px] font-semibold" style={{ color: r.offline ? "var(--slate)" : bad ? "var(--sindoor)" : "var(--ink)" }}>{fmt(r)}</span>
                      {since !== undefined && !r.offline && <span className="block text-[11px] text-[var(--sindoor)]">{since} days</span>}
                    </Link>
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
