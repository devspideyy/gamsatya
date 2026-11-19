export type Role = "citizen" | "panchayat" | "block" | "district";
export type Lang = "en" | "bn" | "hi";

export type ReportCategory = "handpump" | "streetlight" | "bin" | "tank" | "other";

export interface CitizenReport {
  id: string;
  villageId: string;
  category: ReportCategory;
  text: string;
  photo?: string;
  /** Voice note recorded by the villager */
  audio?: string;
  lat?: number;
  lng?: number;
  ts: number;
  status: "Open" | "In progress" | "Resolved";
  check: "confirmed" | "not-confirmed" | "no-sensor";
  matchedSensor?: string;
  savedOffline?: boolean;
}

export type AlertKind = "Cyclone" | "Flood" | "Heatwave" | "Evacuate";

export interface Delivery {
  node: string;
  villageId: string;
  status: "Sending" | "Delivered" | "No reply";
}

export interface VillageAlert {
  id: string;
  ts: number;
  villageIds: string[];
  kind: AlertKind;
  en: string;
  bn: string;
  source: "Manual" | "Auto (river gauge)";
  deliveries: Delivery[];
}

export interface SosStep {
  label: string;
  detail: string;
  /** ms after the SOS was raised */
  after: number;
  ok: boolean;
}

export interface Sos {
  id: string;
  ts: number;
  villageId: string;
  text: string;
  status: "New" | "Help sent" | "Safe";
  /** How the SOS travelled: internet, LoRa, SMS, control room */
  path: SosStep[];
}

export type IncidentKind = "Flood" | "Fire";
export type Stage = "watch" | "warning" | "emergency" | "resolved";

export interface Incident {
  id: string;
  kind: IncidentKind;
  villageId: string;
  /** When each stage was first reached */
  stages: Partial<Record<Stage, number>>;
  /** Response team and when it was assigned */
  responder?: { team: string; at: number };
  notes: { ts: number; text: string }[];
}

export const ALERT_TEMPLATES: Record<AlertKind, { en: string; bn: string }> = {
  Cyclone: {
    en: "Cyclone warning: a severe storm may hit within 24 hours. Get ready to move to the nearest cyclone shelter.",
    bn: "ঘূর্ণিঝড় সতর্কতা: আগামী ২৪ ঘণ্টার মধ্যে প্রবল ঝড় আসতে পারে। নিকটবর্তী আশ্রয়কেন্দ্রে যাওয়ার প্রস্তুতি নিন।",
  },
  Flood: {
    en: "Flood warning: the river has crossed the danger level. Leave low-lying areas and move to high ground or a shelter.",
    bn: "বন্যা সতর্কতা: নদীর জলস্তর বিপদসীমা ছাড়িয়েছে। নিচু এলাকা ছেড়ে উঁচু জায়গায় বা আশ্রয়কেন্দ্রে যান।",
  },
  Heatwave: {
    en: "Heatwave alert: avoid going out between 12 noon and 3 pm. Drink plenty of water.",
    bn: "তাপপ্রবাহ সতর্কতা: দুপুর ১২টা থেকে ৩টে পর্যন্ত বাইরে যাবেন না। প্রচুর জল পান করুন।",
  },
  Evacuate: {
    en: "Emergency: move to the shelter now. Help the elderly and children first.",
    bn: "জরুরি: এখনই আশ্রয়কেন্দ্রে চলে যান। বয়স্ক ও শিশুদের আগে সরিয়ে নিন।",
  },
};

export const CATEGORY_LABEL: Record<ReportCategory, { en: string; bn: string; hi: string }> = {
  handpump: { en: "Handpump not working", bn: "নলকূপ খারাপ", hi: "हैंडपंप ख़राब" },
  streetlight: { en: "Streetlight off", bn: "পথবাতি বন্ধ", hi: "स्ट्रीटलाइट बंद" },
  bin: { en: "Garbage not collected", bn: "আবর্জনা জমে আছে", hi: "कूड़ा नहीं उठा" },
  tank: { en: "No water supply", bn: "জল সরবরাহ নেই", hi: "पानी की आपूर्ति नहीं" },
  other: { en: "Something else", bn: "অন্য সমস্যা", hi: "कोई और समस्या" },
};
