import { z } from "zod";
import { AutomationAction, AutomationTrigger, ContentStatus, ScheduledPostStatus, SocialPlatform, UserRole } from "./types";

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(20),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  workspaceName: z.string().min(1),
  workspaceSlug: z.string().regex(/^[a-z0-9-]+$/, "Slug must be URL friendly"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const createWorkspaceSchema = z.object({
  name: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  timezone: z.string().default("UTC"),
  description: z.string().optional(),
});

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.nativeEnum(UserRole),
});

export const socialProfileSchema = z.object({
  platform: z.nativeEnum(SocialPlatform),
  externalId: z.string().min(1),
  displayName: z.string().min(1),
  handle: z.string().min(1),
  accessToken: z.string().min(1),
  refreshToken: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export const contentUpsertSchema = z.object({
  title: z.string().min(1),
  summary: z.string().optional(),
  body: z.string().min(1),
  status: z.nativeEnum(ContentStatus).optional(),
  campaignId: z.string().optional(),
  targetPlatforms: z.array(z.nativeEnum(SocialPlatform)).min(1),
  assets: z.array(
    z.object({
      assetId: z.string(),
      order: z.number().int().nonnegative().default(0),
    })
  ).optional(),
  aiContext: z.record(z.any()).optional(),
});

export const schedulePostSchema = z.object({
  contentId: z.string().min(1),
  profileId: z.string().min(1),
  scheduledFor: z.coerce.date(),
  timezone: z.string().default("UTC"),
  campaignId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export const updateScheduleStatusSchema = z.object({
  status: z.nativeEnum(ScheduledPostStatus),
  failureReason: z.string().optional(),
});

export const automationWorkflowSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  trigger: z.nativeEnum(AutomationTrigger),
  actions: z.array(z.nativeEnum(AutomationAction)).min(1),
  config: z.record(z.any()).optional(),
  isActive: z.boolean().default(true),
});

export const aiGenerationSchema = z.object({
  prompt: z.string().min(1),
  tone: z.enum(["friendly", "professional", "bold", "playful"]).default("friendly"),
  platform: z.nativeEnum(SocialPlatform).optional(),
  language: z.string().default("en"),
  wordCount: z.number().int().min(20).max(2000).default(200),
  hashtags: z.number().int().min(0).max(30).default(5),
  imagePrompt: z.string().optional(),
});
