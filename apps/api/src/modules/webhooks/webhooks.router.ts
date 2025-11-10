import { Router } from "express";
import { logger } from "../../config/logger";

export const webhooksRouter = Router();

webhooksRouter.post("/n8n", (req, res) => {
  logger.info({ payload: req.body }, "Received n8n webhook");
  res.json({ success: true });
});

webhooksRouter.post("/social/:platform", (req, res) => {
  logger.info(
    {
      platform: req.params.platform,
      payload: req.body,
    },
    "Received social webhook"
  );
  res.json({ success: true });
});
