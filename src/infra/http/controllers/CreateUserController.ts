import type { NextFunction, Request, Response } from "express";
import type { CreateUser } from "../../../application/user/CreateUser.js";
import type { HttpController } from "./HttpController.js";

export class CreateUserController implements HttpController {
  constructor(private readonly createUser: CreateUser) {}

  handle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.createUser.execute({
        name: String(req.body?.name ?? ""),
        email: String(req.body?.email ?? ""),
      });
      res.status(201).json(user);
    } catch (err) {
      next(err);
    }
  };
}
