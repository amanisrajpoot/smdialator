import { AiOrchestrator, type AiGenerationRequest } from "@scheduler/ai";
import { env } from "../config/env";

let orchestrator: AiOrchestrator | null = null;

function getOrchestrator() {
  if (!orchestrator) {
    if (!env.OPENAI_API_KEY && !env.ANTHROPIC_API_KEY) {
      throw new Error("AI providers are not configured. Set OPENAI_API_KEY or ANTHROPIC_API_KEY.");
    }
    orchestrator = new AiOrchestrator({
      openAiApiKey: env.OPENAI_API_KEY,
      anthropicApiKey: env.ANTHROPIC_API_KEY,
    });
  }
  return orchestrator;
}

export function listAiProviders() {
  return getOrchestrator().listProviders();
}

export async function generateAiContent(request: AiGenerationRequest) {
  return getOrchestrator().generate(request);
}
