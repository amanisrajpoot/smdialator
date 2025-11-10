"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomWebhookConnector = void 0;
const axios_1 = __importDefault(require("axios"));
const common_1 = require("@scheduler/common");
const base_1 = require("./base");
const types_1 = require("./types");
class CustomWebhookConnector extends base_1.BaseConnector {
    constructor() {
        super(common_1.SocialPlatform.CUSTOM_WEBHOOK);
    }
    features() {
        return [
            types_1.ConnectorFeature.SCHEDULING,
            types_1.ConnectorFeature.CAROUSEL,
            types_1.ConnectorFeature.VIDEO,
            types_1.ConnectorFeature.HASHTAG_SUGGESTIONS,
            types_1.ConnectorFeature.UTM_TAGGING,
        ];
    }
    async validateCredentials(_credentials, config) {
        return Boolean(config?.additionalConfig?.["endpointUrl"]);
    }
    async publish(_credentials, payload, config) {
        const endpointUrl = config?.additionalConfig?.["endpointUrl"];
        if (!endpointUrl) {
            throw new Error("Custom webhook connector requires endpointUrl in config.additionalConfig");
        }
        const response = await axios_1.default.post(endpointUrl, {
            text: payload.text,
            mediaUrls: payload.mediaUrls,
            linkAttachment: payload.linkAttachment,
            scheduledFor: payload.scheduledFor?.toISOString(),
            metadata: payload.metadata,
        }, {
            headers: {
                "Content-Type": "application/json",
                "X-Omni-Scheduler": "custom-webhook",
            },
        });
        return {
            externalPostId: response.data?.id ?? "custom-webhook",
            url: response.data?.url,
            publishedAt: payload.scheduledFor ?? new Date(),
            rawResponse: response.data,
        };
    }
}
exports.CustomWebhookConnector = CustomWebhookConnector;
