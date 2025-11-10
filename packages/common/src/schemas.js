"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiGenerationSchema = exports.automationWorkflowSchema = exports.updateScheduleStatusSchema = exports.schedulePostSchema = exports.contentUpsertSchema = exports.socialProfileSchema = exports.inviteMemberSchema = exports.createWorkspaceSchema = exports.loginSchema = exports.registerSchema = exports.paginationSchema = void 0;
const zod_1 = require("zod");
const types_1 = require("./types");
exports.paginationSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    pageSize: zod_1.z.coerce.number().int().min(1).max(200).default(20),
});
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    name: zod_1.z.string().min(1),
    workspaceName: zod_1.z.string().min(1),
    workspaceSlug: zod_1.z.string().regex(/^[a-z0-9-]+$/, "Slug must be URL friendly"),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
});
exports.createWorkspaceSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    slug: zod_1.z.string().regex(/^[a-z0-9-]+$/),
    timezone: zod_1.z.string().default("UTC"),
    description: zod_1.z.string().optional(),
});
exports.inviteMemberSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    role: zod_1.z.nativeEnum(types_1.UserRole),
});
exports.socialProfileSchema = zod_1.z.object({
    platform: zod_1.z.nativeEnum(types_1.SocialPlatform),
    externalId: zod_1.z.string().min(1),
    displayName: zod_1.z.string().min(1),
    handle: zod_1.z.string().min(1),
    accessToken: zod_1.z.string().min(1),
    refreshToken: zod_1.z.string().optional(),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.contentUpsertSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    summary: zod_1.z.string().optional(),
    body: zod_1.z.string().min(1),
    status: zod_1.z.nativeEnum(types_1.ContentStatus).optional(),
    campaignId: zod_1.z.string().optional(),
    targetPlatforms: zod_1.z.array(zod_1.z.nativeEnum(types_1.SocialPlatform)).min(1),
    assets: zod_1.z.array(zod_1.z.object({
        assetId: zod_1.z.string(),
        order: zod_1.z.number().int().nonnegative().default(0),
    })).optional(),
    aiContext: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.schedulePostSchema = zod_1.z.object({
    contentId: zod_1.z.string().min(1),
    profileId: zod_1.z.string().min(1),
    scheduledFor: zod_1.z.coerce.date(),
    timezone: zod_1.z.string().default("UTC"),
    campaignId: zod_1.z.string().optional(),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.updateScheduleStatusSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(types_1.ScheduledPostStatus),
    failureReason: zod_1.z.string().optional(),
});
exports.automationWorkflowSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    trigger: zod_1.z.nativeEnum(types_1.AutomationTrigger),
    actions: zod_1.z.array(zod_1.z.nativeEnum(types_1.AutomationAction)).min(1),
    config: zod_1.z.record(zod_1.z.any()).optional(),
    isActive: zod_1.z.boolean().default(true),
});
exports.aiGenerationSchema = zod_1.z.object({
    prompt: zod_1.z.string().min(1),
    tone: zod_1.z.enum(["friendly", "professional", "bold", "playful"]).default("friendly"),
    platform: zod_1.z.nativeEnum(types_1.SocialPlatform).optional(),
    language: zod_1.z.string().default("en"),
    wordCount: zod_1.z.number().int().min(20).max(2000).default(200),
    hashtags: zod_1.z.number().int().min(0).max(30).default(5),
    imagePrompt: zod_1.z.string().optional(),
});
