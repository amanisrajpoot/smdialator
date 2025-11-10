import type { User, Workspace } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: User;
      workspace?: Workspace;
    }
  }
}

export {};
