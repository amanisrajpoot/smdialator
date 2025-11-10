"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YouTubeConnector = void 0;
const googleapis_1 = require("googleapis");
const common_1 = require("@scheduler/common");
const base_1 = require("./base");
const types_1 = require("./types");
class YouTubeConnector extends base_1.BaseConnector {
    constructor() {
        super(common_1.SocialPlatform.YOUTUBE);
    }
    features() {
        return [
            types_1.ConnectorFeature.SCHEDULING,
            types_1.ConnectorFeature.VIDEO,
            types_1.ConnectorFeature.LIVESTREAM,
            types_1.ConnectorFeature.HASHTAG_SUGGESTIONS,
        ];
    }
    async validateCredentials(credentials) {
        const oauth2Client = new googleapis_1.google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: credentials.accessToken });
        const youtube = googleapis_1.google.youtube({
            version: "v3",
            auth: oauth2Client,
        });
        try {
            await youtube.channels.list({ mine: true, part: ["id"] });
            return true;
        }
        catch {
            return false;
        }
    }
    async publish(credentials, payload) {
        if (!payload.mediaUrls?.length) {
            throw new Error("YouTube publish requires a video URL (pre-uploaded to storage/CDN)");
        }
        const oauth2Client = new googleapis_1.google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: credentials.accessToken });
        const youtube = googleapis_1.google.youtube({
            version: "v3",
            auth: oauth2Client,
        });
        const resource = {
            snippet: {
                title: payload.metadata?.title ?? payload.text.slice(0, 95),
                description: payload.text,
                tags: payload.metadata?.tags ?? [],
            },
            status: {
                privacyStatus: payload.metadata?.privacyStatus ?? "private",
                publishAt: payload.scheduledFor?.toISOString(),
            },
        };
        // Note: Actual video upload requires streaming the file. Here we register metadata only.
        const response = await youtube.videos.insert({
            part: ["snippet", "status"],
            requestBody: resource,
        });
        const videoId = response.data.id;
        return {
            externalPostId: videoId,
            url: `https://youtu.be/${videoId}`,
            publishedAt: payload.scheduledFor ?? new Date(),
            rawResponse: response.data,
        };
    }
}
exports.YouTubeConnector = YouTubeConnector;
