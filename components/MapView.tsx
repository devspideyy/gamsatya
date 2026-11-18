"use client";

import dynamic from "next/dynamic";
export type { MapPoint } from "./MapInner";

const MapView = dynamic(() => import("./MapInner"), {
  ssr: false,
  loading: () => <div className="h-[340px] w-full animate-pulse rounded-[10px] bg-[#ebe3d2]" />,
});

export default MapView;
