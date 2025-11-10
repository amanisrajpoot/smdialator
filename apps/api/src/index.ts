import { createServer } from "./server";
import { env } from "./config/env";
import { logger } from "./config/logger";

async function bootstrap() {
  try {
    const server = await createServer();
    server.listen(env.PORT, () => {
      logger.info(
        {
          port: env.PORT,
          env: env.NODE_ENV,
        },
        "API server started"
      );
    });
  } catch (error) {
    logger.error(error, "Failed to bootstrap API server");
    process.exit(1);
  }
}

bootstrap();
