import { ingest, recentReadings } from "@/lib/ingest";

export const dynamic = "force-dynamic";

/** Latest readings received from devices, newest first. */
export async function GET() {
  return Response.json({ recent: recentReadings() }, { headers: { "Cache-Control": "no-store" } });
}

/** Devices (ESP32 or scripts/device-sim.mjs) post signed readings here. */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "Body must be JSON" }, { status: 400 });
  }
  const result = ingest(body);
  return Response.json(result.body, { status: result.status });
}
