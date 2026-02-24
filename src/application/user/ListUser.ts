import type { UserRepositoryPort } from "../../domain/user/UserRepository.js";
import type { UserDTO } from "./UserDTO.js";
import { toUserDTO } from "./UserDTO.js";

export class ListUser {
  constructor(private readonly userRepository: UserRepositoryPort) {}

  async execute(): Promise<UserDTO[]> {
    const users = await this.userRepository.findAll();
    return users.map(toUserDTO);
  }
}
