import { SENSORS } from "./data";
import { safeEqualHex, signatureFor } from "./device";

export interface StoredReading {
  deviceId: string;
  sensorId: string;
  value: number;
  ts: number;
  deviceTs: number | string;
  verified: boolean;
}

// In-memory store, fine for demos. Production would write to a database (e.g. Postgres).
const g = globalThis as unknown as { __gramsatyaReadings?: StoredReading[] };
const store = (g.__gramsatyaReadings ??= []);

export function recentReadings(limit = 50) {
  return store.slice(0, limit);
}

export type IngestResult =
  | { status: 200; body: { ok: true; verified: true; reading: StoredReading } }
  | { status: 400 | 401 | 404; body: { ok: false; verified?: false; error: string; reading?: StoredReading } };

export function ingest(body: Record<string, unknown>): IngestResult {
  const deviceId = String(body.deviceId ?? "");
  const sensorId = String(body.sensorId ?? "");
  const value = Number(body.value);
  const deviceTs = (body.ts as number | string | undefined) ?? "";
  const sig = String(body.sig ?? "").toLowerCase();

  if (!deviceId || !sensorId || !Number.isFinite(value)) {
    return { status: 400, body: { ok: false, error: "deviceId, sensorId and a numeric value are required" } };
  }
  if (!SENSORS.some((s) => s.id === sensorId)) {
    return { status: 404, body: { ok: false, error: `Unknown sensorId "${sensorId}". See the Devices page for valid IDs.` } };
  }
  const verified = /^[0-9a-f]{64}$/.test(sig) && safeEqualHex(sig, signatureFor(deviceId, sensorId, value, deviceTs));
  const reading: StoredReading = { deviceId, sensorId, value, ts: Date.now(), deviceTs, verified };
  store.unshift(reading);
  if (store.length > 200) store.length = 200;
  return verified
    ? { status: 200, body: { ok: true, verified: true, reading } }
    : { status: 401, body: { ok: false, verified: false, error: "Signature check failed. The reading is logged but not used.", reading } };
}
