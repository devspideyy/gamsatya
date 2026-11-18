#!/usr/bin/env node
// Pretends to be an ESP32 sensor node. Signs readings exactly like the firmware does.
//
// Usage:
//   node scripts/device-sim.mjs --url http://localhost:3000 --sensor radhaganj-handpump-1
//   node scripts/device-sim.mjs --sensor haripur-char-river-1 --value 4.8      (fixed value)
//   node scripts/device-sim.mjs --bad-signature                                (shows rejection)
//
// Options: --url, --sensor, --device, --value, --every (seconds), --count, --secret, --bad-signature

import { createHmac } from "node:crypto";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, arr) => {
    if (a.startsWith("--")) acc.push([a.slice(2), arr[i + 1] && !arr[i + 1].startsWith("--") ? arr[i + 1] : "true"]);
    return acc;
  }, []),
);

const url = (args.url || "http://localhost:3000").replace(/\/$/, "");
const sensorId = args.sensor || "radhaganj-handpump-1";
const deviceId = args.device || "node-" + sensorId.split("-").slice(-2).join("");
const secret = args.secret || process.env.DEVICE_SECRET || "gramsatya-demo-secret";
const every = Number(args.every || 3) * 1000;
const count = Number(args.count || 0);
const bad = args["bad-signature"] === "true";

function valueFor() {
  if (args.value !== undefined) return Number(args.value);
  const t = sensorId.split("-").slice(-2, -1)[0];
  const r = Math.random();
  if (t === "handpump") return 11 + r * 2.5;      // L/min, repaired pump
  if (t === "streetlight") return 17 + r * 3;    // watts, light is on
  if (t === "tank") return 70 + r * 10;          // % full
  if (t === "bin") return 30 + r * 15;           // % full
  if (t === "river") return 3.2 + r * 0.3;       // metres
  return r * 100;
}

let sent = 0;
async function send() {
  const value = Number(valueFor().toFixed(2));
  const ts = Math.floor(Date.now() / 1000);
  const msg = `${deviceId}|${sensorId}|${value.toFixed(2)}|${ts}`;
  const sig = bad ? "0".repeat(64) : createHmac("sha256", secret).update(msg).digest("hex");
  try {
    const res = await fetch(`${url}/api/ingest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceId, sensorId, value, ts, sig }),
    });
    const data = await res.json();
    console.log(`${new Date().toLocaleTimeString()}  ${sensorId} = ${value.toFixed(2)}  ->  ${res.status} ${data.verified ? "signature OK" : data.error || "rejected"}`);
  } catch (e) {
    console.error(`Could not reach ${url}: ${e.message}`);
  }
  sent++;
  if (count && sent >= count) process.exit(0);
}

console.log(`Device ${deviceId} sending ${sensorId} to ${url} every ${every / 1000}s. Press Ctrl+C to stop.`);
send();
setInterval(send, every);
