import OpenAI from "openai";
import type { AiGenerationRequest, AiGenerationResult, AiProvider } from "./types";

export class OpenAiProvider implements AiProvider {
  readonly name = "openai";
  readonly supportsImages = true;

  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async generateCopy(request: AiGenerationRequest): Promise<AiGenerationResult> {
    const tone = request.tone ?? "friendly";
    const platform = request.platform ?? "GENERAL";
    const language = request.language ?? "en";
    const wordCount = request.wordCount ?? 200;

    const prompt = [
      `You are an expert social media copywriter.`,
      `Platform: ${platform}`,
      `Tone: ${tone}`,
      `Language: ${language}`,
      `Desired length: ${wordCount} words.`,
      `Prompt: ${request.prompt}`,
      `Return ${Math.max(request.hashtags ?? 5, 3)} relevant hashtags.`,
      `Respond in JSON with fields: variations (array of {text, hashtags[]})`,
      request.includeImagePrompt ? `Also provide an "imagePrompt" suggestion.` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const response = await this.client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "social_post",
          schema: {
            type: "object",
            properties: {
              variations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    text: { type: "string" },
                    hashtags: {
                      type: "array",
                      items: { type: "string" },
                    },
                  },
                  required: ["text", "hashtags"],
                },
              },
              imagePrompt: { type: "string" },
            },
            required: ["variations"],
          },
        },
      },
    });

    const content = response.output_text;
    const parsed = JSON.parse(content);

    const result: AiGenerationResult = {
      variations: parsed.variations ?? [],
      imagePrompt: parsed.imagePrompt,
    };

    return result;
  }
}
