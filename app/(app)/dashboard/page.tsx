"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSim } from "@/components/SimProvider";
import VillageScorecard from "@/components/VillageScorecard";
import BlockOverview from "@/components/BlockOverview";

export default function DashboardPage() {
  const { role, villageId } = useSim();
  const router = useRouter();

  useEffect(() => {
    if (role === "citizen") router.replace(`/v/${villageId}`);
  }, [role, villageId, router]);

  if (role === "panchayat") return <VillageScorecard villageId={villageId} />;
  if (role === "block" || role === "district") return <BlockOverview />;
  return null;
}
