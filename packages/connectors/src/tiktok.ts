import { randomUUID } from "node:crypto";
import type { SocialPlatform } from "@scheduler/common";
import { SocialPlatform as SocialPlatformEnum } from "@scheduler/common";
import { BaseConnector } from "./base";
import { ConnectorFeature, type ConnectorCredentials, type PublishPayload, type PublishResult } from "./types";

/**
 * TikTok's Content Posting API is currently available via approved partners.
 * This connector provides the scaffolding required to integrate with TikTok's
 * upload & publish flow. The actual API calls need developer tokens.
 */
export class TikTokConnector extends BaseConnector {
  constructor() {
    super(SocialPlatformEnum.TIKTOK as SocialPlatform);
  }

  features() {
    return [
      ConnectorFeature.SCHEDULING,
      ConnectorFeature.VIDEO,
      ConnectorFeature.REEL,
      ConnectorFeature.HASHTAG_SUGGESTIONS,
    ];
  }

  async validateCredentials(_credentials: ConnectorCredentials) {
    // TikTok validation requires client credentials exchange; placeholder here.
    return true;
  }

  async publish(_credentials: ConnectorCredentials, payload: PublishPayload): Promise<PublishResult> {
    // Placeholder: integrate with TikTok Content Posting API (upload -> publish).
    const externalPostId = randomUUID();
    return {
      externalPostId,
      url: payload.metadata?.["previewUrl"] as string | undefined,
      publishedAt: payload.scheduledFor ?? new Date(),
      rawResponse: {
        note: "TikTok connector requires partner credentials. Replace with actual API calls.",
      },
    };
  }
}
