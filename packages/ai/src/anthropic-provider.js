"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnthropicProvider = void 0;
const sdk_1 = require("@anthropic-ai/sdk");
class AnthropicProvider {
    name = "anthropic";
    supportsImages = false;
    client;
    constructor(apiKey) {
        this.client = new sdk_1.Anthropic({ apiKey });
    }
    async generateCopy(request) {
        const tone = request.tone ?? "friendly";
        const platform = request.platform ?? "GENERAL";
        const prompt = `Create ${request.wordCount ?? 200}-word ${platform} post variations in a ${tone} tone for the following brief: ${request.prompt}`;
        const response = await this.client.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 1000,
            temperature: 0.7,
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: `${prompt}\nProvide JSON with key "variations" (array with text + hashtags).`,
                        },
                    ],
                },
            ],
        });
        const text = response.content
            .filter((item) => item.type === "text")
            .map((item) => ("text" in item ? item.text : ""))
            .join("\n");
        const parsed = JSON.parse(text);
        const result = {
            variations: parsed.variations ?? [],
        };
        return result;
    }
}
exports.AnthropicProvider = AnthropicProvider;
