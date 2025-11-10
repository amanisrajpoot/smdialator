import { Router } from "express";
import { aiGenerationSchema } from "@scheduler/common";
import { authenticate } from "../../middleware/authenticate";
import { generateAiContent, listAiProviders } from "../../services/ai.service";

export const aiRouter = Router();

aiRouter.get("/providers", authenticate, (_req, res, next) => {
  try {
    const providers = listAiProviders();
    res.json({
      success: true,
      data: providers,
    });
  } catch (error) {
    next(error);
  }
});

aiRouter.post("/generate", authenticate, async (req, res, next) => {
  try {
    const payload = aiGenerationSchema.parse(req.body);
    const result = await generateAiContent({
      prompt: payload.prompt,
      tone: payload.tone,
      platform: payload.platform,
      language: payload.language,
      wordCount: payload.wordCount,
      hashtags: payload.hashtags,
      includeImagePrompt: Boolean(payload.imagePrompt),
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});
