import axios from "axios";
import { SocialPlatform as SocialPlatformEnum } from "@scheduler/common";
import type { SocialPlatform } from "@scheduler/common";
import { BaseConnector } from "./base";
import {
  ConnectorFeature,
  type ConnectorCredentials,
  type PublishPayload,
  type PublishResult,
  type InsightsResult,
} from "./types";

interface LinkedInShareResponse {
  id: string;
}

export class LinkedInConnector extends BaseConnector {
  constructor() {
    super(SocialPlatformEnum.LINKEDIN_PAGE as SocialPlatform);
  }

  features() {
    return [
      ConnectorFeature.SCHEDULING,
      ConnectorFeature.VIDEO,
      ConnectorFeature.CAROUSEL,
      ConnectorFeature.HASHTAG_SUGGESTIONS,
      ConnectorFeature.UTM_TAGGING,
    ];
  }

  async validateCredentials(credentials: ConnectorCredentials) {
    try {
      await axios.get("https://api.linkedin.com/v2/me", {
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
    const organizationUrn =
      (payload.metadata?.organizationUrn as string | undefined) ??
      (credentials.metadata?.organizationUrn as string | undefined);

    if (!organizationUrn) {
      throw new Error("LinkedIn publish requires organizationUrn");
    }

    const body: Record<string, unknown> = {
      author: organizationUrn,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text: payload.text,
          },
          shareMediaCategory: payload.mediaUrls?.length ? "IMAGE" : "NONE",
          media: payload.mediaUrls?.map((url) => ({
            status: "READY",
            media: url,
          })),
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    };

    const response = await axios.post<LinkedInShareResponse>("https://api.linkedin.com/v2/ugcPosts", body, {
      headers: {
        Authorization: `Bearer ${credentials.accessToken}`,
        "X-Restli-Protocol-Version": "2.0.0",
      },
    });

    const postId = response.data.id;
    return {
      externalPostId: postId,
      url: `https://www.linkedin.com/feed/update/${postId}`,
      publishedAt: payload.scheduledFor ?? new Date(),
      rawResponse: response.data,
    };
  }

  async fetchInsights(credentials: ConnectorCredentials, options: { postId?: string }): Promise<InsightsResult> {
    if (!options.postId) {
      throw new Error("LinkedIn insights requires postId");
    }

    const response = await axios.get("https://api.linkedin.com/v2/organizationalEntityShareStatistics", {
      params: {
        q: "organizationalEntity",
        organizationalEntity: options.postId,
      },
      headers: {
        Authorization: `Bearer ${credentials.accessToken}`,
      },
    });

    const metrics = response.data?.elements?.[0]?.totalShareStatistics ?? {};

    return {
      impressions: metrics.impressionCount ?? 0,
      reach: metrics.uniqueImpressionsCount ?? 0,
      engagements: metrics.engagement ?? 0,
      clicks: metrics.clickCount ?? 0,
      extra: metrics,
    };
  }
}
