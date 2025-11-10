"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PinterestConnector = void 0;
const axios_1 = __importDefault(require("axios"));
const common_1 = require("@scheduler/common");
const base_1 = require("./base");
const types_1 = require("./types");
class PinterestConnector extends base_1.BaseConnector {
    constructor() {
        super(common_1.SocialPlatform.PINTEREST);
    }
    features() {
        return [
            types_1.ConnectorFeature.SCHEDULING,
            types_1.ConnectorFeature.CAROUSEL,
            types_1.ConnectorFeature.HASHTAG_SUGGESTIONS,
        ];
    }
    async validateCredentials(credentials) {
        try {
            await axios_1.default.get("https://api.pinterest.com/v5/user_account", {
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
        const boardId = payload.metadata?.boardId ??
            credentials.metadata?.boardId;
        if (!boardId) {
            throw new Error("Pinterest publish requires boardId");
        }
        const response = await axios_1.default.post("https://api.pinterest.com/v5/pins", {
            board_id: boardId,
            title: payload.metadata?.title ?? payload.text.slice(0, 100),
            description: payload.text,
            media_source: {
                source_type: "image_url",
                url: payload.mediaUrls?.[0],
            },
            link: payload.linkAttachment,
        }, {
            headers: {
                Authorization: `Bearer ${credentials.accessToken}`,
            },
        });
        return {
            externalPostId: response.data.id,
            url: response.data.link,
            publishedAt: payload.scheduledFor ?? new Date(),
            rawResponse: response.data,
        };
    }
}
exports.PinterestConnector = PinterestConnector;
