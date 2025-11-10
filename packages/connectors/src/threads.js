"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThreadsConnector = void 0;
const node_crypto_1 = require("node:crypto");
const common_1 = require("@scheduler/common");
const base_1 = require("./base");
const types_1 = require("./types");
/**
 * Threads currently offers limited partner APIs. This connector prepares the
 * integration points and documents the payload structure expected once access
 * is granted by Meta.
 */
class ThreadsConnector extends base_1.BaseConnector {
    constructor() {
        super(common_1.SocialPlatform.THREADS);
    }
    features() {
        return [
            types_1.ConnectorFeature.SCHEDULING,
            types_1.ConnectorFeature.HASHTAG_SUGGESTIONS,
        ];
    }
    async validateCredentials(_credentials) {
        return true;
    }
    async publish(_credentials, payload) {
        const externalPostId = (0, node_crypto_1.randomUUID)();
        return {
            externalPostId,
            url: payload.metadata?.["previewUrl"],
            publishedAt: payload.scheduledFor ?? new Date(),
            rawResponse: {
                note: "Threads connector requires partner access. Replace with official API calls when available.",
            },
        };
    }
}
exports.ThreadsConnector = ThreadsConnector;
