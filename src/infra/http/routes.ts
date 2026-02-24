import { Router } from "express";
import type { CreateUserController } from "./controllers/CreateUserController.js";
import type { ListUserController } from "./controllers/ListUserController.js";

export type HttpControllers = {
  createUserController: CreateUserController;
  listUserController: ListUserController;
};

export function createRoutes(controllers: HttpControllers): Router {
  const router = Router();

  router.post("/users", controllers.createUserController.handle);
  router.get("/users", controllers.listUserController.handle);

  return router;
}
