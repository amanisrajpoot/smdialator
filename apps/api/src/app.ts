import express from "express";
import helmet from "helmet";
import cors from "cors";

import { env } from "./config/env";
import { createHttpLoggingMiddleware } from "./middleware/logging";
import { requestContextMiddleware } from "./middleware/request-context";
import { registerRoutes } from "./routes";
import { notFoundHandler } from "./middleware/not-found";
import { errorHandler } from "./middleware/error-handler";

export const app = express();

app.disable("x-powered-by");

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(
  cors({
    origin: env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN.split(","),
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(createHttpLoggingMiddleware());
app.use(requestContextMiddleware);

registerRoutes(app);

app.use(notFoundHandler);
app.use(errorHandler);
