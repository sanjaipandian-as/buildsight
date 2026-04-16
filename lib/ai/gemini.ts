import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AIResponse } from "./ollama";

let client: GoogleGenerativeAI | null = null;
function getClient() {
  if (!client) client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  return client;
}

export async function geminiAnalyse(imageBase64: string, prompt: string): Promise<AIResponse> {
  const start = Date.now();
  const model = getClient().getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent([{ inlineData: { data: imageBase64, mimeType: "image/jpeg" } }, prompt]);
  const text = result.response.text();
  const usage = result.response.usageMetadata;
  return { guidance: text, confidence: parseConf(text), stepDetected: parseStep(text), meta: { promptTokens: usage?.promptTokenCount, responseMs: Date.now() - start, provider: "gemini/gemini-1.5-flash" } };
}

function parseConf(t: string): number {
  const m = t.match(/confidence[:\s]+(\d+(?:\.\d+)?)/i);
  if (m) return Math.min(1, parseFloat(m[1]) / 100);
  if (/correct|done|complete|great|perfect/i.test(t)) return 0.88;
  return 0.72;
}

function parseStep(t: string): number | null {
  const m = t.match(/step\s*(\d+)/i);
  return m ? parseInt(m[1]) : null;
}
