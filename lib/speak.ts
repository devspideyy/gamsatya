/** Speak text with the browser's built-in voices. Free, no key, works offline if the voice is installed. */
export function speak(text: string, lang: "bn-IN" | "en-IN" = "bn-IN"): { ok: boolean; note?: string } {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return { ok: false, note: "This browser cannot play voice." };
  }
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const voices = synth.getVoices();
  const match = voices.find((v) => v.lang === lang) ?? voices.find((v) => v.lang.startsWith(lang.slice(0, 2)));
  u.lang = lang;
  if (match) u.voice = match;
  u.rate = 0.95;
  synth.speak(u);
  return match || lang === "en-IN" ? { ok: true } : { ok: true, note: "No Bengali voice installed on this device, so the browser may read it with a default voice. On Android Chrome, Bengali usually works." };
}
