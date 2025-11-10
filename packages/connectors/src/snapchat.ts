import { randomUUID } from "node:crypto";
import type { SocialPlatform } from "@scheduler/common";
import { SocialPlatform as SocialPlatformEnum } from "@scheduler/common";
import { BaseConnector } from "./base";
import { ConnectorFeature, type ConnectorCredentials, type PublishPayload, type PublishResult } from "./types";

/**
 * Snapchat marketing API is limited; this connector provides scaffolding.
 */
export class SnapchatConnector extends BaseConnector {
  constructor() {
    super(SocialPlatformEnum.SNAPCHAT as SocialPlatform);
  }

  features() {
    return [
      ConnectorFeature.SCHEDULING,
      ConnectorFeature.STORY,
      ConnectorFeature.VIDEO,
    ];
  }

  async validateCredentials(_credentials: ConnectorCredentials) {
    return true;
  }

  async publish(_credentials: ConnectorCredentials, payload: PublishPayload): Promise<PublishResult> {
    return {
      externalPostId: randomUUID(),
      url: payload.metadata?.["previewUrl"] as string | undefined,
      publishedAt: payload.scheduledFor ?? new Date(),
      rawResponse: {
        note: "Integrate with Snapchat Marketing API once access is provisioned.",
      },
    };
  }
}
