import { ollamaAnalyse, type AIResponse } from "./ollama";
import { geminiAnalyse } from "./gemini";
import type { ProjectStep } from "@/lib/db/schema";
export type { AIResponse };

const MAX_IMAGE_SIZE_KB = parseInt(process.env.MAX_IMAGE_SIZE_KB ?? "2048");

export function buildPrompt(step: ProjectStep, totalSteps: number, userPrompt?: string): string {
  const baseContext = `You are an AI assembly guide assistant analyzing a live camera feed. Speak naturally as if talking directly to the user.

CURRENT STEP: ${step.step_number} of ${totalSteps}
STEP TITLE: ${step.title}
INSTRUCTION: ${step.instruction}
VISUAL CUES TO LOOK FOR: ${step.visual_cues.join(", ")}
${step.ai_prompt_hint ? `SPECIFIC CHECK: ${step.ai_prompt_hint}` : ""}`;

  if (userPrompt) {
    return `${baseContext}

USER QUESTION: ${userPrompt}

Analyze the image and answer the user's question in a conversational, helpful tone. Start by describing what you see in the camera, then answer their specific question. Be specific about components, positions, and connections. Keep it concise but informative - this will be read aloud to the user.`;
  }

  return `${baseContext}

Describe what you see in the camera feed in a natural, conversational way. Tell the user:
1) What components or parts you can identify in the image
2) Whether the current step appears complete or what's missing
3) What they should do next
4) Any mistakes or issues you notice

Speak as if you're guiding them in person. This will be read aloud, so be clear and concise.`;
}

export function validateImageSize(base64: string): { valid: boolean; sizeKb: number } {
  const sizeKb = Math.round((base64.length * 3) / 4 / 1024);
  return { valid: sizeKb <= MAX_IMAGE_SIZE_KB, sizeKb };
}

export async function analyseFrame(imageBase64: string, prompt: string): Promise<AIResponse> {
  const provider = process.env.AI_PROVIDER ?? "ollama";
  try {
    if (provider === "gemini") return await geminiAnalyse(imageBase64, prompt);
    return await ollamaAnalyse(imageBase64, prompt);
  } catch (error) {
    console.error(`AI provider '${provider}' failed:`, error);
    return { guidance: "Could not analyse the image. Please try again or proceed manually.", confidence: 0, stepDetected: null, meta: { responseMs: 0, provider: `${provider}/error` } };
  }
}

export function isSufficientConfidence(confidence: number): boolean {
  return confidence >= 0.65;
}
