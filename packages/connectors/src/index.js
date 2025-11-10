"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConnector = getConnector;
exports.listConnectors = listConnectors;
const common_1 = require("@scheduler/common");
const facebook_1 = require("./facebook");
const instagram_1 = require("./instagram");
const twitter_1 = require("./twitter");
const linkedin_1 = require("./linkedin");
const tiktok_1 = require("./tiktok");
const pinterest_1 = require("./pinterest");
const youtube_1 = require("./youtube");
const threads_1 = require("./threads");
const reddit_1 = require("./reddit");
const google_business_1 = require("./google-business");
const custom_webhook_1 = require("./custom-webhook");
const snapchat_1 = require("./snapchat");
const registry = {
    [common_1.SocialPlatform.FACEBOOK_PAGE]: new facebook_1.FacebookPageConnector(),
    [common_1.SocialPlatform.INSTAGRAM_BUSINESS]: new instagram_1.InstagramBusinessConnector(),
    [common_1.SocialPlatform.THREADS]: new threads_1.ThreadsConnector(),
    [common_1.SocialPlatform.TWITTER]: new twitter_1.TwitterConnector(),
    [common_1.SocialPlatform.LINKEDIN_PAGE]: new linkedin_1.LinkedInConnector(),
    [common_1.SocialPlatform.LINKEDIN_PROFILE]: new linkedin_1.LinkedInConnector(),
    [common_1.SocialPlatform.TIKTOK]: new tiktok_1.TikTokConnector(),
    [common_1.SocialPlatform.PINTEREST]: new pinterest_1.PinterestConnector(),
    [common_1.SocialPlatform.YOUTUBE]: new youtube_1.YouTubeConnector(),
    [common_1.SocialPlatform.SNAPCHAT]: new snapchat_1.SnapchatConnector(),
    [common_1.SocialPlatform.REDDIT]: new reddit_1.RedditConnector(),
    [common_1.SocialPlatform.GOOGLE_BUSINESS]: new google_business_1.GoogleBusinessConnector(),
    [common_1.SocialPlatform.CUSTOM_WEBHOOK]: new custom_webhook_1.CustomWebhookConnector(),
};
function getConnector(platform) {
    const connector = registry[platform];
    if (!connector) {
        throw new Error(`Unsupported platform: ${platform}`);
    }
    return connector;
}
function listConnectors() {
    return Object.entries(registry).map(([platform, connector]) => ({
        platform: platform,
        features: connector.features(),
    }));
}
__exportStar(require("./types"), exports);
