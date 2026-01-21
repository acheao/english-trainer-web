export class ApiError extends Error {
  status: number;
  bodyText: string;

  constructor(status: number, message: string, bodyText: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.bodyText = bodyText;
  }
}
