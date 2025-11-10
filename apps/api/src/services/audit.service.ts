import { prisma } from "../config/prisma";

interface AuditEvent {
  workspaceId: string;
  actorId?: string;
  action: string;
  entity: string;
  entityId?: string;
  payload?: Record<string, unknown>;
}

export async function recordAudit(event: AuditEvent) {
  await prisma.auditLog.create({
    data: {
      workspaceId: event.workspaceId,
      actorId: event.actorId,
      action: event.action,
      entity: event.entity,
      entityId: event.entityId,
      payload: event.payload ?? {},
    },
  });
}
