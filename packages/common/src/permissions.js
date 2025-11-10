"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasPermission = hasPermission;
const types_1 = require("./types");
const rolePermissions = {
    [types_1.UserRole.OWNER]: [
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
    [types_1.UserRole.ADMIN]: [
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
    [types_1.UserRole.MANAGER]: [
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
    [types_1.UserRole.EDITOR]: [
        "workspace:view",
        "content:create",
        "schedule:manage",
        "analytics:view",
        "comment:manage",
        "asset:manage",
    ],
    [types_1.UserRole.VIEWER]: ["workspace:view", "analytics:view"],
    [types_1.UserRole.EXTERNAL_REVIEWER]: ["workspace:view", "content:review"],
};
function hasPermission(role, permission) {
    return rolePermissions[role].includes(permission);
}
