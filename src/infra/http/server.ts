import type { Express, Router } from "express";
import express from "express";
import { errorMiddleware } from "./middleware/errorMiddleware.js";

export function createApp(routes: Router): Express {
  const app = express();
  app.use(express.json());
  app.use(routes);
  app.use(errorMiddleware);
  return app;
}
