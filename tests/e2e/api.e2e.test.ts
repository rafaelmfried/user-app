import type { Express } from "express";
import pg from "pg";
import request from "supertest";
import { CreateUser } from "../../src/application/user/CreateUser";
import { ListUser } from "../../src/application/user/ListUser";
import { PgClient } from "../../src/infra/db/client/PgClient";
import { UserRepositoryPg } from "../../src/infra/db/repositories/UserRepositoryPg";
import { CreateUserController } from "../../src/infra/http/controllers/CreateUserController";
import { HealthCheckController } from "../../src/infra/http/controllers/HealthCheckController";
import { ListUserController } from "../../src/infra/http/controllers/ListUserController";
import { HealthCheck } from "../../src/infra/http/health/HealthCheck";
import { createRoutes } from "../../src/infra/http/routes";
import { createApp } from "../../src/infra/http/server";
import {
  createTestDatabase,
  destroyTestDatabase,
  cleanDatabase,
  type TestDatabaseContext,
} from "../setup/testcontainers";

describe("API E2E", () => {
  let context: TestDatabaseContext;
  let app: Express;

  beforeAll(async () => {
    context = await createTestDatabase();

    // Build application with real dependencies
    const pgClient = new PgClient(context.pool);
    const userRepository = new UserRepositoryPg(pgClient);

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

    app = createApp(routes);
  }, 60000);

  afterAll(async () => {
    await destroyTestDatabase(context);
  });

  beforeEach(async () => {
    await cleanDatabase(context.pool);
  });

  describe("GET /health", () => {
    it("should return status ok", async () => {
      const response = await request(app).get("/health").expect(200);

      expect(response.body).toEqual({ status: "ok" });
    });
  });

  describe("POST /users", () => {
    describe("successful creation", () => {
      it("should create user and return 201", async () => {
        const response = await request(app)
          .post("/users")
          .send({ name: "John Doe", email: "john@test.com" })
          .expect(201);

        expect(response.body).toMatchObject({
          id: expect.any(Number),
          name: "John Doe",
          email: "john@test.com",
        });
      });

      it("should include createdAt in response", async () => {
        const response = await request(app)
          .post("/users")
          .send({ name: "Jane", email: "jane@test.com" })
          .expect(201);

        expect(response.body.createdAt).toBeDefined();
      });

      it("should persist user in database", async () => {
        await request(app)
          .post("/users")
          .send({ name: "Persisted", email: "persist@test.com" })
          .expect(201);

        const getResponse = await request(app).get("/users").expect(200);

        expect(getResponse.body).toHaveLength(1);
        expect(getResponse.body[0].email).toBe("persist@test.com");
      });
    });

    describe("validation errors", () => {
      const invalidInputs = [
        { body: { name: "", email: "test@test.com" }, description: "empty name" },
        { body: { name: "John", email: "" }, description: "empty email" },
        { body: { email: "test@test.com" }, description: "missing name" },
        { body: { name: "John" }, description: "missing email" },
        { body: {}, description: "empty body" },
      ];

      it.each(invalidInputs)(
        "should return 400 for $description",
        async ({ body }) => {
          const response = await request(app)
            .post("/users")
            .send(body)
            .expect(400);

          expect(response.body.error).toBe("VALIDATION_ERROR");
        }
      );

      it("should return 400 for invalid email format", async () => {
        const response = await request(app)
          .post("/users")
          .send({ name: "John", email: "invalid-email" })
          .expect(400);

        expect(response.body.error).toBe("VALIDATION_ERROR");
        expect(response.body.message).toBe("Invalid email format");
      });
    });

    describe("duplicate email", () => {
      it("should return 400 for duplicate email", async () => {
        await request(app)
          .post("/users")
          .send({ name: "First", email: "duplicate@test.com" })
          .expect(201);

        const response = await request(app)
          .post("/users")
          .send({ name: "Second", email: "duplicate@test.com" })
          .expect(400);

        expect(response.body.error).toBe("VALIDATION_ERROR");
        expect(response.body.message).toBe("Email already in use");
      });
    });
  });

  describe("GET /users", () => {
    it("should return empty array when no users exist", async () => {
      const response = await request(app).get("/users").expect(200);

      expect(response.body).toEqual([]);
    });

    it("should return all created users", async () => {
      await request(app)
        .post("/users")
        .send({ name: "User 1", email: "user1@test.com" });
      await request(app)
        .post("/users")
        .send({ name: "User 2", email: "user2@test.com" });

      const response = await request(app).get("/users").expect(200);

      expect(response.body).toHaveLength(2);
    });

    it("should return users in descending order by id", async () => {
      await request(app)
        .post("/users")
        .send({ name: "First", email: "first@test.com" });
      await request(app)
        .post("/users")
        .send({ name: "Second", email: "second@test.com" });

      const response = await request(app).get("/users").expect(200);

      expect(response.body[0].name).toBe("Second");
      expect(response.body[1].name).toBe("First");
    });

    it("should return users with all fields", async () => {
      await request(app)
        .post("/users")
        .send({ name: "Complete", email: "complete@test.com" });

      const response = await request(app).get("/users").expect(200);

      expect(response.body[0]).toMatchObject({
        id: expect.any(Number),
        name: "Complete",
        email: "complete@test.com",
        createdAt: expect.any(String),
      });
    });
  });

  describe("404 for unknown routes", () => {
    it("should return 404 for unknown GET route", async () => {
      await request(app).get("/unknown").expect(404);
    });

    it("should return 404 for unknown POST route", async () => {
      await request(app).post("/unknown").expect(404);
    });
  });

  describe("Content-Type handling", () => {
    it("should accept application/json", async () => {
      const response = await request(app)
        .post("/users")
        .set("Content-Type", "application/json")
        .send({ name: "JSON", email: "json@test.com" })
        .expect(201);

      expect(response.body.name).toBe("JSON");
    });
  });
});
