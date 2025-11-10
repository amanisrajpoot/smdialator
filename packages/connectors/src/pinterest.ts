import axios from "axios";
import type { SocialPlatform } from "@scheduler/common";
import { SocialPlatform as SocialPlatformEnum } from "@scheduler/common";
import { BaseConnector } from "./base";
import { ConnectorFeature, type ConnectorCredentials, type PublishPayload, type PublishResult } from "./types";

interface PinterestCreatePinResponse {
  id: string;
  link?: string;
}

export class PinterestConnector extends BaseConnector {
  constructor() {
    super(SocialPlatformEnum.PINTEREST as SocialPlatform);
  }

  features() {
    return [
      ConnectorFeature.SCHEDULING,
      ConnectorFeature.CAROUSEL,
      ConnectorFeature.HASHTAG_SUGGESTIONS,
    ];
  }

  async validateCredentials(credentials: ConnectorCredentials) {
    try {
      await axios.get("https://api.pinterest.com/v5/user_account", {
        headers: {
          Authorization: `Bearer ${credentials.accessToken}`,
        },
      });
      return true;
    } catch {
      return false;
    }
  }

  async publish(credentials: ConnectorCredentials, payload: PublishPayload): Promise<PublishResult> {
    const boardId =
      (payload.metadata?.boardId as string | undefined) ??
      (credentials.metadata?.boardId as string | undefined);

    if (!boardId) {
      throw new Error("Pinterest publish requires boardId");
    }

    const response = await axios.post<PinterestCreatePinResponse>(
      "https://api.pinterest.com/v5/pins",
      {
        board_id: boardId,
        title: payload.metadata?.title ?? payload.text.slice(0, 100),
        description: payload.text,
        media_source: {
          source_type: "image_url",
          url: payload.mediaUrls?.[0],
        },
        link: payload.linkAttachment,
      },
      {
        headers: {
          Authorization: `Bearer ${credentials.accessToken}`,
        },
      }
    );

    return {
      externalPostId: response.data.id,
      url: response.data.link,
      publishedAt: payload.scheduledFor ?? new Date(),
      rawResponse: response.data,
    };
  }
}
