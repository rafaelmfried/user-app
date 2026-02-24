import { AppError } from "../../shared/errors/AppError.js";
import { Email } from "../../domain/value-objects/Email.js";
import { User } from "../../domain/user/User.js";
import type { UserRepositoryPort } from "../../domain/user/UserRepository.js";
import type { CreateUserInput, UserDTO } from "./UserDTO.js";
import { toUserDTO } from "./UserDTO.js";

export class CreateUser {
  constructor(private readonly userRepository: UserRepositoryPort) {}

  async execute(input: CreateUserInput): Promise<UserDTO> {
    if (!input?.name || !input?.email) {
      throw new AppError({
        statusCode: 400,
        code: "VALIDATION_ERROR",
        message: "name and email are required",
      });
    }

    try {
      const email = new Email(input.email);
      const user = new User(input.name, email);
      await this.userRepository.create(user);
      return toUserDTO(user);
    } catch (err) {
      if (err instanceof AppError) {
        throw err;
      }
      if (err instanceof Error && isValidationError(err)) {
        throw new AppError({
          statusCode: 400,
          code: "VALIDATION_ERROR",
          message: err.message,
          cause: err,
        });
      }
      throw err;
    }
  }
}

function isValidationError(err: Error): boolean {
  return err.message.includes("Invalid email") || err.message.includes("Name cannot be empty");
}
