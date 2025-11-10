import pino from "pino";
import pinoPretty from "pino-pretty";
import { env } from "./env";

const isDev = env.NODE_ENV !== "production";

const stream = isDev
  ? pinoPretty({
      colorize: true,
      translateTime: "SYS:standard",
      singleLine: false,
    })
  : undefined;

export const logger = pino(
  {
    level: isDev ? "debug" : "info",
    base: undefined,
    redact: ["req.headers.authorization", "password", "token"],
  },
  stream
);
