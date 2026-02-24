import { ValidationError } from "../errors/index.js";

export class Email {
  private value: string;

  constructor(value: string) {
    if (!this.validateEmail(value)) {
      throw new ValidationError("Invalid email format");
    }
    this.value = value;
  }

  public get(): string {
    return this.value;
  }

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
