import { User } from "../../../../../src/domain/user/User";
import { Email } from "../../../../../src/domain/value-objects/Email";
import { PgClient } from "../../../../../src/infra/db/client/PgClient";
import { UserRepositoryPg } from "../../../../../src/infra/db/repositories/UserRepositoryPg";
import {
  createTestDatabase,
  destroyTestDatabase,
  cleanDatabase,
  type TestDatabaseContext,
} from "../../../../setup/testcontainers";

describe("UserRepositoryPg", () => {
  let context: TestDatabaseContext;
  let pgClient: PgClient;
  let repository: UserRepositoryPg;

  beforeAll(async () => {
    context = await createTestDatabase();
    pgClient = new PgClient(context.pool);
    repository = new UserRepositoryPg(pgClient);
  }, 60000);

  afterAll(async () => {
    await destroyTestDatabase(context);
  });

  beforeEach(async () => {
    await cleanDatabase(context.pool);
  });

  describe("create", () => {
    it("should create user and return id", async () => {
      const user = new User("John Doe", new Email("john@test.com"));

      const result = await repository.create(user);

      expect(result.id).toBeGreaterThan(0);
    });

    it("should persist user data correctly", async () => {
      const email = new Email("jane@test.com");
      const user = new User("Jane Doe", email);

      const result = await repository.create(user);

      const found = await repository.findByEmail("jane@test.com");
      expect(found).not.toBeNull();
      expect(found?.getName()).toBe("Jane Doe");
      expect(found?.getEmail().get()).toBe("jane@test.com");
      expect(found?.getId()).toBe(result.id);
    });

    it("should auto-increment ids", async () => {
      const user1 = new User("User 1", new Email("user1@test.com"));
      const user2 = new User("User 2", new Email("user2@test.com"));

      const result1 = await repository.create(user1);
      const result2 = await repository.create(user2);

      expect(result2.id).toBe(result1.id + 1);
    });

    it("should store createdAt timestamp", async () => {
      const createdAt = new Date("2024-01-15T10:00:00Z");
      const user = new User("John", new Email("john@test.com"), undefined, createdAt);

      await repository.create(user);

      const found = await repository.findByEmail("john@test.com");
      expect(found?.getCreatedAt().toISOString()).toBe(createdAt.toISOString());
    });
  });

  describe("findAll", () => {
    it("should return empty array when no users exist", async () => {
      const result = await repository.findAll();

      expect(result).toEqual([]);
    });

    it("should return all users", async () => {
      await repository.create(new User("User 1", new Email("user1@test.com")));
      await repository.create(new User("User 2", new Email("user2@test.com")));
      await repository.create(new User("User 3", new Email("user3@test.com")));

      const result = await repository.findAll();

      expect(result).toHaveLength(3);
    });

    it("should return users in descending order by id", async () => {
      await repository.create(new User("First", new Email("first@test.com")));
      await repository.create(new User("Second", new Email("second@test.com")));
      await repository.create(new User("Third", new Email("third@test.com")));

      const result = await repository.findAll();

      expect(result[0]?.getName()).toBe("Third");
      expect(result[1]?.getName()).toBe("Second");
      expect(result[2]?.getName()).toBe("First");
    });

    it("should return User entities with all properties", async () => {
      await repository.create(new User("John", new Email("john@test.com")));

      const result = await repository.findAll();

      expect(result[0]).toBeInstanceOf(User);
      expect(result[0]?.getId()).toBeDefined();
      expect(result[0]?.getName()).toBe("John");
      expect(result[0]?.getEmail().get()).toBe("john@test.com");
      expect(result[0]?.getCreatedAt()).toBeInstanceOf(Date);
    });
  });

  describe("findByEmail", () => {
    it("should return null when user not found", async () => {
      const result = await repository.findByEmail("notfound@test.com");

      expect(result).toBeNull();
    });

    it("should return user when found", async () => {
      await repository.create(new User("John", new Email("john@test.com")));

      const result = await repository.findByEmail("john@test.com");

      expect(result).not.toBeNull();
      expect(result?.getName()).toBe("John");
    });

    it("should be case-sensitive for email", async () => {
      await repository.create(new User("John", new Email("John@Test.com")));

      const resultExact = await repository.findByEmail("John@Test.com");
      const resultLower = await repository.findByEmail("john@test.com");

      expect(resultExact).not.toBeNull();
      expect(resultLower).toBeNull();
    });

    it("should return User entity with all properties", async () => {
      const createdAt = new Date();
      await repository.create(new User("Jane", new Email("jane@test.com"), undefined, createdAt));

      const result = await repository.findByEmail("jane@test.com");

      expect(result).toBeInstanceOf(User);
      expect(result?.getId()).toBeDefined();
      expect(result?.getName()).toBe("Jane");
      expect(result?.getEmail()).toBeInstanceOf(Email);
      expect(result?.getEmail().get()).toBe("jane@test.com");
    });
  });

  describe("unique email constraint", () => {
    it("should throw error when inserting duplicate email", async () => {
      await repository.create(new User("John", new Email("duplicate@test.com")));

      await expect(
        repository.create(new User("Jane", new Email("duplicate@test.com")))
      ).rejects.toThrow();
    });
  });
});
