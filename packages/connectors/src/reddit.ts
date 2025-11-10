import axios from "axios";
import type { SocialPlatform } from "@scheduler/common";
import { SocialPlatform as SocialPlatformEnum } from "@scheduler/common";
import { BaseConnector } from "./base";
import { ConnectorFeature, type ConnectorCredentials, type PublishPayload, type PublishResult } from "./types";

export class RedditConnector extends BaseConnector {
  constructor() {
    super(SocialPlatformEnum.REDDIT as SocialPlatform);
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
      await axios.get("https://oauth.reddit.com/api/v1/me", {
        headers: {
          Authorization: `Bearer ${credentials.accessToken}`,
          "User-Agent": "omni-scheduler/0.1.0",
        },
      });
      return true;
    } catch {
      return false;
    }
  }

  async publish(credentials: ConnectorCredentials, payload: PublishPayload): Promise<PublishResult> {
    const subreddit =
      (payload.metadata?.subreddit as string | undefined) ??
      (credentials.metadata?.subreddit as string | undefined);

    if (!subreddit) {
      throw new Error("Reddit publish requires subreddit metadata");
    }

    const response = await axios.post(
      "https://oauth.reddit.com/api/submit",
      new URLSearchParams({
        sr: subreddit,
        kind: payload.mediaUrls?.length ? "link" : "self",
        title: payload.metadata?.title as string ?? payload.text.slice(0, 290),
        text: payload.text,
        url: payload.mediaUrls?.[0] ?? payload.linkAttachment ?? "",
      }),
      {
        headers: {
          Authorization: `Bearer ${credentials.accessToken}`,
          "User-Agent": "omni-scheduler/0.1.0",
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const postId = response.data?.json?.data?.id ?? response.data?.name;

    return {
      externalPostId: postId,
      url: postId ? `https://reddit.com/${postId}` : undefined,
      publishedAt: payload.scheduledFor ?? new Date(),
      rawResponse: response.data,
    };
  }
}
