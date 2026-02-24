import type { User } from "../../domain/user/User.js";

export type CreateUserInput = {
  name: string;
  email: string;
};

export type UserDTO = {
  id?: number;
  name: string;
  email: string;
};

export function toUserDTO(user: User): UserDTO {
  const dto: UserDTO = {
    name: user.getName(),
    email: user.getEmail().get(),
  };

  const id = user.getId();
  if (id !== undefined) {
    dto.id = id;
  }

  return dto;
}
