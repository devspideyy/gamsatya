"use client";

import { useEffect, useState } from "react";
import { useSim } from "@/components/SimProvider";
import MapView from "@/components/MapView";
import { PageHeader, rupees } from "@/components/ui";
import { ASSETS, villageById } from "@/lib/data";
import { assetStatus, AssetStatus } from "@/lib/sim";
import { L } from "@/lib/phrases";

const STATUS_COLOR: Record<AssetStatus["status"], string> = { Working: "var(--river)", "At risk": "#7d5208", "Dried up": "var(--sindoor)" };
const STATUS_HEX: Record<AssetStatus["status"], string> = { Working: "#1d5c78", "At risk": "#a06a0c", "Dried up": "#a3241b" };
const MONTHS = ["Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"];

/** Twelve monthly water levels as small bars. Bars below the dashed line count as dry. */
function MonthBars({ levels }: { levels: number[] }) {
  const h = 34;
  return (
    <svg width={12 * 9} height={h + 2} viewBox={`0 0 ${12 * 9} ${h + 2}`} role="img" aria-label={`Monthly water level: ${levels.map((l, i) => `${MONTHS[i]} ${l}%`).join(", ")}`}>
      {levels.map((l, i) => (
        <rect key={i} x={i * 9} y={h - (l / 100) * h} width={7} height={Math.max(1.5, (l / 100) * h)} rx={1}
          fill={l >= 25 ? "#1d5c78" : "#a3241b"} opacity={l >= 25 ? 0.9 : 0.75} />
      ))}
      <line x1={0} x2={12 * 9} y1={h - 0.25 * h} y2={h - 0.25 * h} stroke="#1d2847" strokeDasharray="2 2" strokeWidth={1} />
    </svg>
  );
}

export default function AssetsPage() {
  const { role, villageId } = useSim();
  const [flagged, setFlagged] = useState<string[]>([]);
  useEffect(() => {
    try { setFlagged(JSON.parse(localStorage.getItem("gs.auditFlags") ?? "[]")); } catch { /* ignore */ }
  }, []);
  const toggleFlag = (id: string) => {
    const next = flagged.includes(id) ? flagged.filter((x) => x !== id) : [...flagged, id];
    setFlagged(next);
    localStorage.setItem("gs.auditFlags", JSON.stringify(next));
  };

  const own = role === "panchayat" || role === "citizen";
  const all = (own ? ASSETS.filter((a) => a.villageId === villageId) : ASSETS).map(assetStatus)
    .sort((a, b) => a.current - b.current);
  const working = all.filter((a) => a.status === "Working");
  const spent = all.reduce((s, a) => s + a.asset.cost, 0);
  const wasted = all.filter((a) => a.status !== "Working").reduce((s, a) => s + a.asset.cost, 0);
  const officer = role === "block" || role === "district";

  return (
    <div>
      <PageHeader
        title={L("Did the money create something that lasts?")}
        lede={<>{L("Water-level sensors on ponds and check dams built under MGNREGA and Amrit Sarovar.")} <b className="text-[var(--ink)]">{working.length} of {all.length}</b> still hold water. <b className="text-[var(--sindoor)]">{rupees(wasted)}</b> of {rupees(spent)} went into structures that are now dry or at risk.</>}
      />

      <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
        <table className="w-full min-w-[820px] text-[15px]">
          <thead>
            <tr className="text-left text-[13px] text-[var(--slate)]">
              <th className="pb-2 font-medium">{L("Structure")}</th>
              <th className="pb-2 font-medium">{L("Now")}</th>
              <th className="pb-2 font-medium">{L("Last 12 months")}</th>
              <th className="pb-2 text-right font-medium">{L("Cost")}</th>
              <th className="pb-2 text-right font-medium">{L("Cost per month with water")}</th>
              {officer && <th className="pb-2 pl-6 font-medium"><span className="sr-only">{L("Social audit")}</span></th>}
            </tr>
          </thead>
          <tbody>
            {all.map((a) => {
              const v = villageById(a.asset.villageId)!;
              const isFlagged = flagged.includes(a.asset.id);
              return (
                <tr key={a.asset.id} className="border-t border-[var(--line)]">
                  <td className="py-3 pr-4">
                    <a href={`/a/${a.asset.id}`} className="font-semibold hover:underline">{a.asset.name}</a>
                    <span className="block text-[12px] text-[var(--slate)]">{a.asset.kind}, {a.asset.scheme}, built {new Date(a.asset.builtOn + "-01").toLocaleDateString("en-IN", { month: "short", year: "numeric" })}{own ? "" : `, ${v.name}`}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <b className="num text-[17px]" style={{ color: STATUS_COLOR[a.status] }}>{a.current}%</b>
                    <span className="block text-[12px] font-semibold" style={{ color: STATUS_COLOR[a.status] }}>{a.status}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <MonthBars levels={a.asset.levels} />
                    <span className="block text-[12px] text-[var(--slate)]">Water in {a.workingMonths} of 12 months</span>
                  </td>
                  <td className="num py-3 text-right">{rupees(a.asset.cost)}</td>
                  <td className="num py-3 text-right font-semibold">{a.costPerWorkingMonth ? rupees(a.costPerWorkingMonth) : <span className="text-[var(--sindoor)]">{L("Never held water")}</span>}</td>
                  {officer && (
                    <td className="py-3 pl-6 text-right">
                      <button onClick={() => toggleFlag(a.asset.id)} aria-pressed={isFlagged}
                        className={`whitespace-nowrap text-[14px] font-semibold hover:underline ${isFlagged ? "text-[var(--sindoor)]" : "text-[var(--river)]"}`}>
                        {isFlagged ? "Flagged for social audit" : "Flag for social audit"}
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[13px] text-[var(--slate)]">{L("Each bar is one month, December to November. Below the dashed line (25% full) the structure counts as dry.")}</p>

      {!own && (
        <section className="mt-10 border-t border-[var(--line)] pt-8" aria-labelledby="amap">
          <h2 id="amap" className="mb-3 text-[24px]">{L("Map")}</h2>
          <MapView height={320} points={all.map((a) => ({
            lat: a.asset.lat, lng: a.asset.lng, radius: 10, color: STATUS_HEX[a.status],
            label: `${a.asset.name}: ${a.status}, ${a.current}% full`,
          }))} />
        </section>
      )}
    </div>
  );
}
