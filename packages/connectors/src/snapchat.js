"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SnapchatConnector = void 0;
const node_crypto_1 = require("node:crypto");
const common_1 = require("@scheduler/common");
const base_1 = require("./base");
const types_1 = require("./types");
/**
 * Snapchat marketing API is limited; this connector provides scaffolding.
 */
class SnapchatConnector extends base_1.BaseConnector {
    constructor() {
        super(common_1.SocialPlatform.SNAPCHAT);
    }
    features() {
        return [
            types_1.ConnectorFeature.SCHEDULING,
            types_1.ConnectorFeature.STORY,
            types_1.ConnectorFeature.VIDEO,
        ];
    }
    async validateCredentials(_credentials) {
        return true;
    }
    async publish(_credentials, payload) {
        return {
            externalPostId: (0, node_crypto_1.randomUUID)(),
            url: payload.metadata?.["previewUrl"],
            publishedAt: payload.scheduledFor ?? new Date(),
            rawResponse: {
                note: "Integrate with Snapchat Marketing API once access is provisioned.",
            },
        };
    }
}
exports.SnapchatConnector = SnapchatConnector;
