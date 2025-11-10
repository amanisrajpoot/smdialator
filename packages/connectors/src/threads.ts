import { randomUUID } from "node:crypto";
import type { SocialPlatform } from "@scheduler/common";
import { SocialPlatform as SocialPlatformEnum } from "@scheduler/common";
import { BaseConnector } from "./base";
import { ConnectorFeature, type ConnectorCredentials, type PublishPayload, type PublishResult } from "./types";

/**
 * Threads currently offers limited partner APIs. This connector prepares the
 * integration points and documents the payload structure expected once access
 * is granted by Meta.
 */
export class ThreadsConnector extends BaseConnector {
  constructor() {
    super(SocialPlatformEnum.THREADS as SocialPlatform);
  }

  features() {
    return [
      ConnectorFeature.SCHEDULING,
      ConnectorFeature.HASHTAG_SUGGESTIONS,
    ];
  }

  async validateCredentials(_credentials: ConnectorCredentials) {
    return true;
  }

  async publish(_credentials: ConnectorCredentials, payload: PublishPayload): Promise<PublishResult> {
    const externalPostId = randomUUID();
    return {
      externalPostId,
      url: payload.metadata?.["previewUrl"] as string | undefined,
      publishedAt: payload.scheduledFor ?? new Date(),
      rawResponse: {
        note: "Threads connector requires partner access. Replace with official API calls when available.",
      },
    };
  }
}
