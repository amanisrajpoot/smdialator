import type { SocialPlatform } from "@scheduler/common";

export interface AiGenerationRequest {
  prompt: string;
  tone?: "friendly" | "professional" | "bold" | "playful";
  platform?: SocialPlatform;
  language?: string;
  wordCount?: number;
  hashtags?: number;
  includeImagePrompt?: boolean;
}

export interface AiGenerationResult {
  variations: Array<{
    text: string;
    hashtags: string[];
    metadata?: Record<string, unknown>;
  }>;
  imagePrompt?: string;
}

export interface AiProvider {
  name: string;
  supportsImages: boolean;
  generateCopy(request: AiGenerationRequest): Promise<AiGenerationResult>;
}
