// Pluggable AI provider for insights. No provider configured = built-in rules (always works, offline).
//   AI_PROVIDER=ollama  -> OLLAMA_URL (default http://localhost:11434), OLLAMA_MODEL (default llama3.2)
//   AI_PROVIDER=gemini  -> GEMINI_API_KEY, GEMINI_MODEL
//   AI_PROVIDER=openai  -> OPENAI_API_KEY, OPENAI_MODEL, OPENAI_BASE_URL (any OpenAI-compatible API: OpenAI, Groq, OpenRouter, LM Studio)

export type Provider = "ollama" | "gemini" | "openai" | "rules";

export function activeProvider(): { provider: Provider; model: string } {
  const p = (process.env.AI_PROVIDER || "").toLowerCase();
  if (p === "ollama" || (!p && process.env.OLLAMA_URL)) return { provider: "ollama", model: process.env.OLLAMA_MODEL || "llama3.2" };
  if (p === "gemini" || (!p && process.env.GEMINI_API_KEY)) return { provider: "gemini", model: process.env.GEMINI_MODEL || "gemini-2.5-flash" };
  if (p === "openai" || (!p && process.env.OPENAI_API_KEY)) return { provider: "openai", model: process.env.OPENAI_MODEL || "gpt-4o-mini" };
  return { provider: "rules", model: "" };
}

async function withTimeout(url: string, init: RequestInit, ms = 25_000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { ...init, signal: ctrl.signal });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return res;
  } finally {
    clearTimeout(t);
  }
}

export async function complete(prompt: string): Promise<string> {
  const { provider, model } = activeProvider();
  if (provider === "ollama") {
    const base = (process.env.OLLAMA_URL || "http://localhost:11434").replace(/\/$/, "");
    const res = await withTimeout(`${base}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, prompt, stream: false, format: "json" }),
    }, 60_000);
    return ((await res.json()) as { response: string }).response;
  }
  if (provider === "gemini") {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("GEMINI_API_KEY is not set");
    const res = await withTimeout(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json", temperature: 0.3 } }),
    });
    const data = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  }
  if (provider === "openai") {
    const key = process.env.OPENAI_API_KEY;
    const base = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
    const res = await withTimeout(`${base}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(key ? { Authorization: `Bearer ${key}` } : {}) },
      body: JSON.stringify({ model, temperature: 0.3, response_format: { type: "json_object" }, messages: [{ role: "user", content: prompt }] }),
    });
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return data.choices?.[0]?.message?.content ?? "";
  }
  throw new Error("No AI provider configured");
}

/** Pull the first JSON object out of a model reply, even if wrapped in prose or code fences. */
export function extractJson(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("No JSON in reply");
  return JSON.parse(text.slice(start, end + 1));
}
