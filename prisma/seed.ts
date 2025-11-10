import { PrismaClient, UserRole, SocialPlatform, ContentStatus, ScheduledPostStatus, PublishingJobStatus, AutomationTrigger, AutomationAction, AssetType } from "@prisma/client";
import dayjs from "dayjs";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash("Password123!", 12);

  const user = await prisma.user.upsert({
    where: { email: "founder@example.com" },
    update: {},
    create: {
      email: "founder@example.com",
      name: "Scheduler Founder",
      passwordHash,
      role: UserRole.OWNER,
    },
  });

  const workspace = await prisma.workspace.upsert({
    where: { slug: "demo-brand" },
    update: {},
    create: {
      name: "Demo Brand",
      slug: "demo-brand",
      timezone: "America/New_York",
      members: {
        create: {
          userId: user.id,
          role: UserRole.OWNER,
        },
      },
    },
  });

  const profile = await prisma.socialProfile.upsert({
    where: { externalId: "demo-facebook-page" },
    update: {},
    create: {
      workspaceId: workspace.id,
      platform: SocialPlatform.FACEBOOK_PAGE,
      displayName: "Demo Brand Facebook",
      handle: "@demobrand",
      externalId: "demo-facebook-page",
      accessToken: "fake-token",
      metadata: {
        pageId: "1234567890",
      },
    },
  });

  const content = await prisma.contentItem.create({
    data: {
      workspaceId: workspace.id,
      title: "Spring Product Launch",
      summary: "Announce new spring collection",
      status: ContentStatus.APPROVED,
      targetPlatforms: [SocialPlatform.FACEBOOK_PAGE, SocialPlatform.INSTAGRAM_BUSINESS],
      aiContext: { campaign: "Spring Launch" },
      createdById: user.id,
      versions: {
        create: {
          authorId: user.id,
          body: "Excited to share our new spring collection 🌸 #spring #fashion",
        },
      },
    },
  });

  await prisma.asset.create({
    data: {
      workspaceId: workspace.id,
      ownerId: user.id,
      type: AssetType.IMAGE,
      url: "https://example.com/assets/spring1.jpg",
      tags: ["spring", "lookbook"],
    },
  });

  const scheduledPost = await prisma.scheduledPost.create({
    data: {
      workspaceId: workspace.id,
      contentId: content.id,
      profileId: profile.id,
      scheduledFor: dayjs().add(2, "day").toDate(),
      localTimezone: "America/New_York",
      status: ScheduledPostStatus.QUEUED,
      metadata: {
        mediaUrls: ["https://example.com/assets/spring1.jpg"],
      },
      createdById: user.id,
    },
  });

  await prisma.publishingJob.create({
    data: {
      scheduledPostId: scheduledPost.id,
      profileId: profile.id,
      status: PublishingJobStatus.QUEUED,
    },
  });

  await prisma.automationWorkflow.create({
    data: {
      workspaceId: workspace.id,
      name: "Notify Slack on Publish",
      trigger: AutomationTrigger.POST_PUBLISHED,
      actions: [AutomationAction.NOTIFY_SLACK],
      config: {
        channel: "#social-updates",
      },
      createdById: user.id,
    },
  });

  console.log("Seeded demo data");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
