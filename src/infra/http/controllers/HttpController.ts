import type { NextFunction, Request, Response } from "express";

export interface HttpController {
  handle(req: Request, res: Response, next: NextFunction): Promise<void>;
}
