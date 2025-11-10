"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedditConnector = void 0;
const axios_1 = __importDefault(require("axios"));
const common_1 = require("@scheduler/common");
const base_1 = require("./base");
const types_1 = require("./types");
class RedditConnector extends base_1.BaseConnector {
    constructor() {
        super(common_1.SocialPlatform.REDDIT);
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
            await axios_1.default.get("https://oauth.reddit.com/api/v1/me", {
                headers: {
                    Authorization: `Bearer ${credentials.accessToken}`,
                    "User-Agent": "omni-scheduler/0.1.0",
                },
            });
            return true;
        }
        catch {
            return false;
        }
    }
    async publish(credentials, payload) {
        const subreddit = payload.metadata?.subreddit ??
            credentials.metadata?.subreddit;
        if (!subreddit) {
            throw new Error("Reddit publish requires subreddit metadata");
        }
        const response = await axios_1.default.post("https://oauth.reddit.com/api/submit", new URLSearchParams({
            sr: subreddit,
            kind: payload.mediaUrls?.length ? "link" : "self",
            title: payload.metadata?.title ?? payload.text.slice(0, 290),
            text: payload.text,
            url: payload.mediaUrls?.[0] ?? payload.linkAttachment ?? "",
        }), {
            headers: {
                Authorization: `Bearer ${credentials.accessToken}`,
                "User-Agent": "omni-scheduler/0.1.0",
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });
        const postId = response.data?.json?.data?.id ?? response.data?.name;
        return {
            externalPostId: postId,
            url: postId ? `https://reddit.com/${postId}` : undefined,
            publishedAt: payload.scheduledFor ?? new Date(),
            rawResponse: response.data,
        };
    }
}
exports.RedditConnector = RedditConnector;
