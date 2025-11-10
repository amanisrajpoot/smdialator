import { UserRole } from "./types";

export type Permission =
  | "workspace:manage"
  | "workspace:view"
  | "content:create"
  | "content:review"
  | "schedule:manage"
  | "analytics:view"
  | "automation:manage"
  | "connector:manage"
  | "asset:manage"
  | "comment:manage";

const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.OWNER]: [
    "workspace:manage",
    "workspace:view",
    "content:create",
    "content:review",
    "schedule:manage",
    "analytics:view",
    "automation:manage",
    "connector:manage",
    "asset:manage",
    "comment:manage",
  ],
  [UserRole.ADMIN]: [
    "workspace:manage",
    "workspace:view",
    "content:create",
    "content:review",
    "schedule:manage",
    "analytics:view",
    "automation:manage",
    "connector:manage",
    "asset:manage",
    "comment:manage",
  ],
  [UserRole.MANAGER]: [
    "workspace:view",
    "content:create",
    "content:review",
    "schedule:manage",
    "analytics:view",
    "automation:manage",
    "connector:manage",
    "asset:manage",
    "comment:manage",
  ],
  [UserRole.EDITOR]: [
    "workspace:view",
    "content:create",
    "schedule:manage",
    "analytics:view",
    "comment:manage",
    "asset:manage",
  ],
  [UserRole.VIEWER]: ["workspace:view", "analytics:view"],
  [UserRole.EXTERNAL_REVIEWER]: ["workspace:view", "content:review"],
};

export function hasPermission(role: UserRole, permission: Permission) {
  return rolePermissions[role].includes(permission);
}
