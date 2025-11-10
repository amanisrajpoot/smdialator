"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiOrchestrator = void 0;
const openai_provider_1 = require("./openai-provider");
const anthropic_provider_1 = require("./anthropic-provider");
class AiOrchestrator {
    providers = [];
    constructor(options) {
        if (options.openAiApiKey) {
            this.providers.push(new openai_provider_1.OpenAiProvider(options.openAiApiKey));
        }
        if (options.anthropicApiKey) {
            this.providers.push(new anthropic_provider_1.AnthropicProvider(options.anthropicApiKey));
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
    async generate(request) {
        for (const provider of this.providers) {
            try {
                const result = await provider.generateCopy(request);
                if (result.variations.length > 0) {
                    return result;
                }
            }
            catch (error) {
                // proceed to next provider
                if (this.providers.indexOf(provider) === this.providers.length - 1) {
                    throw error;
                }
            }
        }
        throw new Error("No AI providers were able to generate content");
    }
}
exports.AiOrchestrator = AiOrchestrator;
