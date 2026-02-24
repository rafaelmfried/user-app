import { HealthCheck } from "./application/health/HealthCheck.js";
import { CreateUser } from "./application/user/CreateUser.js";
import { ListUser } from "./application/user/ListUser.js";
import { createPgPool } from "./infra/db/postgres/createPool.js";
import { PgClient } from "./infra/db/postgres/PgClient.js";
import { UserRepositoryPg } from "./infra/db/postgres/UserRepository.js";
import { CreateUserController } from "./infra/http/controllers/CreateUserController.js";
import { HealthCheckController } from "./infra/http/controllers/HealthCheckController.js";
import { ListUserController } from "./infra/http/controllers/ListUserController.js";
import { createRoutes } from "./infra/http/routes.js";
import { createApp } from "./infra/http/server.js";

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
const port = Number(process.env.PORT) || 8080;

const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

const shutdown = async () => {
  await pool.end();
  server.close();
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
