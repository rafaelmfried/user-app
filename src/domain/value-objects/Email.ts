export class Email {
  private value: string;

  constructor(value: string) {
    if (!this.validateEmail(value)) {
      throw new Error("Invalid email format");
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
