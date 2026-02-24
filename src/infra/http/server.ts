import type { Express } from "express";
import express from "express";
import { errorMiddleware } from "./middleware/errorMiddleware.js";
import routes from "./routes.js";

export function createApp(): Express {
  const app = express();
  app.use(express.json());
  app.use(routes);
  app.use(errorMiddleware);
  return app;
}
