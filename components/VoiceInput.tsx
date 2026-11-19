"use client";

import { useEffect, useRef, useState } from "react";
import { L } from "@/lib/phrases";
import type { Lang, ReportCategory } from "@/lib/types";

const SPEECH_LANG: Record<Lang, string> = { en: "en-IN", bn: "bn-IN", hi: "hi-IN" };
const LANG_LABEL: Record<Lang, string> = { bn: "বাংলা", hi: "हिंदी", en: "English" };
const MAX_SECONDS = 60;

/** Words in Bengali, Hindi and English that point to a problem type */
const KEYWORDS: [ReportCategory, string[]][] = [
  ["handpump", ["নলকূপ", "টিউবওয়েল", "কল", "হ্যান্ডপাম্প", "हैंडपंप", "नल", "चापाकल", "handpump", "hand pump", "tube well", "tubewell"]],
  ["streetlight", ["পথবাতি", "আলো", "লাইট", "বাতি", "अँधेरा", "स्ट्रीटलाइट", "बत्ती", "लाइट", "streetlight", "street light", "light", "dark", "অন্ধকার"]],
  ["bin", ["আবর্জনা", "ডাস্টবিন", "ময়লা", "নোংরা", "कूड़ा", "कचरा", "गंदगी", "garbage", "bin", "rubbish", "waste", "dustbin"]],
  ["tank", ["জল নেই", "জল আসছে না", "ট্যাঙ্ক", "পানি", "पानी नहीं", "टंकी", "पानी", "water", "tank", "tap", "জল"]],
];

export function guessCategory(text: string): ReportCategory | null {
  const t = text.toLowerCase();
  for (const [cat, words] of KEYWORDS) if (words.some((w) => t.includes(w.toLowerCase()))) return cat;
  return null;
}

// Minimal typing for the browser speech API (Chrome and Edge, including Android)
interface SpeechRec {
  lang: string; continuous: boolean; interimResults: boolean;
  onresult: ((e: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void; stop: () => void;
}

function getRecognizer(): SpeechRec | null {
  if (typeof window === "undefined") return null;
  const W = window as unknown as { SpeechRecognition?: new () => SpeechRec; webkitSpeechRecognition?: new () => SpeechRec };
  const C = W.SpeechRecognition ?? W.webkitSpeechRecognition;
  return C ? new C() : null;
}

/**
 * Speak a report instead of typing it. Speech becomes text in Bengali, Hindi or English
 * (where the browser supports it), and the recording is kept as a voice note for the panchayat.
 */
export default function VoiceInput({ lang, onText, onAudio, onCategory }: {
  lang: Lang;
  onText: (t: string) => void;
  onAudio: (dataUrl: string | undefined) => void;
  onCategory: (c: ReportCategory) => void;
}) {
  const [speechLang, setSpeechLang] = useState<Lang>(lang);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [audio, setAudio] = useState<string | undefined>();
  const [note, setNote] = useState<string | null>(null);
  const [supportsSpeech, setSupportsSpeech] = useState(true);
  const recRef = useRef<SpeechRec | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const finalText = useRef("");

  useEffect(() => { setSpeechLang(lang); }, [lang]);
  useEffect(() => { setSupportsSpeech(!!getRecognizer()); }, []);
  useEffect(() => () => stop(), []); // eslint-disable-line react-hooks/exhaustive-deps

  async function start() {
    setNote(null);
    finalText.current = "";
    // 1. Voice note (works in every modern browser)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      mr.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks, { type: mr.mimeType || "audio/webm" });
        const reader = new FileReader();
        reader.onload = () => { setAudio(reader.result as string); onAudio(reader.result as string); };
        reader.readAsDataURL(blob);
      };
      mr.start();
      mediaRef.current = mr;
    } catch {
      setNote(L("Microphone permission was denied. Allow the microphone in your browser settings to record."));
      return;
    }
    // 2. Live speech to text, where the browser supports it
    const rec = getRecognizer();
    if (rec) {
      rec.lang = SPEECH_LANG[speechLang];
      rec.continuous = true;
      rec.interimResults = true;
      rec.onresult = (e) => {
        let interim = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const r = e.results[i];
          if (r.isFinal) finalText.current += r[0].transcript + " ";
          else interim += r[0].transcript;
        }
        const full = (finalText.current + interim).trim();
        onText(full);
        const c = guessCategory(full);
        if (c) onCategory(c);
      };
      rec.onerror = (e) => {
        if (e.error === "network") setNote(L("Speech to text needs internet. Your voice note is still saved."));
        else if (e.error !== "no-speech" && e.error !== "aborted") setNote(L("Could not turn speech into text. Your voice note is still saved."));
      };
      try { rec.start(); recRef.current = rec; } catch { /* already started */ }
    }
    setRecording(true);
    setSeconds(0);
    timerRef.current = setInterval(() => setSeconds((s) => {
      if (s + 1 >= MAX_SECONDS) stop();
      return s + 1;
    }), 1000);
  }

  function stop() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    try { recRef.current?.stop(); } catch { /* ignore */ }
    recRef.current = null;
    if (mediaRef.current && mediaRef.current.state !== "inactive") mediaRef.current.stop();
    mediaRef.current = null;
    setRecording(false);
  }

  return (
    <div className="mt-4 rounded-lg border border-[var(--line)] bg-[var(--paper)] p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[14px] font-semibold">{L("Speak your report")}</span>
        <div className="flex overflow-hidden rounded-full border border-[var(--line)] text-[14px]" role="radiogroup" aria-label={L("Speaking language")}>
          {(["bn", "hi", "en"] as Lang[]).map((l) => (
            <button key={l} type="button" role="radio" aria-checked={speechLang === l} disabled={recording} onClick={() => setSpeechLang(l)}
              className={`min-h-[40px] px-3 ${speechLang === l ? "bg-[var(--ink)] text-[var(--card)]" : "bg-[var(--card)]"}`} lang={l}>
              {LANG_LABEL[l]}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button type="button" onClick={recording ? stop : start} aria-pressed={recording}
          className={`btn !min-h-[52px] !rounded-full !px-5 ${recording ? "btn-danger" : "btn-primary"}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            {recording ? <rect x="7" y="7" width="10" height="10" rx="1.5" fill="currentColor" /> : <><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></>}
          </svg>
          {recording ? `${L("Stop")} 0:${String(seconds).padStart(2, "0")}` : audio ? L("Record again") : L("Tap and speak")}
        </button>
        {recording && <span className="live-dot !bg-[var(--sindoor)]" aria-hidden />}
        {audio && !recording && (
          <>
            <audio controls src={audio} className="h-10 max-w-full" />
            <button type="button" className="text-[14px] font-semibold text-[var(--sindoor)] hover:underline" onClick={() => { setAudio(undefined); onAudio(undefined); }}>{L("Remove")}</button>
          </>
        )}
      </div>
      <p className="mt-2 text-[13px] text-[var(--slate)]" aria-live="polite">
        {note ?? (supportsSpeech
          ? L("Your words appear in the box as you speak. The recording is attached as a voice note.")
          : L("This browser cannot turn speech into text, but your voice note will be attached."))}
      </p>
    </div>
  );
}
