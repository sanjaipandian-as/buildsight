import { auth } from "@/lib/auth";
import { err, ok, handleError } from "@/lib/response";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ── Ollama text-only (with JSON mode) ─────────────────────────────────────
async function ollamaGenerate(prompt: string): Promise<string> {
  const model = process.env.OLLAMA_TEXT_MODEL ?? process.env.OLLAMA_MODEL ?? "llava";
  const baseUrl = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
  const res = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      stream: false,
      format: "json", // forces Ollama to return valid JSON (supported in Ollama ≥0.1.9)
      messages: [{ role: "user", content: prompt }],
    }),
    signal: AbortSignal.timeout(90_000),
  });
  if (!res.ok) throw new Error(`Ollama error: ${res.status}`);
  const data = await res.json();
  return data.message?.content ?? "";
}

// ── Gemini text-only ───────────────────────────────────────────────────────
async function geminiGenerate(prompt: string): Promise<string> {
  const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = client.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" } as any,
  });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

// ── Robust JSON extraction & repair ───────────────────────────────────────
function extractJSON(raw: string): object {
  // 1. Strip markdown code fences
  let s = raw
    .replace(/^```json\s*/im, "")
    .replace(/^```\s*/im, "")
    .replace(/```\s*$/m, "")
    .trim();

  // 2. Find outermost { … }
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object found in AI response");
  s = s.slice(start, end + 1);

  // 3. Try direct parse first (Gemini / Ollama JSON-mode usually works)
  try {
    return JSON.parse(s);
  } catch (_) {
    // fall through to repair
  }

  // 4. Repair common LLM-generated JSON issues
  s = repairJSON(s);

  // 5. Final parse attempt
  try {
    return JSON.parse(s);
  } catch (e) {
    // Log first 300 chars to help debugging without swamping logs
    console.error("[extractJSON] Failed after repair. Snippet:", s.slice(0, 300));
    throw new Error("AI returned malformed JSON. Please try again.");
  }
}

function repairJSON(s: string): string {
  // ── Phase 1: fix bad escape sequences ─────────────────────────────────
  // Replace bad \' (apostrophe — not a valid JSON escape)
  s = s.replace(/\\'/g, "'");

  // Replace literal tab characters inside strings with \t
  // Replace bad \_ (underscore — not a valid JSON escape)
  s = s.replace(/\\([^"\\/bfnrtu])/g, (_, c) => c);

  // ── Phase 2: fix unescaped quotes/newlines inside string values ────────
  // Walk character-by-character and fix strings
  s = fixStringValues(s);

  return s;
}

/**
 * Walk the JSON-like string and, inside each JSON string value,
 * replace unescaped control characters (newlines, tabs, carriage returns)
 * with their proper escape sequences. This handles LLM responses that
 * write multi-line text literally inside JSON strings.
 */
function fixStringValues(input: string): string {
  let out = "";
  let inString = false;
  let escape = false;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];

    if (escape) {
      // Previous char was backslash — validate the escape char
      const validEscapes = new Set(['"', "\\", "/", "b", "f", "n", "r", "t", "u"]);
      if (validEscapes.has(ch)) {
        out += ch;
      } else {
        // Invalid escape — drop the backslash we already added and emit raw char
        // (we already emitted the backslash so we need to undo it)
        out = out.slice(0, -1) + ch;
      }
      escape = false;
      continue;
    }

    if (ch === "\\" && inString) {
      escape = true;
      out += ch;
      continue;
    }

    if (ch === '"') {
      inString = !inString;
      out += ch;
      continue;
    }

    if (inString) {
      // Replace unescaped control characters
      if (ch === "\n") { out += "\\n"; continue; }
      if (ch === "\r") { out += "\\r"; continue; }
      if (ch === "\t") { out += "\\t"; continue; }
    }

    out += ch;
  }

  return out;
}

// ── Prompt — avoids apostrophes and tricky chars ──────────────────────────
function buildPlanPrompt(userGoal: string): string {
  // Sanitise the goal so it cannot inject JSON-breaking characters into the prompt
  const safeGoal = userGoal.replace(/[\\'"]/g, " ").trim();

  return `You are BuildSight AI. Output ONLY a single valid JSON object. No explanation, no markdown, no extra text.

Task: create a beginner-friendly step-by-step build guide for this goal: ${safeGoal}

Required JSON structure:
{"title":"project title max 60 chars","description":"one sentence summary","category":"electronics","difficulty":"beginner","estMinutes":45,"steps":[{"step_number":1,"title":"step title","instruction":"detailed beginner instruction without apostrophes","visual_cues":["object1","object2"],"ai_prompt_hint":"what camera should verify"}]}

Rules:
- category must be one of: electronics, furniture, mechanical, craft, other
- difficulty must be one of: beginner, intermediate, advanced
- estMinutes must be an integer
- Include 5 to 8 steps
- Write instructions for someone who has never done this before
- Do NOT use apostrophes or single quotes anywhere in the text values
- Do NOT use backslashes in text values
- Do NOT add any text before or after the JSON
- The response must be parseable by JSON.parse()`;
}

// ── Route handler ──────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return err("Unauthorized", 401);

    const body = await req.json();
    const userGoal: string = body.goal?.trim();
    if (!userGoal || userGoal.length < 5) return err("Please describe what you want to build", 400);
    if (userGoal.length > 500) return err("Description too long (max 500 chars)", 400);

    const prompt = buildPlanPrompt(userGoal);

    const provider = process.env.AI_PROVIDER ?? "ollama";
    let raw: string;

    if (provider === "gemini" && process.env.GEMINI_API_KEY) {
      raw = await geminiGenerate(prompt);
    } else {
      raw = await ollamaGenerate(prompt);
    }

    console.log("[generate-steps] raw AI output (first 500):", raw.slice(0, 500));

    const plan = extractJSON(raw) as any;

    // Normalise & validate fields
    if (!plan.title || !Array.isArray(plan.steps) || plan.steps.length === 0) {
      throw new Error("AI returned an incomplete plan. Please try again.");
    }

    // Ensure step_number is correct even if AI forgot
    plan.steps = plan.steps.map((s: any, i: number) => ({
      step_number: s.step_number ?? i + 1,
      title: s.title ?? `Step ${i + 1}`,
      instruction: s.instruction ?? "",
      visual_cues: Array.isArray(s.visual_cues) ? s.visual_cues : [],
      ai_prompt_hint: s.ai_prompt_hint ?? undefined,
    }));

    plan.estMinutes = Number(plan.estMinutes) || 30;

    return ok({ plan });
  } catch (error) {
    console.error("[generate-steps]", error);
    return handleError(error);
  }
}
