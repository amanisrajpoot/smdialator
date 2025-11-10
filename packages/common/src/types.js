"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutomationAction = exports.AutomationTrigger = exports.AssetType = exports.PublishingJobStatus = exports.ScheduledPostStatus = exports.ContentStatus = exports.SocialPlatform = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["OWNER"] = "OWNER";
    UserRole["ADMIN"] = "ADMIN";
    UserRole["MANAGER"] = "MANAGER";
    UserRole["EDITOR"] = "EDITOR";
    UserRole["VIEWER"] = "VIEWER";
    UserRole["EXTERNAL_REVIEWER"] = "EXTERNAL_REVIEWER";
})(UserRole || (exports.UserRole = UserRole = {}));
var SocialPlatform;
(function (SocialPlatform) {
    SocialPlatform["FACEBOOK_PAGE"] = "FACEBOOK_PAGE";
    SocialPlatform["INSTAGRAM_BUSINESS"] = "INSTAGRAM_BUSINESS";
    SocialPlatform["THREADS"] = "THREADS";
    SocialPlatform["TWITTER"] = "TWITTER";
    SocialPlatform["LINKEDIN_PAGE"] = "LINKEDIN_PAGE";
    SocialPlatform["LINKEDIN_PROFILE"] = "LINKEDIN_PROFILE";
    SocialPlatform["TIKTOK"] = "TIKTOK";
    SocialPlatform["PINTEREST"] = "PINTEREST";
    SocialPlatform["YOUTUBE"] = "YOUTUBE";
    SocialPlatform["SNAPCHAT"] = "SNAPCHAT";
    SocialPlatform["REDDIT"] = "REDDIT";
    SocialPlatform["GOOGLE_BUSINESS"] = "GOOGLE_BUSINESS";
    SocialPlatform["CUSTOM_WEBHOOK"] = "CUSTOM_WEBHOOK";
})(SocialPlatform || (exports.SocialPlatform = SocialPlatform = {}));
var ContentStatus;
(function (ContentStatus) {
    ContentStatus["DRAFT"] = "DRAFT";
    ContentStatus["IN_REVIEW"] = "IN_REVIEW";
    ContentStatus["APPROVED"] = "APPROVED";
    ContentStatus["SCHEDULED"] = "SCHEDULED";
    ContentStatus["PUBLISHED"] = "PUBLISHED";
    ContentStatus["FAILED"] = "FAILED";
    ContentStatus["ARCHIVED"] = "ARCHIVED";
})(ContentStatus || (exports.ContentStatus = ContentStatus = {}));
var ScheduledPostStatus;
(function (ScheduledPostStatus) {
    ScheduledPostStatus["QUEUED"] = "QUEUED";
    ScheduledPostStatus["PENDING_APPROVAL"] = "PENDING_APPROVAL";
    ScheduledPostStatus["READY"] = "READY";
    ScheduledPostStatus["RUNNING"] = "RUNNING";
    ScheduledPostStatus["SUCCEEDED"] = "SUCCEEDED";
    ScheduledPostStatus["FAILED"] = "FAILED";
    ScheduledPostStatus["CANCELLED"] = "CANCELLED";
})(ScheduledPostStatus || (exports.ScheduledPostStatus = ScheduledPostStatus = {}));
var PublishingJobStatus;
(function (PublishingJobStatus) {
    PublishingJobStatus["QUEUED"] = "QUEUED";
    PublishingJobStatus["RUNNING"] = "RUNNING";
    PublishingJobStatus["SUCCEEDED"] = "SUCCEEDED";
    PublishingJobStatus["FAILED"] = "FAILED";
    PublishingJobStatus["RETRYING"] = "RETRYING";
    PublishingJobStatus["CANCELLED"] = "CANCELLED";
})(PublishingJobStatus || (exports.PublishingJobStatus = PublishingJobStatus = {}));
var AssetType;
(function (AssetType) {
    AssetType["IMAGE"] = "IMAGE";
    AssetType["VIDEO"] = "VIDEO";
    AssetType["CAROUSEL"] = "CAROUSEL";
    AssetType["DOCUMENT"] = "DOCUMENT";
    AssetType["AUDIO"] = "AUDIO";
})(AssetType || (exports.AssetType = AssetType = {}));
var AutomationTrigger;
(function (AutomationTrigger) {
    AutomationTrigger["POST_APPROVED"] = "POST_APPROVED";
    AutomationTrigger["POST_PUBLISHED"] = "POST_PUBLISHED";
    AutomationTrigger["POST_FAILED"] = "POST_FAILED";
    AutomationTrigger["NEW_DRAFT"] = "NEW_DRAFT";
    AutomationTrigger["NEW_COMMENT"] = "NEW_COMMENT";
    AutomationTrigger["MANUAL"] = "MANUAL";
})(AutomationTrigger || (exports.AutomationTrigger = AutomationTrigger = {}));
var AutomationAction;
(function (AutomationAction) {
    AutomationAction["SCHEDULE_POST"] = "SCHEDULE_POST";
    AutomationAction["UPDATE_DRAFT"] = "UPDATE_DRAFT";
    AutomationAction["NOTIFY_SLACK"] = "NOTIFY_SLACK";
    AutomationAction["SEND_EMAIL"] = "SEND_EMAIL";
    AutomationAction["TRIGGER_N8N"] = "TRIGGER_N8N";
    AutomationAction["CALL_WEBHOOK"] = "CALL_WEBHOOK";
})(AutomationAction || (exports.AutomationAction = AutomationAction = {}));
