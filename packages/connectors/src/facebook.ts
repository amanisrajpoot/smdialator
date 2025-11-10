import axios from "axios";
import type { SocialPlatform } from "@scheduler/common";
import { SocialPlatform as SocialPlatformEnum } from "@scheduler/common";
import { BaseConnector } from "./base";
import { ConnectorFeature, type ConnectorConfig, type ConnectorCredentials, type PublishPayload, type PublishResult } from "./types";

interface FacebookPublishResponse {
  id: string;
  post_id?: string;
}

export class FacebookPageConnector extends BaseConnector {
  constructor() {
    super(SocialPlatformEnum.FACEBOOK_PAGE as SocialPlatform);
  }

  features() {
    return [
      ConnectorFeature.SCHEDULING,
      ConnectorFeature.VIDEO,
      ConnectorFeature.CAROUSEL,
      ConnectorFeature.HASHTAG_SUGGESTIONS,
      ConnectorFeature.UTM_TAGGING,
      ConnectorFeature.BEST_TIME,
      ConnectorFeature.FIRST_COMMENT,
    ];
  }

  async validateCredentials(credentials: ConnectorCredentials) {
    try {
      const response = await axios.get("https://graph.facebook.com/debug_token", {
        params: {
          input_token: credentials.accessToken,
          access_token: credentials.accessToken,
        },
      });
      return !!response.data?.data?.is_valid;
    } catch (error) {
      return false;
    }
  }

  async publish(credentials: ConnectorCredentials, payload: PublishPayload, config?: ConnectorConfig): Promise<PublishResult> {
    const pageId =
      (payload.metadata?.pageId as string | undefined) ??
      (credentials.metadata?.pageId as string | undefined) ??
      config?.additionalConfig?.["pageId"];

    if (!pageId) {
      throw new Error("Facebook publish requires pageId in metadata");
    }

    const requestBody: Record<string, unknown> = {
      message: payload.text,
      link: payload.linkAttachment,
      published: payload.scheduledFor ? false : true,
      scheduled_publish_time: payload.scheduledFor ? Math.floor(payload.scheduledFor.getTime() / 1000) : undefined,
    };

    if (payload.mediaUrls && payload.mediaUrls.length > 0) {
      requestBody.attached_media = payload.mediaUrls.map((url) => ({
        media_fbid: url,
      }));
    }

    const response = await axios.post<FacebookPublishResponse>(
      `https://graph.facebook.com/v18.0/${pageId}/feed`,
      requestBody,
      {
        params: {
          access_token: credentials.accessToken,
        },
      }
    );

    const postId = response.data.post_id ?? response.data.id;
    return {
      externalPostId: postId,
      url: `https://facebook.com/${postId}`,
      publishedAt: payload.scheduledFor ?? new Date(),
      rawResponse: response.data,
    };
  }
}
