"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacebookPageConnector = void 0;
const axios_1 = __importDefault(require("axios"));
const common_1 = require("@scheduler/common");
const base_1 = require("./base");
const types_1 = require("./types");
class FacebookPageConnector extends base_1.BaseConnector {
    constructor() {
        super(common_1.SocialPlatform.FACEBOOK_PAGE);
    }
    features() {
        return [
            types_1.ConnectorFeature.SCHEDULING,
            types_1.ConnectorFeature.VIDEO,
            types_1.ConnectorFeature.CAROUSEL,
            types_1.ConnectorFeature.HASHTAG_SUGGESTIONS,
            types_1.ConnectorFeature.UTM_TAGGING,
            types_1.ConnectorFeature.BEST_TIME,
            types_1.ConnectorFeature.FIRST_COMMENT,
        ];
    }
    async validateCredentials(credentials) {
        try {
            const response = await axios_1.default.get("https://graph.facebook.com/debug_token", {
                params: {
                    input_token: credentials.accessToken,
                    access_token: credentials.accessToken,
                },
            });
            return !!response.data?.data?.is_valid;
        }
        catch (error) {
            return false;
        }
    }
    async publish(credentials, payload, config) {
        const pageId = payload.metadata?.pageId ??
            credentials.metadata?.pageId ??
            config?.additionalConfig?.["pageId"];
        if (!pageId) {
            throw new Error("Facebook publish requires pageId in metadata");
        }
        const requestBody = {
            message: payload.text,
            link: payload.linkAttachment,
            published: payload.scheduledFor ? false : true,
            scheduled_publish_time: payload.scheduledFor ? Math.floor(payload.scheduledFor.getTime() / 1000) : undefined,
        };
        if (payload.mediaUrls && payload.mediaUrls.length > 0) {
            requestBody.attached_media = payload.mediaUrls.map((url) => ({
                media_fbid: url,
            }));
        }
        const response = await axios_1.default.post(`https://graph.facebook.com/v18.0/${pageId}/feed`, requestBody, {
            params: {
                access_token: credentials.accessToken,
            },
        });
        const postId = response.data.post_id ?? response.data.id;
        return {
            externalPostId: postId,
            url: `https://facebook.com/${postId}`,
            publishedAt: payload.scheduledFor ?? new Date(),
            rawResponse: response.data,
        };
    }
}
exports.FacebookPageConnector = FacebookPageConnector;
