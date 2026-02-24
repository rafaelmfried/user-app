import type { NextFunction, Request, Response } from "express";
import type { ListUser } from "../../../application/user/ListUser.js";

export class ListUserController {
  constructor(private readonly listUser: ListUser) {}

  handle = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users = await this.listUser.execute();
      res.status(200).json(users);
    } catch (err) {
      next(err);
    }
  };
}
