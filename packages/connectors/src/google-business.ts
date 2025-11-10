import axios from "axios";
import type { SocialPlatform } from "@scheduler/common";
import { SocialPlatform as SocialPlatformEnum } from "@scheduler/common";
import { BaseConnector } from "./base";
import {
  ConnectorFeature,
  type ConnectorCredentials,
  type PublishPayload,
  type PublishResult,
  type InsightsResult,
} from "./types";

export class GoogleBusinessConnector extends BaseConnector {
  constructor() {
    super(SocialPlatformEnum.GOOGLE_BUSINESS as SocialPlatform);
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
      await axios.get("https://mybusiness.googleapis.com/v4/accounts", {
        headers: { Authorization: `Bearer ${credentials.accessToken}` },
      });
      return true;
    } catch {
      return false;
    }
  }

  async publish(credentials: ConnectorCredentials, payload: PublishPayload): Promise<PublishResult> {
    const locationName =
      (payload.metadata?.locationName as string | undefined) ??
      (credentials.metadata?.locationName as string | undefined);

    if (!locationName) {
      throw new Error("Google Business publish requires locationName");
    }

    const response = await axios.post(
      `https://mybusiness.googleapis.com/v4/${locationName}/localPosts`,
      {
        summary: payload.text,
        callToAction: payload.metadata?.callToAction,
        media: payload.mediaUrls?.map((url) => ({
          sourceUrl: url,
        })),
        event: payload.metadata?.event,
      },
      {
        headers: { Authorization: `Bearer ${credentials.accessToken}` },
      }
    );

    return {
      externalPostId: response.data?.name,
      url: response.data?.searchUrl,
      publishedAt: payload.scheduledFor ?? new Date(),
      rawResponse: response.data,
    };
  }

  async fetchInsights(credentials: ConnectorCredentials, options: { locationName?: string }): Promise<InsightsResult> {
    if (!options.locationName) {
      throw new Error("Google Business insights requires locationName");
    }

    const response = await axios.get(`https://mybusiness.googleapis.com/v4/${options.locationName}/insights`, {
      headers: { Authorization: `Bearer ${credentials.accessToken}` },
    });

    const metrics = response.data?.locationMetrics?.[0];

    return {
      impressions: metrics?.searchRequestCount ?? 0,
      reach: metrics?.viewCount ?? 0,
      engagements: metrics?.actionCount ?? 0,
      clicks: metrics?.directionCount ?? 0,
      extra: metrics,
    };
  }
}
