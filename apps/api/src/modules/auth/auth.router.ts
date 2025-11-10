import { Router } from "express";
import { registerSchema, loginSchema } from "@scheduler/common";
import { prisma } from "../../config/prisma";
import { hashPassword, comparePassword } from "../../services/password.service";
import { createAccessToken, createRefreshToken, rotateRefreshToken, revokeRefreshToken } from "../../services/token.service";
import { httpErrors } from "../../lib/errors";
import { authenticate } from "../../middleware/authenticate";

export const authRouter = Router();

authRouter.post("/register", async (req, res, next) => {
  try {
    const payload = registerSchema.parse(req.body);

    const existing = await prisma.user.findUnique({
      where: { email: payload.email },
    });
    if (existing) {
      throw httpErrors.conflict("Email is already registered");
    }

    const passwordHash = await hashPassword(payload.password);

    const workspaceSlug = payload.workspaceSlug.toLowerCase();

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: payload.email,
          name: payload.name,
          passwordHash,
        },
      });

      const workspace = await tx.workspace.create({
        data: {
          name: payload.workspaceName,
          slug: workspaceSlug,
          members: {
            create: {
              userId: user.id,
              role: "OWNER",
            },
          },
        },
      });

      return { user, workspace };
    });

    const accessToken = await createAccessToken(result.user.id, result.workspace.id, "OWNER");
    const refreshToken = await createRefreshToken(result.user.id);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
        },
        workspace: {
          id: result.workspace.id,
          name: result.workspace.name,
          slug: result.workspace.slug,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const payload = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: payload.email },
      include: {
        workspaces: {
          include: {
            workspace: true,
          },
        },
      },
    });

    if (!user) {
      throw httpErrors.unauthorized("Invalid credentials");
    }

    const matches = await comparePassword(payload.password, user.passwordHash);
    if (!matches) {
      throw httpErrors.unauthorized("Invalid credentials");
    }

    const primaryMembership = user.workspaces[0];
    const workspace = primaryMembership?.workspace;
    const role = primaryMembership?.role ?? user.role ?? "EDITOR";

    const accessToken = await createAccessToken(user.id, workspace?.id, role);
    const refreshToken = await createRefreshToken(user.id);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: role,
        },
        workspace: workspace
          ? {
              id: workspace.id,
              name: workspace.name,
              slug: workspace.slug,
            }
          : null,
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/refresh", async (req, res, next) => {
  try {
    const token = req.body.refreshToken as string | undefined;
    if (!token) {
      throw httpErrors.badRequest("refreshToken is required");
    }

    const newToken = await rotateRefreshToken(token);

    res.json({
      success: true,
      data: {
        refreshToken: newToken,
      },
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/logout", async (req, res, next) => {
  try {
    const token = req.body.refreshToken as string | undefined;
    if (token) {
      await revokeRefreshToken(token);
    }
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

authRouter.get("/me", authenticate, async (req, res, next) => {
  try {
    if (!req.user) {
      throw httpErrors.unauthorized();
    }

    const memberships = await prisma.workspaceMember.findMany({
      where: { userId: req.user.id },
      include: { workspace: true },
    });

    res.json({
      success: true,
      data: {
        user: {
          id: req.user.id,
          email: req.user.email,
          name: req.user.name,
        },
        memberships: memberships.map((membership) => ({
          workspace: {
            id: membership.workspace.id,
            name: membership.workspace.name,
            slug: membership.workspace.slug,
          },
          role: membership.role,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
});
