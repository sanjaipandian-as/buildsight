export type AIResponse = {
  guidance: string;
  confidence: number;
  stepDetected: number | null;
  meta: { promptTokens?: number; responseMs: number; provider: string };
};

export async function ollamaAnalyse(imageBase64: string, prompt: string): Promise<AIResponse> {
  const start = Date.now();
  const model = process.env.OLLAMA_MODEL ?? "llava";
  const baseUrl = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
  const res = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, stream: false, messages: [{ role: "user", content: prompt, images: [imageBase64] }] }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`Ollama error: ${res.status}`);
  const data = await res.json();
  const text: string = data.message?.content ?? "";
  return { guidance: text, confidence: parseConf(text), stepDetected: parseStep(text), meta: { responseMs: Date.now() - start, provider: `ollama/${model}` } };
}

function parseConf(t: string): number {
  const m = t.match(/confidence[:\s]+(\d+(?:\.\d+)?)/i);
  if (m) return Math.min(1, parseFloat(m[1]) / 100);
  if (/correct|done|complete|great|perfect/i.test(t)) return 0.85;
  if (/incorrect|missing|wrong|not yet/i.test(t)) return 0.75;
  return 0.7;
}

function parseStep(t: string): number | null {
  const m = t.match(/step\s*(\d+)/i);
  return m ? parseInt(m[1]) : null;
}
