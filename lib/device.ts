import { createHmac, timingSafeEqual } from "node:crypto";

const SECRET = process.env.DEVICE_SECRET || "gramsatya-demo-secret";

/** Message format shared by the ESP32 firmware and the device simulator. */
export function signatureFor(deviceId: string, sensorId: string, value: number, ts: number | string) {
  return createHmac("sha256", SECRET).update(`${deviceId}|${sensorId}|${value.toFixed(2)}|${ts}`).digest("hex");
}

export function safeEqualHex(a: string, b: string) {
  const x = Buffer.from(a, "hex"), y = Buffer.from(b, "hex");
  return x.length === y.length && x.length > 0 && timingSafeEqual(x, y);
}
