import { prisma } from "../config/prisma";
import type { Prisma } from "@prisma/client";

interface AuditEvent {
  workspaceId: string;
  actorId?: string;
  action: string;
  entity: string;
  entityId?: string;
  payload?: Prisma.InputJsonValue;
}

export async function recordAudit(event: AuditEvent) {
  await prisma.auditLog.create({
    data: {
      workspaceId: event.workspaceId,
      actorId: event.actorId,
      action: event.action,
      entity: event.entity,
      entityId: event.entityId,
      payload: (event.payload ?? {}) as Prisma.InputJsonValue,
    },
  });
}
