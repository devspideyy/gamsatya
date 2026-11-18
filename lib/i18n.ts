import type { Lang } from "./types";

const DICT = {
  dashboard: { en: "Scorecard", bn: "স্কোরকার্ড" },
  myVillage: { en: "My village", bn: "আমার গ্রাম" },
  assets: { en: "Ponds", bn: "জলাশয়" },
  alerts: { en: "Alerts", bn: "সতর্কবার্তা" },
  reports: { en: "Reports", bn: "অভিযোগ" },
  report: { en: "Report a problem", bn: "সমস্যা জানান" },
  ledger: { en: "Ledger", bn: "খতিয়ান" },
  funds: { en: "Funds", bn: "তহবিল" },
  devices: { en: "Devices", bn: "ডিভাইস" },
  villages: { en: "Villages", bn: "গ্রামসমূহ" },
  switchRole: { en: "Switch role", bn: "ভূমিকা বদলান" },
  villageScore: { en: "Village score", bn: "গ্রাম স্কোর" },
  dataTrust: { en: "Data trust", bn: "তথ্যের বিশ্বাসযোগ্যতা" },
  offline: { en: "You are offline. Reports are saved on this phone and sync later.", bn: "আপনি অফলাইনে আছেন। অভিযোগ এই ফোনে জমা থাকবে, পরে পাঠানো হবে।" },
  citizen: { en: "Citizen", bn: "নাগরিক" },
  panchayat: { en: "Panchayat secretary", bn: "পঞ্চায়েত সচিব" },
  block: { en: "Block officer", bn: "ব্লক আধিকারিক" },
  district: { en: "District officer", bn: "জেলা আধিকারিক" },
  sos: { en: "Send SOS", bn: "জরুরি সাহায্য চান" },
  listen: { en: "Listen", bn: "শুনুন" },
} as const;

export type DictKey = keyof typeof DICT;

export function translate(key: DictKey, lang: Lang) {
  return DICT[key][lang];
}
