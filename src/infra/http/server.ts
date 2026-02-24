import type { Express, Router } from "express";
import express from "express";
import swaggerUi from "swagger-ui-express";
import { createSwaggerSpec } from "./swagger.js";
import { errorMiddleware } from "./middleware/errorMiddleware.js";

export function createApp(routes: Router): Express {
  const app = express();
  app.use(express.json());
  const swaggerSpec = createSwaggerSpec();
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use(routes);
  app.use(errorMiddleware);
  return app;
}
