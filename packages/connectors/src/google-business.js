"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleBusinessConnector = void 0;
const axios_1 = __importDefault(require("axios"));
const common_1 = require("@scheduler/common");
const base_1 = require("./base");
const types_1 = require("./types");
class GoogleBusinessConnector extends base_1.BaseConnector {
    constructor() {
        super(common_1.SocialPlatform.GOOGLE_BUSINESS);
    }
    features() {
        return [
            types_1.ConnectorFeature.SCHEDULING,
            types_1.ConnectorFeature.VIDEO,
            types_1.ConnectorFeature.CAROUSEL,
            types_1.ConnectorFeature.HASHTAG_SUGGESTIONS,
            types_1.ConnectorFeature.UTM_TAGGING,
        ];
    }
    async validateCredentials(credentials) {
        try {
            await axios_1.default.get("https://mybusiness.googleapis.com/v4/accounts", {
                headers: { Authorization: `Bearer ${credentials.accessToken}` },
            });
            return true;
        }
        catch {
            return false;
        }
    }
    async publish(credentials, payload) {
        const locationName = payload.metadata?.locationName ??
            credentials.metadata?.locationName;
        if (!locationName) {
            throw new Error("Google Business publish requires locationName");
        }
        const response = await axios_1.default.post(`https://mybusiness.googleapis.com/v4/${locationName}/localPosts`, {
            summary: payload.text,
            callToAction: payload.metadata?.callToAction,
            media: payload.mediaUrls?.map((url) => ({
                sourceUrl: url,
            })),
            event: payload.metadata?.event,
        }, {
            headers: { Authorization: `Bearer ${credentials.accessToken}` },
        });
        return {
            externalPostId: response.data?.name,
            url: response.data?.searchUrl,
            publishedAt: payload.scheduledFor ?? new Date(),
            rawResponse: response.data,
        };
    }
    async fetchInsights(credentials, options) {
        if (!options.locationName) {
            throw new Error("Google Business insights requires locationName");
        }
        const response = await axios_1.default.get(`https://mybusiness.googleapis.com/v4/${options.locationName}/insights`, {
            headers: { Authorization: `Bearer ${credentials.accessToken}` },
        });
        const metrics = response.data?.locationMetrics?.[0];
        return {
            impressions: metrics?.searchRequestCount ?? 0,
            reach: metrics?.viewCount ?? 0,
            engagements: metrics?.actionCount ?? 0,
            clicks: metrics?.directionCount ?? 0,
            extra: metrics,
        };
    }
}
exports.GoogleBusinessConnector = GoogleBusinessConnector;
