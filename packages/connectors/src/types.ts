import type { SocialPlatform } from "@scheduler/common";

export enum ConnectorFeature {
  SCHEDULING = "SCHEDULING",
  FIRST_COMMENT = "FIRST_COMMENT",
  HASHTAG_SUGGESTIONS = "HASHTAG_SUGGESTIONS",
  STORY = "STORY",
  REEL = "REEL",
  CAROUSEL = "CAROUSEL",
  VIDEO = "VIDEO",
  LIVESTREAM = "LIVESTREAM",
  COMMENTS_MODERATION = "COMMENTS_MODERATION",
  UTM_TAGGING = "UTM_TAGGING",
  BEST_TIME = "BEST_TIME",
  AI_GENERATION = "AI_GENERATION",
  MENTION_LOOKUP = "MENTION_LOOKUP",
}

export interface ConnectorConfig {
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
  webhookSecret?: string;
  additionalConfig?: Record<string, unknown>;
}

export interface ConnectorCredentials {
  accessToken: string;
  refreshToken?: string | null;
  expiresAt?: Date | null;
  metadata?: Record<string, unknown>;
}

export interface PublishPayload {
  text: string;
  mediaUrls?: string[];
  linkAttachment?: string;
  firstComment?: string;
  scheduledFor?: Date;
  timezone?: string;
  metadata?: Record<string, unknown>;
}

export interface PublishResult {
  externalPostId: string;
  url?: string;
  publishedAt: Date;
  rawResponse?: unknown;
}

export interface InsightsResult {
  impressions: number;
  reach: number;
  engagements: number;
  clicks: number;
  audienceGrowth?: number;
  extra?: Record<string, unknown>;
}

export interface ConnectorWebhookPayload {
  event: string;
  data: unknown;
  receivedAt: Date;
}

export interface SocialConnector {
  platform: SocialPlatform;
  features(): ConnectorFeature[];
  validateCredentials(credentials: ConnectorCredentials, config?: ConnectorConfig): Promise<boolean>;
  publish(credentials: ConnectorCredentials, payload: PublishPayload, config?: ConnectorConfig): Promise<PublishResult>;
  refreshCredentials?(credentials: ConnectorCredentials, config?: ConnectorConfig): Promise<ConnectorCredentials>;
  fetchInsights?(
    credentials: ConnectorCredentials,
    options: { since?: Date; until?: Date; postId?: string },
    config?: ConnectorConfig
  ): Promise<InsightsResult>;
  handleWebhook?(payload: ConnectorWebhookPayload, config?: ConnectorConfig): Promise<void>;
}
