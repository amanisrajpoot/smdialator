import { OpenAiProvider } from "./openai-provider";
import { AnthropicProvider } from "./anthropic-provider";
import type { AiGenerationRequest, AiGenerationResult, AiProvider } from "./types";

export interface AiOrchestratorOptions {
  openAiApiKey?: string;
  anthropicApiKey?: string;
}

export class AiOrchestrator {
  private providers: AiProvider[] = [];

  constructor(options: AiOrchestratorOptions) {
    if (options.openAiApiKey) {
      this.providers.push(new OpenAiProvider(options.openAiApiKey));
    }
    if (options.anthropicApiKey) {
      this.providers.push(new AnthropicProvider(options.anthropicApiKey));
    }

    if (this.providers.length === 0) {
      throw new Error("At least one AI provider API key must be configured");
    }
  }

  listProviders() {
    return this.providers.map((provider) => ({
      name: provider.name,
      supportsImages: provider.supportsImages,
    }));
  }

  async generate(request: AiGenerationRequest): Promise<AiGenerationResult> {
    for (const provider of this.providers) {
      try {
        const result = await provider.generateCopy(request);
        if (result.variations.length > 0) {
          return result;
        }
      } catch (error) {
        // proceed to next provider
        if (this.providers.indexOf(provider) === this.providers.length - 1) {
          throw error;
        }
      }
    }

    throw new Error("No AI providers were able to generate content");
  }
}
