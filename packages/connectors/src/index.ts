import type { SocialPlatform } from "@scheduler/common";
import { SocialPlatform as SocialPlatformEnum } from "@scheduler/common";
import type { SocialConnector } from "./types";
import { FacebookPageConnector } from "./facebook";
import { InstagramBusinessConnector } from "./instagram";
import { TwitterConnector } from "./twitter";
import { LinkedInConnector } from "./linkedin";
import { TikTokConnector } from "./tiktok";
import { PinterestConnector } from "./pinterest";
import { YouTubeConnector } from "./youtube";
import { ThreadsConnector } from "./threads";
import { RedditConnector } from "./reddit";
import { GoogleBusinessConnector } from "./google-business";
import { CustomWebhookConnector } from "./custom-webhook";
import { SnapchatConnector } from "./snapchat";

const registry: Partial<Record<SocialPlatform, SocialConnector>> = {
  [SocialPlatformEnum.FACEBOOK_PAGE]: new FacebookPageConnector(),
  [SocialPlatformEnum.INSTAGRAM_BUSINESS]: new InstagramBusinessConnector(),
  [SocialPlatformEnum.THREADS]: new ThreadsConnector(),
  [SocialPlatformEnum.TWITTER]: new TwitterConnector(),
  [SocialPlatformEnum.LINKEDIN_PAGE]: new LinkedInConnector(),
  [SocialPlatformEnum.LINKEDIN_PROFILE]: new LinkedInConnector(),
  [SocialPlatformEnum.TIKTOK]: new TikTokConnector(),
  [SocialPlatformEnum.PINTEREST]: new PinterestConnector(),
  [SocialPlatformEnum.YOUTUBE]: new YouTubeConnector(),
  [SocialPlatformEnum.SNAPCHAT]: new SnapchatConnector(),
  [SocialPlatformEnum.REDDIT]: new RedditConnector(),
  [SocialPlatformEnum.GOOGLE_BUSINESS]: new GoogleBusinessConnector(),
  [SocialPlatformEnum.CUSTOM_WEBHOOK]: new CustomWebhookConnector(),
};

export function getConnector(platform: SocialPlatform): SocialConnector {
  const connector = registry[platform];
  if (!connector) {
    throw new Error(`Unsupported platform: ${platform}`);
  }
  return connector;
}

export function listConnectors(): Array<{ platform: SocialPlatform; features: ReturnType<SocialConnector["features"]> }> {
  return Object.entries(registry).map(([platform, connector]) => ({
    platform: platform as SocialPlatform,
    features: connector!.features(),
  }));
}

export * from "./types";
