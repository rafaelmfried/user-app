import type { Router as ExpressRouter } from "express";
import { Router } from "express";

const router: ExpressRouter = Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

router.post("/users", (req, res) => {
  // This is a placeholder. In a real application, you would create a user in the database.
  const { name, email } = req.body;
  res.status(201).json({ id: 1, name, email });
});

router.get("/users", async (req, res) => {
  // This is a placeholder. In a real application, you would fetch users from the database.
  const users = [
    { id: 1, name: "Alice", email: "alice@example.com" },
    { id: 2, name: "Bob", email: "bob@example.com" },
  ];
  res.json(users);
});

export default router;
