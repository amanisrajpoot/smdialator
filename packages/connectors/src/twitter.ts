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
  type InsightsResult,
} from "./types";

export class TwitterConnector extends BaseConnector {
  constructor() {
    super(SocialPlatformEnum.TWITTER as SocialPlatform);
  }

  features() {
    return [
      ConnectorFeature.SCHEDULING,
      ConnectorFeature.HASHTAG_SUGGESTIONS,
      ConnectorFeature.MENTION_LOOKUP,
      ConnectorFeature.BEST_TIME,
    ];
  }

  async validateCredentials(credentials: ConnectorCredentials) {
    try {
      await axios.get("https://api.twitter.com/2/users/me", {
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
    const body: Record<string, unknown> = {
      text: payload.text,
    };

    if (payload.mediaUrls?.length) {
      body.media = {
        media_ids: payload.mediaUrls,
      };
    }

    const response = await axios.post(
      "https://api.twitter.com/2/tweets",
      body,
      {
        headers: {
          Authorization: `Bearer ${credentials.accessToken}`,
        },
      }
    );

    const tweetId = response.data?.data?.id;
    return {
      externalPostId: tweetId,
      url: tweetId ? `https://x.com/i/web/status/${tweetId}` : undefined,
      publishedAt: payload.scheduledFor ?? new Date(),
      rawResponse: response.data,
    };
  }

  async fetchInsights(credentials: ConnectorCredentials, options: { postId?: string }): Promise<InsightsResult> {
    if (!options.postId) {
      throw new Error("Twitter insights requires postId");
    }

    const response = await axios.get(`https://api.twitter.com/2/tweets/${options.postId}`, {
      params: {
        "tweet.fields": "public_metrics",
      },
      headers: {
        Authorization: `Bearer ${credentials.accessToken}`,
      },
    });

    const metrics = response.data?.data?.public_metrics ?? {};
    const impressionCount = metrics.impression_count ?? 0;
    const profileClicks = metrics.user_profile_clicks ?? 0;
    const replyCount = metrics.reply_count ?? 0;
    const retweetCount = metrics.retweet_count ?? 0;
    const likeCount = metrics.like_count ?? 0;
    const urlClicks = metrics.url_link_clicks ?? 0;

    return {
      impressions: impressionCount,
      reach: profileClicks,
      engagements: replyCount + retweetCount + likeCount,
      clicks: urlClicks,
      extra: metrics,
    };
  }
}
