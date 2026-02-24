import type { Email } from "../value-objects/Email.js";

export class User {
  private id?: number;
  private name: string;
  private email: Email;
  private createdAt: Date;

  constructor(name: string, email: Email, id?: number, createdAt?: Date) {
    if (!this.validateName(name)) {
      throw new Error("Name cannot be empty");
    }
    this.name = name;
    this.email = email;
    this.createdAt = createdAt ?? new Date();
    if (id !== undefined) {
      this.id = id;
    }
  }

  setId(id: number): void {
    this.id = id;
  }

  getId(): number | undefined {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getEmail(): Email {
    return this.email;
  }

  private validateName(name: string): boolean {
    return name.trim().length > 0;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }
}
