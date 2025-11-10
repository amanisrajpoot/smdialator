"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstagramBusinessConnector = void 0;
const axios_1 = __importDefault(require("axios"));
const common_1 = require("@scheduler/common");
const base_1 = require("./base");
const types_1 = require("./types");
class InstagramBusinessConnector extends base_1.BaseConnector {
    constructor() {
        super(common_1.SocialPlatform.INSTAGRAM_BUSINESS);
    }
    features() {
        return [
            types_1.ConnectorFeature.SCHEDULING,
            types_1.ConnectorFeature.REEL,
            types_1.ConnectorFeature.CAROUSEL,
            types_1.ConnectorFeature.HASHTAG_SUGGESTIONS,
            types_1.ConnectorFeature.FIRST_COMMENT,
        ];
    }
    async validateCredentials(credentials) {
        try {
            await axios_1.default.get("https://graph.facebook.com/v18.0/me/accounts", {
                params: { access_token: credentials.accessToken },
            });
            return true;
        }
        catch {
            return false;
        }
    }
    async publish(credentials, payload) {
        const igBusinessId = payload.metadata?.instagramBusinessId ??
            credentials.metadata?.instagramBusinessId;
        if (!igBusinessId) {
            throw new Error("Instagram publish requires instagramBusinessId in metadata");
        }
        const creationParams = {
            caption: payload.text,
        };
        if (payload.mediaUrls?.length === 1) {
            creationParams.image_url = payload.mediaUrls[0];
        }
        else if (payload.mediaUrls && payload.mediaUrls.length > 1) {
            creationParams.children = payload.mediaUrls.map((url) => ({
                media_type: "IMAGE",
                image_url: url,
            }));
            creationParams.media_type = "CAROUSEL";
        }
        const container = await axios_1.default.post(`https://graph.facebook.com/v18.0/${igBusinessId}/media`, creationParams, {
            params: { access_token: credentials.accessToken },
        });
        const containerId = container.data.id;
        const publishResponse = await axios_1.default.post(`https://graph.facebook.com/v18.0/${igBusinessId}/media_publish`, {
            creation_id: containerId,
        }, { params: { access_token: credentials.accessToken } });
        const postId = publishResponse.data.id;
        return {
            externalPostId: postId,
            url: `https://www.instagram.com/p/${postId}`,
            publishedAt: payload.scheduledFor ?? new Date(),
            rawResponse: publishResponse.data,
        };
    }
}
exports.InstagramBusinessConnector = InstagramBusinessConnector;
