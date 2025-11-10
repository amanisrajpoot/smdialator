import axios from "axios";
import { SocialPlatform as SocialPlatformEnum } from "@scheduler/common";
import type { SocialPlatform } from "@scheduler/common";
import { BaseConnector } from "./base";
import {
  ConnectorFeature,
  type ConnectorConfig,
  type ConnectorCredentials,
  type PublishPayload,
  type PublishResult,
} from "./types";

interface InstagramContainerResponse {
  id: string;
}

export class InstagramBusinessConnector extends BaseConnector {
  constructor() {
    super(SocialPlatformEnum.INSTAGRAM_BUSINESS as SocialPlatform);
  }

  features() {
    return [
      ConnectorFeature.SCHEDULING,
      ConnectorFeature.REEL,
      ConnectorFeature.CAROUSEL,
      ConnectorFeature.HASHTAG_SUGGESTIONS,
      ConnectorFeature.FIRST_COMMENT,
    ];
  }

  async validateCredentials(credentials: ConnectorCredentials) {
    try {
      await axios.get("https://graph.facebook.com/v18.0/me/accounts", {
        params: { access_token: credentials.accessToken },
      });
      return true;
    } catch {
      return false;
    }
  }

  async publish(credentials: ConnectorCredentials, payload: PublishPayload): Promise<PublishResult> {
    const igBusinessId =
      (payload.metadata?.instagramBusinessId as string | undefined) ??
      (credentials.metadata?.instagramBusinessId as string | undefined);

    if (!igBusinessId) {
      throw new Error("Instagram publish requires instagramBusinessId in metadata");
    }

    const creationParams: Record<string, unknown> = {
      caption: payload.text,
    };

    if (payload.mediaUrls?.length === 1) {
      creationParams.image_url = payload.mediaUrls[0];
    } else if (payload.mediaUrls && payload.mediaUrls.length > 1) {
      creationParams.children = payload.mediaUrls.map((url) => ({
        media_type: "IMAGE",
        image_url: url,
      }));
      creationParams.media_type = "CAROUSEL";
    }

    const container = await axios.post<InstagramContainerResponse>(
      `https://graph.facebook.com/v18.0/${igBusinessId}/media`,
      creationParams,
      {
        params: { access_token: credentials.accessToken },
      }
    );

    const containerId = container.data.id;

    const publishResponse = await axios.post<{ id: string }>(
      `https://graph.facebook.com/v18.0/${igBusinessId}/media_publish`,
      {
        creation_id: containerId,
      },
      { params: { access_token: credentials.accessToken } }
    );

    const postId = publishResponse.data.id;
    return {
      externalPostId: postId,
      url: `https://www.instagram.com/p/${postId}`,
      publishedAt: payload.scheduledFor ?? new Date(),
      rawResponse: publishResponse.data,
    };
  }
}
