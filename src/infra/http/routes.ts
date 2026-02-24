import type { Router as ExpressRouter } from "express";
import { Router } from "express";

const router: ExpressRouter = Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

export default router;
