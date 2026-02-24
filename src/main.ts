import { CreateUser, ListUser } from "./application/user/index.js";
import { createPgPool, PgClient } from "./infra/db/client/index.js";
import { UserRepositoryPg } from "./infra/db/repositories/index.js";
import {
  CreateUserController,
  HealthCheckController,
  ListUserController,
} from "./infra/http/controllers/index.js";
import { HealthCheck } from "./infra/http/health/index.js";
import { createRoutes } from "./infra/http/routes.js";
import { createApp } from "./infra/http/server.js";
import { env } from "./shared/config/index.js";

const pool = createPgPool();
const db = new PgClient(pool);
const userRepository = new UserRepositoryPg(db);

const createUser = new CreateUser(userRepository);
const listUser = new ListUser(userRepository);
const healthCheck = new HealthCheck();

const createUserController = new CreateUserController(createUser);
const listUserController = new ListUserController(listUser);
const healthCheckController = new HealthCheckController(healthCheck);

const routes = createRoutes({
  createUserController,
  listUserController,
  healthCheckController,
});

const app = createApp(routes);
const port = env.port;

const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

const shutdown = async () => {
  await pool.end();
  server.close();
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
