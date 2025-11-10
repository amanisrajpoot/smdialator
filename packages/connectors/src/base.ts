import type { SocialPlatform } from "@scheduler/common";
import type {
  ConnectorConfig,
  ConnectorCredentials,
  ConnectorFeature,
  ConnectorWebhookPayload,
  PublishPayload,
  PublishResult,
  InsightsResult,
  SocialConnector,
} from "./types";

export abstract class BaseConnector implements SocialConnector {
  public readonly platform: SocialPlatform;

  protected constructor(platform: SocialPlatform) {
    this.platform = platform;
  }

  abstract features(): ConnectorFeature[];

  abstract validateCredentials(credentials: ConnectorCredentials, config?: ConnectorConfig): Promise<boolean>;

  abstract publish(credentials: ConnectorCredentials, payload: PublishPayload, config?: ConnectorConfig): Promise<PublishResult>;

  refreshCredentials?(
    credentials: ConnectorCredentials,
    config?: ConnectorConfig
  ): Promise<ConnectorCredentials>;

  fetchInsights?(
    credentials: ConnectorCredentials,
    options: { since?: Date; until?: Date; postId?: string },
    config?: ConnectorConfig
  ): Promise<InsightsResult>;

  handleWebhook?(_payload: ConnectorWebhookPayload, _config?: ConnectorConfig): Promise<void>;

  supports(feature: ConnectorFeature) {
    return this.features().includes(feature);
  }
}
