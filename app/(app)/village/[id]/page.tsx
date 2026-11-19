"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import VillageScorecard from "@/components/VillageScorecard";
import { villageById } from "@/lib/data";
import { L } from "@/lib/phrases";

export default function VillagePage() {
  const { id } = useParams<{ id: string }>();
  if (!villageById(id)) {
    return (
      <div className="panel p-6">
        <h1 className="text-[22px]">{L("No village with this ID")}</h1>
        <p className="mt-1 text-[var(--slate)]">{L("Check the link, or open the block dashboard to pick a village.")}</p>
        <Link href="/dashboard" className="btn btn-primary mt-4">{L("Open dashboard")}</Link>
      </div>
    );
  }
  return <VillageScorecard villageId={id} officer />;
}
