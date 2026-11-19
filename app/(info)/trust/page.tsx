"use client";

import { PageHeader } from "@/components/ui";
import { L } from "@/lib/phrases";

const BADGE = [
  ["Sensor verified", "The number came from an installed sensor, was signed by that device and is still in an unbroken chain."],
  ["Citizen", "Villagers reported it and the reports have been checked. Counts at 75%."],
  ["Declared only", "Nobody has measured it yet. The panchayat says so. Counts at 45%."],
  ["Unverified", "A sensor went silent or the ledger was edited. The figure is treated like a declaration until fixed."],
];

const BYPASS = [
  ["Pour water into a tank before an inspection", "Level would jump against its daily pattern; flow sensors on the outlet show no matching use.", "Flag sudden jumps, compare with outlet flow."],
  ["Cover or move a sensor", "Readings stop changing or the node's GPS and tilt change.", "Stuck-value and tamper alarms; photo check by a villager."],
  ["Unplug a broken streetlight's sensor", "The node goes silent.", "Silent nodes lose sensor credit and fall to 45%."],
  ["Edit past data on the server", "The fingerprint chain breaks at the edited record.", "Copies of the chain on the device and block server; anyone can re-verify."],
  ["Clone a device and send fake data", "Without the device's secret key the signature fails.", "Per-device keys; in production, keys in a secure chip, not in software."],
  ["Steal or seize a gateway", "A gateway holding keys could sign false readings.", "Gateways only forward; signing stays on each sensor node. Physical custody with the block office."],
];

const LIMITS = [
  "No hardware has been installed in a village yet. All readings in this prototype are simulated.",
  "Sirens, SMS and calls are simulated. Nothing is sent to real phones.",
  "Device secrets in this demo live on the server and in the simulator. Production needs secure elements in each node.",
  "Data is kept in the browser and in server memory. A pilot needs a proper database and backups.",
  "Sensors measure a few things well. They cannot measure everything in the Panchayat Advancement Index, such as school quality or livelihoods.",
  "Prices and costs are estimates and must be checked before procurement.",
];

export default function TrustPage() {
  return (
    <div>
      <PageHeader title={L("Trust and limits")} lede={L("What a badge proves, how someone could try to fool the system, and what this prototype does not do yet.")} />

      <section aria-labelledby="badges">
        <h2 id="badges" className="text-[28px]">{L("What each badge proves")}</h2>
        <dl className="mt-3">
          {BADGE.map(([t, d]) => (
            <div key={t} className="grid gap-1 border-t border-[var(--line)] py-3 sm:grid-cols-[200px_1fr]">
              <dt className="font-semibold">{t}</dt><dd className="text-[var(--slate)]">{d}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-10" aria-labelledby="bypass">
        <h2 id="bypass" className="text-[28px]">{L("How someone might try to cheat")}</h2>
        <div className="-mx-4 mt-3 overflow-x-auto px-4">
          <table className="data-table min-w-[680px]">
            <thead><tr><th>{L("Attempt")}</th><th>{L("What gives it away")}</th><th>{L("Defence")}</th></tr></thead>
            <tbody>{BYPASS.map(([a, b, c]) => <tr key={a}><td className="font-semibold">{a}</td><td className="text-[14px]">{b}</td><td className="text-[14px] text-[var(--slate)]">{c}</td></tr>)}</tbody>
          </table>
        </div>
      </section>

      <section className="mt-10" aria-labelledby="limits" id="limitations">
        <h2 id="limits" className="text-[28px]">{L("Limitations")}</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-[16px]">
          {LIMITS.map((l) => <li key={l}>{l}</li>)}
        </ul>
      </section>
    </div>
  );
}
