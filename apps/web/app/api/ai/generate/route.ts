import { NextRequest } from "next/server";
import { aiGenerationSchema } from "@scheduler/common";
import { generateAiContent } from "@scheduler/api";
import { success, handleError } from "../../_lib/errors";
import { requireUser } from "@api-lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    await requireUser(req); // ensure authenticated
    const body = await req.json();
    const payload = aiGenerationSchema.parse(body);

    const result = await generateAiContent({
      prompt: payload.prompt,
      tone: payload.tone,
      platform: payload.platform,
      language: payload.language,
      wordCount: payload.wordCount,
      hashtags: payload.hashtags,
      includeImagePrompt: Boolean(payload.imagePrompt),
    });

    return success(result);
  } catch (error) {
    return handleError(error);
  }
}
