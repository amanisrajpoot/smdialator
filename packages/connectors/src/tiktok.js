"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TikTokConnector = void 0;
const node_crypto_1 = require("node:crypto");
const common_1 = require("@scheduler/common");
const base_1 = require("./base");
const types_1 = require("./types");
/**
 * TikTok's Content Posting API is currently available via approved partners.
 * This connector provides the scaffolding required to integrate with TikTok's
 * upload & publish flow. The actual API calls need developer tokens.
 */
class TikTokConnector extends base_1.BaseConnector {
    constructor() {
        super(common_1.SocialPlatform.TIKTOK);
    }
    features() {
        return [
            types_1.ConnectorFeature.SCHEDULING,
            types_1.ConnectorFeature.VIDEO,
            types_1.ConnectorFeature.REEL,
            types_1.ConnectorFeature.HASHTAG_SUGGESTIONS,
        ];
    }
    async validateCredentials(_credentials) {
        // TikTok validation requires client credentials exchange; placeholder here.
        return true;
    }
    async publish(_credentials, payload) {
        // Placeholder: integrate with TikTok Content Posting API (upload -> publish).
        const externalPostId = (0, node_crypto_1.randomUUID)();
        return {
            externalPostId,
            url: payload.metadata?.["previewUrl"],
            publishedAt: payload.scheduledFor ?? new Date(),
            rawResponse: {
                note: "TikTok connector requires partner credentials. Replace with actual API calls.",
            },
        };
    }
}
exports.TikTokConnector = TikTokConnector;
