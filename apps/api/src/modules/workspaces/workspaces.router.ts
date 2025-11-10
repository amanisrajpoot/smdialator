import { Router } from "express";
import { createWorkspaceSchema, inviteMemberSchema } from "@scheduler/common";
import { prisma } from "../../config/prisma";
import { authenticate, requirePermissions } from "../../middleware/authenticate";
import { loadWorkspaceContext } from "../../middleware/workspace-context";
import { httpErrors } from "../../lib/errors";
import { recordAudit } from "../../services/audit.service";

export const workspacesRouter = Router();

workspacesRouter.use(authenticate);

workspacesRouter.get("/", async (req, res, next) => {
  try {
    const memberships = await prisma.workspaceMember.findMany({
      where: { userId: req.user!.id },
      include: {
        workspace: true,
      },
    });

    res.json({
      success: true,
      data: memberships.map((membership) => ({
        workspace: {
          id: membership.workspace.id,
          name: membership.workspace.name,
          slug: membership.workspace.slug,
          timezone: membership.workspace.timezone,
        },
        role: membership.role,
      })),
    });
  } catch (error) {
    next(error);
  }
});

workspacesRouter.post("/", async (req, res, next) => {
  try {
    const payload = createWorkspaceSchema.parse(req.body);

    const workspace = await prisma.workspace.create({
      data: {
        name: payload.name,
        slug: payload.slug,
        timezone: payload.timezone,
        description: payload.description,
        members: {
          create: {
            userId: req.user!.id,
            role: "OWNER",
          },
        },
      },
    });

    await recordAudit({
      workspaceId: workspace.id,
      actorId: req.user!.id,
      action: "workspace.created",
      entity: "workspace",
      entityId: workspace.id,
    });

    res.status(201).json({
      success: true,
      data: workspace,
    });
  } catch (error) {
    next(error);
  }
});

workspacesRouter.get("/:workspaceId", loadWorkspaceContext(), async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        workspace: req.workspace,
        role: res.locals.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

workspacesRouter.post(
  "/:workspaceId/invite",
  loadWorkspaceContext(),
  requirePermissions("workspace:manage"),
  async (req, res, next) => {
    try {
      const workspaceId = req.workspace!.id;
      const payload = inviteMemberSchema.parse(req.body);

      const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
      });
      if (!workspace) {
        throw httpErrors.notFound("Workspace not found");
      }

      let user = await prisma.user.findUnique({
        where: { email: payload.email },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: payload.email,
            role: payload.role,
          },
        });
      }

      await prisma.workspaceMember.upsert({
        where: {
          userId_workspaceId: {
            userId: user.id,
            workspaceId,
          },
        },
        create: {
          userId: user.id,
          workspaceId,
          role: payload.role,
        },
        update: {
          role: payload.role,
        },
      });

      await recordAudit({
        workspaceId,
        actorId: req.user!.id,
        action: "workspace.member_invited",
        entity: "workspace",
        entityId: workspaceId,
        payload: {
          invitedUserId: user.id,
          role: payload.role,
        },
      });

      res.status(201).json({
        success: true,
        data: {
          userId: user.id,
          role: payload.role,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);
