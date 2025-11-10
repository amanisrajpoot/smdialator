import { google, youtube_v3 } from "googleapis";
import { SocialPlatform as SocialPlatformEnum } from "@scheduler/common";
import type { SocialPlatform } from "@scheduler/common";
import { BaseConnector } from "./base";
import { ConnectorFeature, type ConnectorCredentials, type PublishPayload, type PublishResult } from "./types";

export class YouTubeConnector extends BaseConnector {
  constructor() {
    super(SocialPlatformEnum.YOUTUBE as SocialPlatform);
  }

  features() {
    return [
      ConnectorFeature.SCHEDULING,
      ConnectorFeature.VIDEO,
      ConnectorFeature.LIVESTREAM,
      ConnectorFeature.HASHTAG_SUGGESTIONS,
    ];
  }

  async validateCredentials(credentials: ConnectorCredentials) {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: credentials.accessToken });

    const youtube = google.youtube({
      version: "v3",
      auth: oauth2Client,
    });

    try {
      await youtube.channels.list({ mine: true, part: ["id"] });
      return true;
    } catch {
      return false;
    }
  }

  async publish(credentials: ConnectorCredentials, payload: PublishPayload): Promise<PublishResult> {
    if (!payload.mediaUrls?.length) {
      throw new Error("YouTube publish requires a video URL (pre-uploaded to storage/CDN)");
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: credentials.accessToken });

    const youtube = google.youtube({
      version: "v3",
      auth: oauth2Client,
    });

    const resource: youtube_v3.Schema$Video = {
      snippet: {
        title: payload.metadata?.title as string ?? payload.text.slice(0, 95),
        description: payload.text,
        tags: (payload.metadata?.tags as string[]) ?? [],
      },
      status: {
        privacyStatus: (payload.metadata?.privacyStatus as string) ?? "private",
        publishAt: payload.scheduledFor?.toISOString(),
      },
    };

    // Note: Actual video upload requires streaming the file. Here we register metadata only.
    const response = await youtube.videos.insert({
      part: ["snippet", "status"],
      requestBody: resource,
    });

    const videoId = response.data.id!;

    return {
      externalPostId: videoId,
      url: `https://youtu.be/${videoId}`,
      publishedAt: payload.scheduledFor ?? new Date(),
      rawResponse: response.data,
    };
  }
}
