"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { useSim } from "@/components/SimProvider";
import { ASSETS, SENSORS, villageById } from "@/lib/data";
import { assetStatus } from "@/lib/sim";
import { timeAgo } from "@/components/ui";
import { L } from "@/lib/phrases";

async function compress(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
    const scale = Math.min(1, 640 / Math.max(img.width, img.height));
    const c = document.createElement("canvas");
    c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
    c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", 0.6);
  } finally { URL.revokeObjectURL(url); }
}

export default function AssetRecord() {
  const { id } = useParams<{ id: string }>();
  const { snaps, ledger, verify, photos, addPhoto, offline } = useSim();
  const [qr, setQr] = useState("");
  const [checking, setChecking] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const sensor = SENSORS.find((s) => s.id === id);
  const pond = ASSETS.find((a) => a.id === id);
  useEffect(() => {
    QRCode.toDataURL(window.location.href, { margin: 1, width: 360, color: { dark: "#1d2847", light: "#fffcf5" } }).then(setQr).catch(() => {});
  }, [id]);

  if (!sensor && !pond) {
    return (
      <div>
        <h1 className="text-[34px]">{L("No asset with this tag")}</h1>
        <p className="mt-2 text-[var(--slate)]">{L("The QR code may be damaged. Ask the panchayat office for the asset number.")}</p>
      </div>
    );
  }

  const villageId = sensor?.villageId ?? pond!.villageId;
  const v = villageById(villageId)!;
  const reading = sensor ? snaps.find((s) => s.village.id === villageId)?.readings.find((r) => r.sensor.id === sensor.id) : undefined;
  const ps = pond ? assetStatus(pond) : undefined;
  const records = sensor ? [...ledger].filter((r) => r.sensorId === sensor.id).reverse().slice(0, 8) : [];
  const brokenHere = !verify.ok && ledger.find((r) => r.i === verify.brokenAt)?.sensorId === sensor?.id;
  const photo = photos[id];
  const isOff = sensor ? offline.includes(sensor.id) : false;

  const status = sensor
    ? isOff ? { t: "Offline, not counted", c: "var(--slate)" } : reading?.ok ? { t: "Working", c: "var(--paddy)" } : { t: "Fault", c: "var(--sindoor)" }
    : { t: ps!.status, c: ps!.status === "Working" ? "var(--river)" : ps!.status === "At risk" ? "#7d5208" : "var(--sindoor)" };

  function addPhotoCheck(file: File) {
    compress(file).then((p) => {
      const save = (lat?: number, lng?: number) => addPhoto(id, { photo: p, lat, lng, ts: Date.now() });
      if (navigator.geolocation) navigator.geolocation.getCurrentPosition((pos) => save(pos.coords.latitude, pos.coords.longitude), () => save(), { timeout: 6000 });
      else save();
    });
  }

  return (
    <div>
      <p className="text-[14px] text-[var(--slate)]">{L("Asset record. Anyone who scans the tag on this asset lands here.")}</p>
      <div className="mt-2 flex flex-wrap items-start justify-between gap-6">
        <div>
          <h1 className="text-[40px] leading-tight">{sensor ? sensor.label : pond!.name}</h1>
          <p className="mt-1 text-[16px] text-[var(--slate)]">
            <Link href={`/v/${v.id}`} className="font-semibold text-[var(--river)] hover:underline">{v.name}</Link>, tag <code>{id}</code>
            {pond && <>, {pond.kind}, {pond.scheme}, built {pond.builtOn}</>}
          </p>
          <p className="mt-4 text-[28px]" style={{ fontFamily: "var(--font-display)", color: status.c }}>{status.t}</p>
          {reading && !isOff && <p className="num text-[18px]">Now {reading.value.toFixed(reading.sensor.type === "river" ? 2 : 1)} {reading.unit}{reading.source === "device" ? ", signed by ESP32" : ""}</p>}
          {ps && <p className="num text-[18px]">{ps.current}% full, held water {ps.workingMonths} of the last 12 months</p>}
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {qr && <img src={qr} alt={`QR tag for ${id}`} width={140} height={140} className="rounded-md border border-[var(--line)]" />}
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <section className="panel p-5" aria-labelledby="chain-h">
          <h2 id="chain-h" className="text-[24px]">{L("Signed readings")}</h2>
          {sensor ? (
            <>
              <button className="btn btn-ghost mt-3" onClick={() => { setChecking(true); setTimeout(() => setChecking(false), 600); }}>{L("Verify chain")}</button>
              <p className="mt-2 text-[15px] font-semibold" style={{ color: brokenHere ? "var(--sindoor)" : verify.ok ? "var(--paddy)" : "#7d5208" }} aria-live="polite">
                {checking ? "Checking…" : brokenHere ? "A past reading of this sensor was edited. Chain broken here." : verify.ok ? `All ${verify.checked} records in the chain are valid.` : `Chain broken elsewhere, at record ${verify.brokenAt}.`}
              </p>
              <ul className="mt-3 text-[14px]">
                {records.length === 0 && <li className="text-[var(--slate)]">{L("No recent records for this sensor in the ledger window.")}</li>}
                {records.map((r) => (
                  <li key={r.i} className="flex justify-between gap-3 border-t border-[var(--line-soft)] py-1.5">
                    <span className="num">{r.value.toFixed(2)}{r.edited ? " (edited)" : ""}</span>
                    <code className="text-[12px] text-[var(--slate)]">{r.hash.slice(0, 12)}</code>
                    <span className="text-[var(--slate)]">{timeAgo(r.ts)}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <ol className="num mt-3 grid grid-cols-6 gap-2 text-center text-[13px]">
              {pond!.levels.map((l, i) => (
                <li key={i} className="rounded-md py-2" style={{ background: l >= 25 ? "var(--river-tint)" : "var(--sindoor-tint)" }}>
                  <span className="block text-[var(--slate)]">{["Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"][i]}</span>{l}%
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="panel p-5" aria-labelledby="photo-h">
          <h2 id="photo-h" className="text-[24px]">{L("Photo check")}</h2>
          <p className="mt-1 text-[15px] text-[var(--slate)]">{L("A villager can add a photo with location. It backs up or questions what the sensor says.")}</p>
          {photo ? (
            <div className="mt-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.photo} alt="Photo check of this asset" className="max-h-56 rounded-md" />
              <p className="mt-2 text-[14px] text-[var(--slate)]">Added {timeAgo(photo.ts)}{photo.lat ? `, at ${photo.lat.toFixed(4)}, ${photo.lng?.toFixed(4)}` : ", location not shared"}.</p>
            </div>
          ) : null}
          <label className="btn btn-primary mt-3 cursor-pointer">
            {photo ? "Replace photo" : "Add a photo"}
            <input ref={fileRef} type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) addPhotoCheck(f); }} />
          </label>
        </section>
      </div>
    </div>
  );
}
