import type { User as UserType } from "../../../domain/user/User.js";
import { User } from "../../../domain/user/User.js";
import type {
  CreateUserResult,
  UserRepositoryPort,
} from "../../../domain/user/UserRepository.js";
import { Email } from "../../../domain/value-objects/Email.js";
import { PgClient } from "./PgClient.js";

export class UserRepositoryPg implements UserRepositoryPort {
  constructor(private readonly db: PgClient) {}

  async create(user: UserType): Promise<CreateUserResult> {
    const result = await this.db.query<{ id: number }>(
      "INSERT INTO users (name, email, created_at) VALUES ($1, $2, $3) RETURNING id",
      [user.getName(), user.getEmail().get(), user.getCreatedAt()],
    );
    return { id: result.rows[0]?.id ?? -1 };
  }

  async findAll(): Promise<UserType[]> {
    const result = await this.db.query<{
      id: number;
      name: string;
      email: string;
      created_at: Date;
    }>("SELECT id, name, email, created_at FROM users ORDER BY id DESC");

    return result.rows.map(
      (row) => new User(row.name, new Email(row.email), row.id, row.created_at),
    );
  }
}
