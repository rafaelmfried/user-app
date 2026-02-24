import type { User } from "./User.js";

export interface UserRepositoryPort {
  create(user: User): Promise<void>;
  findAll(): Promise<User[]>;
}
