import type { User } from "./User.js";

export interface CreateUserResult {
  id: number;
}

export interface UserRepositoryPort {
  create(user: User): Promise<CreateUserResult>;
  findAll(): Promise<User[]>;
}
