import type { User } from "../../domain/user/index.js";

export type CreateUserInput = {
  name: string;
  email: string;
};

export type UserDTO = {
  id?: number;
  name: string;
  email: string;
  createdAt?: Date;
};

export function toUserDTO(user: User): UserDTO {
  const id = user.getId();
  const name = user.getName();
  const email = user.getEmail().get();
  const createdAt = user.getCreatedAt?.();

  if (id !== undefined) {
    return { id, name, email, ...(createdAt && { createdAt }) };
  }

  return { name, email, ...(createdAt && { createdAt }) };
}
