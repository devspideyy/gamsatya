"use client";

import { useEffect, useRef, useState } from "react";
import { DeviceReading, useSim } from "@/components/SimProvider";
import { PageHeader, timeAgo } from "@/components/ui";
import { SENSORS, villageById } from "@/lib/data";
import { L } from "@/lib/phrases";


export default function DevicesPage() {
  const { snaps, deviceFeed, role, villageId, acceptDeviceReadings } = useSim();
  const [origin, setOrigin] = useState("http://localhost:3000");
  const [copied, setCopied] = useState<string | null>(null);
  const [virtualSensor, setVirtualSensor] = useState("radhaganj-handpump-1");
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => setOrigin(window.location.origin), []);
  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  async function sendVirtual(sensorId: string, forge = false) {
    try {
      const res = await fetch("/api/device-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sensorId, forge }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string; reading?: DeviceReading };
      if (data.reading) acceptDeviceReadings([data.reading]);
      setStatus(data.ok
        ? `Signed reading accepted: ${data.reading?.value.toFixed(2)} from ${sensorId}`
        : `Rejected: ${data.error}`);
    } catch {
      setStatus("Could not reach the server. Device readings need the app to be online.");
    }
  }

  function toggleVirtual() {
    if (running) {
      if (timer.current) clearInterval(timer.current);
      timer.current = null;
      setRunning(false);
      setStatus("Virtual device stopped. The sensor goes back to its last real state within 2 minutes.");
      return;
    }
    setRunning(true);
    sendVirtual(virtualSensor);
    timer.current = setInterval(() => sendVirtual(virtualSensor), 5000);
  }

  const scope = role === "panchayat" ? snaps.filter((s) => s.village.id === villageId) : snaps;
  const readings = scope.flatMap((s) => s.readings);
  const simCmd = `node scripts/device-sim.mjs --url ${origin} --sensor radhaganj-handpump-1`;

  function copy(text: string) {
    navigator.clipboard?.writeText(text).then(() => { setCopied(text); setTimeout(() => setCopied(null), 1500); }).catch(() => {});
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={L("Sensors and devices")}
        lede={L("A sensor node is an ESP32 with one or two sensors and a small solar panel, about ₹2,000 to ₹3,000 in parts. It signs every reading, so a fake device cannot add data.")}
      />

      <div className="grid gap-x-12 gap-y-10 lg:grid-cols-[1.1fr_1fr]">
        <section aria-labelledby="feed">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 id="feed" className="text-[24px]">{L("Readings from devices")}</h2>
            <span className="text-[14px] text-[var(--slate)]">{deviceFeed.length ? `${deviceFeed.length} received` : "Waiting"}</span>
          </div>
          <div className="mb-5 rounded-lg bg-white p-4">
            <p className="text-[14px] font-semibold">{L("Try it from this browser")}</p>
            <p className="mt-0.5 text-[13px] text-[var(--slate)]">{L("Start a virtual ESP32 on a broken sensor. It sends a signed reading every 5 seconds, and the village scorecard and ledger switch to its data.")}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <select className="field !w-auto !py-1.5 text-[13px]" value={virtualSensor} disabled={running} onChange={(e) => setVirtualSensor(e.target.value)} aria-label="Sensor for the virtual device">
                {SENSORS.filter((s) => snaps.find((x) => x.village.id === s.villageId)?.readings.find((r) => r.sensor.id === s.id && (!r.ok || r.source === "device")) || s.id === virtualSensor)
                  .map((s) => <option key={s.id} value={s.id}>{villageById(s.villageId)?.name}, {s.label}</option>)}
              </select>
              <button className={`btn !py-1.5 text-[13px] ${running ? "btn-danger" : "btn-primary"}`} onClick={toggleVirtual}>{running ? "Stop virtual device" : "Start virtual device"}</button>
              <button className="btn btn-ghost !py-1.5 text-[13px]" onClick={() => sendVirtual(virtualSensor, true)}>{L("Send a forged reading")}</button>
            </div>
            {status && <p className="mt-2 text-[12px] text-[var(--slate)]" role="status">{status}</p>}
          </div>
          {deviceFeed.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[var(--line)] p-4 text-[14px] text-[var(--slate)]">
              {L("No device has sent data yet. Start the virtual device above, run the device simulator, or flash the ESP32 firmware. Readings show up here within 5 seconds.")}
            </div>
          ) : (
            <ul className="max-h-72 space-y-1.5 overflow-y-auto">
              {deviceFeed.slice(0, 20).map((d, i) => (
                <li key={`${d.ts}-${i}`} className="flex items-center justify-between gap-3 border-b border-[#ece3d1] pb-1.5 text-[14px] last:border-0">
                  <span className="min-w-0 truncate"><b>{d.deviceId}</b> <span className="text-[var(--slate)]">{d.sensorId}</span></span>
                  <span className="num shrink-0">{d.value.toFixed(2)}</span>
                  <span className="shrink-0 text-[13px] font-semibold" style={{ color: d.verified ? "var(--paddy)" : "var(--sindoor)" }}>{d.verified ? "Signature OK" : "Rejected"}</span>
                  <span className="shrink-0 text-[12px] text-[var(--slate)]">{timeAgo(d.ts)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="connect">
          <h2 id="connect" className="mb-3 text-[24px]">{L("Connect a real device")}</h2>
          <ol className="space-y-3 text-[14px]">
            <li className="flex gap-3">
              <span className="num grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--ink)] text-[12px] font-bold text-white">1</span>
              <div className="min-w-0">
                <p className="font-semibold">{L("Test without hardware")}</p>
                <p className="text-[var(--slate)]">{L("From the project folder, run the device simulator. It signs readings exactly like the ESP32 does.")}</p>
                <button onClick={() => copy(simCmd)} className="mt-1.5 block w-full overflow-x-auto rounded-md bg-[#1d2847] px-3 py-2 text-left text-[12px] text-[#e7eaf6]" title="Copy command">
                  <code className="whitespace-nowrap">{simCmd}</code>
                </button>
                {copied === simCmd && <span className="text-[12px] text-[var(--paddy)]">{L("Copied")}</span>}
              </div>
            </li>
            <li className="flex gap-3">
              <span className="num grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--ink)] text-[12px] font-bold text-white">2</span>
              <div>
                <p className="font-semibold">{L("Flash the ESP32")}</p>
                <p className="text-[var(--slate)]">{L("Open")} <code>firmware/esp32_node/esp32_node.ino</code> in Arduino IDE, set Wi-Fi, server URL, device secret and sensor ID, then upload.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="num grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--ink)] text-[12px] font-bold text-white">3</span>
              <div>
                <p className="font-semibold">{L("Watch it take over")}</p>
                <p className="text-[var(--slate)]">The sensor tile switches to &quot;ESP32 signed&quot;, the village score uses the real value and the data ledger records it.</p>
              </div>
            </li>
          </ol>
          <details className="mt-4 text-[13px]">
            <summary className="cursor-pointer font-semibold">{L("What a device sends")}</summary>
            <pre className="mt-2 overflow-x-auto rounded-md bg-[#1d2847] p-3 text-[12px] text-[#e7eaf6]">{`POST /api/ingest
{
  "deviceId": "node-07",
  "sensorId": "radhaganj-handpump-1",
  "value": 12.40,
  "ts": 1763520000,
  "sig": HMAC_SHA256(secret,
    "node-07|radhaganj-handpump-1|12.40|1763520000")
}`}</pre>
          </details>
        </section>
      </div>


      <section className="mt-12 border-t border-[var(--line)] pt-8" aria-labelledby="all">
        <div className="pb-2">
          <h2 id="all" className="text-[24px]">All sensors ({readings.length})</h2>
          <p className="text-[13px] text-[var(--slate)]">{L("Use the sensor ID in the firmware or simulator. Click an ID to copy it.")}</p>
        </div>
        <div className="max-h-[420px] overflow-auto">
          <table className="data-table min-w-[640px]">
            <thead className="sticky top-0 bg-[var(--paper)]"><tr><th>{L("Sensor ID")}</th><th>{L("Village")}</th><th>{L("Reading")}</th><th>{L("Status")}</th><th>{L("Source")}</th></tr></thead>
            <tbody>
              {readings.map((r) => (
                <tr key={r.sensor.id}>
                  <td><button className="text-left font-medium hover:underline" onClick={() => copy(r.sensor.id)}><code className="text-[13px]">{r.sensor.id}</code>{copied === r.sensor.id && <span className="ml-2 text-[12px] text-[var(--paddy)]">{L("Copied")}</span>}</button></td>
                  <td>{villageById(r.sensor.villageId)?.name}</td>
                  <td className="num">{r.value.toFixed(r.sensor.type === "river" ? 2 : 1)} {r.unit}</td>
                  <td className="text-[14px] font-semibold" style={{ color: r.ok ? (r.warn ? "#7d5208" : "var(--paddy)") : "var(--sindoor)" }}>{r.ok ? (r.warn ? "Watch" : "Working") : "Problem"}</td>
                  <td className="text-[13px]" style={{ color: r.source === "device" ? "var(--river)" : "var(--slate)" }}>{r.source === "device" ? <b>{L("ESP32 signed")}</b> : "Simulated"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
