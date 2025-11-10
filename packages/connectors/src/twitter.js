"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwitterConnector = void 0;
const axios_1 = __importDefault(require("axios"));
const common_1 = require("@scheduler/common");
const base_1 = require("./base");
const types_1 = require("./types");
class TwitterConnector extends base_1.BaseConnector {
    constructor() {
        super(common_1.SocialPlatform.TWITTER);
    }
    features() {
        return [
            types_1.ConnectorFeature.SCHEDULING,
            types_1.ConnectorFeature.HASHTAG_SUGGESTIONS,
            types_1.ConnectorFeature.MENTION_LOOKUP,
            types_1.ConnectorFeature.BEST_TIME,
        ];
    }
    async validateCredentials(credentials) {
        try {
            await axios_1.default.get("https://api.twitter.com/2/users/me", {
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
        const body = {
            text: payload.text,
        };
        if (payload.mediaUrls?.length) {
            body.media = {
                media_ids: payload.mediaUrls,
            };
        }
        const response = await axios_1.default.post("https://api.twitter.com/2/tweets", body, {
            headers: {
                Authorization: `Bearer ${credentials.accessToken}`,
            },
        });
        const tweetId = response.data?.data?.id;
        return {
            externalPostId: tweetId,
            url: tweetId ? `https://x.com/i/web/status/${tweetId}` : undefined,
            publishedAt: payload.scheduledFor ?? new Date(),
            rawResponse: response.data,
        };
    }
    async fetchInsights(credentials, options) {
        if (!options.postId) {
            throw new Error("Twitter insights requires postId");
        }
        const response = await axios_1.default.get(`https://api.twitter.com/2/tweets/${options.postId}`, {
            params: {
                "tweet.fields": "public_metrics",
            },
            headers: {
                Authorization: `Bearer ${credentials.accessToken}`,
            },
        });
        const metrics = response.data?.data?.public_metrics ?? {};
        const impressionCount = metrics.impression_count ?? 0;
        const profileClicks = metrics.user_profile_clicks ?? 0;
        const replyCount = metrics.reply_count ?? 0;
        const retweetCount = metrics.retweet_count ?? 0;
        const likeCount = metrics.like_count ?? 0;
        const urlClicks = metrics.url_link_clicks ?? 0;
        return {
            impressions: impressionCount,
            reach: profileClicks,
            engagements: replyCount + retweetCount + likeCount,
            clicks: urlClicks,
            extra: metrics,
        };
    }
}
exports.TwitterConnector = TwitterConnector;
