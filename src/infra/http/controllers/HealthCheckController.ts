import type { NextFunction, Request, Response } from "express";
import type { HealthCheck } from "../health/index.js";
import type { HttpController } from "./HttpController.js";

export class HealthCheckController implements HttpController {
  constructor(private readonly healthCheck: HealthCheck) {}

  handle = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const status = this.healthCheck.check();
      res.status(200).json(status);
    } catch (err) {
      next(err);
    }
  };
}
