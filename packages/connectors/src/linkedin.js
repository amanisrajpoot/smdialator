"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkedInConnector = void 0;
const axios_1 = __importDefault(require("axios"));
const common_1 = require("@scheduler/common");
const base_1 = require("./base");
const types_1 = require("./types");
class LinkedInConnector extends base_1.BaseConnector {
    constructor() {
        super(common_1.SocialPlatform.LINKEDIN_PAGE);
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
            await axios_1.default.get("https://api.linkedin.com/v2/me", {
                headers: {
                    Authorization: `Bearer ${credentials.accessToken}`,
                },
            });
            return true;
        }
        catch {
            return false;
        }
    }
    async publish(credentials, payload) {
        const organizationUrn = payload.metadata?.organizationUrn ??
            credentials.metadata?.organizationUrn;
        if (!organizationUrn) {
            throw new Error("LinkedIn publish requires organizationUrn");
        }
        const body = {
            author: organizationUrn,
            lifecycleState: "PUBLISHED",
            specificContent: {
                "com.linkedin.ugc.ShareContent": {
                    shareCommentary: {
                        text: payload.text,
                    },
                    shareMediaCategory: payload.mediaUrls?.length ? "IMAGE" : "NONE",
                    media: payload.mediaUrls?.map((url) => ({
                        status: "READY",
                        media: url,
                    })),
                },
            },
            visibility: {
                "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
            },
        };
        const response = await axios_1.default.post("https://api.linkedin.com/v2/ugcPosts", body, {
            headers: {
                Authorization: `Bearer ${credentials.accessToken}`,
                "X-Restli-Protocol-Version": "2.0.0",
            },
        });
        const postId = response.data.id;
        return {
            externalPostId: postId,
            url: `https://www.linkedin.com/feed/update/${postId}`,
            publishedAt: payload.scheduledFor ?? new Date(),
            rawResponse: response.data,
        };
    }
    async fetchInsights(credentials, options) {
        if (!options.postId) {
            throw new Error("LinkedIn insights requires postId");
        }
        const response = await axios_1.default.get("https://api.linkedin.com/v2/organizationalEntityShareStatistics", {
            params: {
                q: "organizationalEntity",
                organizationalEntity: options.postId,
            },
            headers: {
                Authorization: `Bearer ${credentials.accessToken}`,
            },
        });
        const metrics = response.data?.elements?.[0]?.totalShareStatistics ?? {};
        return {
            impressions: metrics.impressionCount ?? 0,
            reach: metrics.uniqueImpressionsCount ?? 0,
            engagements: metrics.engagement ?? 0,
            clicks: metrics.clickCount ?? 0,
            extra: metrics,
        };
    }
}
exports.LinkedInConnector = LinkedInConnector;
