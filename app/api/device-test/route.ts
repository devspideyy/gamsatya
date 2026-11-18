import { SENSORS } from "@/lib/data";
import { signatureFor } from "@/lib/device";
import { ingest } from "@/lib/ingest";

export const dynamic = "force-dynamic";

/** Typical healthy value for each sensor type, as a just-repaired device would report. */
function healthyValue(sensorId: string) {
  const type = SENSORS.find((s) => s.id === sensorId)?.type;
  const r = Math.random();
  switch (type) {
    case "handpump": return 11 + r * 2.5;
    case "streetlight": return 17 + r * 3;
    case "tank": return 70 + r * 10;
    case "bin": return 30 + r * 15;
    case "river": return 3.2 + r * 0.3;
    default: return r * 100;
  }
}

/**
 * Acts as a virtual ESP32 for demos without hardware: the server signs the reading
 * with the device secret and runs it through the same check as a real device.
 * Send { forge: true } to see a reading with a bad signature get rejected.
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { sensorId?: string; value?: number; forge?: boolean };
  const sensorId = body.sensorId ?? "radhaganj-handpump-1";
  const value = Number((body.value ?? healthyValue(sensorId)).toFixed(2));
  const deviceId = body.forge ? "unknown-device" : "virtual-esp32";
  const ts = Math.floor(Date.now() / 1000);
  const sig = body.forge ? "f".repeat(64) : signatureFor(deviceId, sensorId, value, ts);
  const result = ingest({ deviceId, sensorId, value, ts, sig });
  return Response.json(result.body, { status: result.status });
}
