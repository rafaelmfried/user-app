import { Router } from "express";
import type { HttpController } from "./controllers/HttpController.js";

export type HttpControllers = {
  createUserController: HttpController;
  listUserController: HttpController;
  healthCheckController: HttpController;
};

export function createRoutes(controllers: HttpControllers): Router {
  const router = Router();

  router.post("/users", controllers.createUserController.handle);
  router.get("/users", controllers.listUserController.handle);
  router.get("/health", controllers.healthCheckController.handle);

  return router;
}
