import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma";
import { env } from "../config/env";
import { randomUUID } from "node:crypto";

interface AccessTokenPayload {
  sub: string;
  workspaceId?: string;
  role?: string;
}

export async function createAccessToken(userId: string, workspaceId?: string, role?: string) {
  const payload: AccessTokenPayload = {
    sub: userId,
    workspaceId,
    role,
  };

  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRATION,
  });
}

export async function createRefreshToken(userId: string) {
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + parseJwtExpiration(env.REFRESH_TOKEN_EXPIRATION));

  await prisma.refreshToken.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });

  return token;
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload;
}

export async function rotateRefreshToken(oldToken: string) {
  const existing = await prisma.refreshToken.findUnique({
    where: { token: oldToken },
  });

  if (!existing || existing.expiresAt < new Date()) {
    throw new Error("Invalid refresh token");
  }

  await prisma.refreshToken.delete({ where: { token: oldToken } });

  return createRefreshToken(existing.userId);
}

export async function revokeRefreshToken(token: string) {
  await prisma.refreshToken.deleteMany({
    where: { token },
  });
}

export async function revokeAllRefreshTokens(userId: string) {
  await prisma.refreshToken.deleteMany({
    where: { userId },
  });
}

function parseJwtExpiration(duration: string): number {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error(`Invalid duration: ${duration}`);
  }
  const value = Number(match[1]);
  const unit = match[2];
  switch (unit) {
    case "s":
      return value * 1000;
    case "m":
      return value * 60 * 1000;
    case "h":
      return value * 60 * 60 * 1000;
    case "d":
      return value * 24 * 60 * 60 * 1000;
    default:
      throw new Error(`Unsupported unit: ${unit}`);
  }
}
