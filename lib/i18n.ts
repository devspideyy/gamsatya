import type { Lang } from "./types";

// English, Bengali and Hindi for navigation and key labels.
const DICT = {
  dashboard: { en: "Scorecard", bn: "স্কোরকার্ড", hi: "स्कोरकार्ड" },
  myVillage: { en: "My village", bn: "আমার গ্রাম", hi: "मेरा गाँव" },
  assets: { en: "Ponds", bn: "জলাশয়", hi: "तालाब" },
  alerts: { en: "Alerts", bn: "সতর্কবার্তা", hi: "चेतावनी" },
  reports: { en: "Reports", bn: "অভিযোগ", hi: "शिकायतें" },
  report: { en: "Report a problem", bn: "সমস্যা জানান", hi: "समस्या बताएँ" },
  ledger: { en: "Ledger", bn: "খতিয়ান", hi: "खाता" },
  funds: { en: "Funds", bn: "তহবিল", hi: "निधि" },
  devices: { en: "Devices", bn: "ডিভাইস", hi: "उपकरण" },
  villages: { en: "Villages", bn: "গ্রামসমূহ", hi: "गाँव" },
  scoreboards: { en: "Rankings", bn: "র‍্যাঙ্কিং", hi: "रैंकिंग" },
  safety: { en: "Safety", bn: "নিরাপত্তা", hi: "सुरक्षा" },
  method: { en: "How the score works", bn: "স্কোর কীভাবে হয়", hi: "स्कोर कैसे बनता है" },
  trust: { en: "Trust and limits", bn: "ভরসা ও সীমা", hi: "भरोसा और सीमाएँ" },
  pilot: { en: "Pilot plan", bn: "পাইলট পরিকল্পনা", hi: "पायलट योजना" },
  switchRole: { en: "Switch role", bn: "ভূমিকা বদলান", hi: "भूमिका बदलें" },
  villageScore: { en: "Village score", bn: "গ্রাম স্কোর", hi: "गाँव स्कोर" },
  dataTrust: { en: "Data trust", bn: "তথ্যের বিশ্বাসযোগ্যতা", hi: "डेटा भरोसा" },
  offline: { en: "You are offline. Reports are saved on this phone and sync later.", bn: "আপনি অফলাইনে আছেন। অভিযোগ এই ফোনে জমা থাকবে, পরে পাঠানো হবে।", hi: "आप ऑफ़लाइन हैं। शिकायतें इस फ़ोन में सहेजी जाएँगी और बाद में भेजी जाएँगी।" },
  citizen: { en: "Citizen", bn: "নাগরিক", hi: "नागरिक" },
  panchayat: { en: "Panchayat secretary", bn: "পঞ্চায়েত সচিব", hi: "पंचायत सचिव" },
  block: { en: "Block officer", bn: "ব্লক আধিকারিক", hi: "प्रखंड अधिकारी" },
  district: { en: "District officer", bn: "জেলা আধিকারিক", hi: "ज़िला अधिकारी" },
  sos: { en: "Send SOS", bn: "জরুরি সাহায্য চান", hi: "मदद माँगें" },
  listen: { en: "Listen", bn: "শুনুন", hi: "सुनें" },
  lowData: { en: "Low data", bn: "কম ডেটা", hi: "कम डेटा" },
} as const;

export type DictKey = keyof typeof DICT;

export function translate(key: DictKey, lang: Lang) {
  return DICT[key][lang];
}

export const LANG_NAME: Record<Lang, string> = { en: "English", bn: "বাংলা", hi: "हिंदी" };
