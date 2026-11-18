import { activeProvider, complete, extractJson } from "@/lib/ai";
import { Action, Insight, InsightContext, promptFor, ruleInsights } from "@/lib/insights";

export const dynamic = "force-dynamic";

export async function GET() {
  const { provider, model } = activeProvider();
  return Response.json({ provider, model });
}

function clean(raw: unknown): Omit<Insight, "source"> | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.summaryEn !== "string" || !Array.isArray(r.actions)) return null;
  const actions: Action[] = (r.actions as Record<string, unknown>[])
    .filter((a) => a && typeof a.en === "string")
    .slice(0, 6)
    .map((a) => ({
      en: String(a.en),
      bn: typeof a.bn === "string" ? a.bn : String(a.en),
      priority: a.priority === "high" || a.priority === "low" ? a.priority : "medium",
    }));
  return { summaryEn: r.summaryEn, summaryBn: typeof r.summaryBn === "string" ? r.summaryBn : r.summaryEn, actions };
}

export async function POST(req: Request) {
  let ctx: InsightContext;
  try {
    ctx = (await req.json()) as InsightContext;
    if (!ctx?.snap?.village) throw new Error("bad body");
  } catch {
    return Response.json({ error: "Send { snap, openReports } as JSON" }, { status: 400 });
  }

  const { provider, model } = activeProvider();
  const fallback = ruleInsights(ctx);
  if (provider === "rules") return Response.json(fallback);

  try {
    const text = await complete(promptFor(ctx));
    const parsed = clean(extractJson(text));
    if (!parsed) throw new Error("Reply was not in the expected format");
    return Response.json({ ...parsed, source: `${provider} (${model})` } satisfies Insight);
  } catch (e) {
    const reason = e instanceof Error ? e.message : "unknown error";
    return Response.json({ ...fallback, source: `Built-in rules, because ${provider} failed: ${reason}` } satisfies Insight);
  }
}
