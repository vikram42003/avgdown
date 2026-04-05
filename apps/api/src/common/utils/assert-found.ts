import { NotFoundException } from "@nestjs/common";

export function assertFound<T>(value: T | null, message = "Resource not found"): T {
  if (value === null) throw new NotFoundException(message);
  return value;
}
