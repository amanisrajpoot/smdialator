import axios from "axios";
import type { SocialPlatform } from "@scheduler/common";
import { SocialPlatform as SocialPlatformEnum } from "@scheduler/common";
import { BaseConnector } from "./base";
import {
  ConnectorFeature,
  type ConnectorConfig,
  type ConnectorCredentials,
  type PublishPayload,
  type PublishResult,
} from "./types";

export class CustomWebhookConnector extends BaseConnector {
  constructor() {
    super(SocialPlatformEnum.CUSTOM_WEBHOOK as SocialPlatform);
  }

  features() {
    return [
      ConnectorFeature.SCHEDULING,
      ConnectorFeature.CAROUSEL,
      ConnectorFeature.VIDEO,
      ConnectorFeature.HASHTAG_SUGGESTIONS,
      ConnectorFeature.UTM_TAGGING,
    ];
  }

  async validateCredentials(_credentials: ConnectorCredentials, config?: ConnectorConfig) {
    return Boolean(config?.additionalConfig?.["endpointUrl"]);
  }

  async publish(_credentials: ConnectorCredentials, payload: PublishPayload, config?: ConnectorConfig): Promise<PublishResult> {
    const endpointUrl = config?.additionalConfig?.["endpointUrl"] as string | undefined;
    if (!endpointUrl) {
      throw new Error("Custom webhook connector requires endpointUrl in config.additionalConfig");
    }

    const response = await axios.post(
      endpointUrl,
      {
        text: payload.text,
        mediaUrls: payload.mediaUrls,
        linkAttachment: payload.linkAttachment,
        scheduledFor: payload.scheduledFor?.toISOString(),
        metadata: payload.metadata,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Omni-Scheduler": "custom-webhook",
        },
      }
    );

    return {
      externalPostId: response.data?.id ?? "custom-webhook",
      url: response.data?.url,
      publishedAt: payload.scheduledFor ?? new Date(),
      rawResponse: response.data,
    };
  }
}
