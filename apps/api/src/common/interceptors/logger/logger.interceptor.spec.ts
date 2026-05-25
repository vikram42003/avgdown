import { LoggerInterceptor } from "./logger.interceptor";
import { ConfigService } from "@nestjs/config";

describe("LoggerInterceptor", () => {
  it("should be defined", () => {
    const mockConfig = { get: jest.fn() } as unknown as ConfigService;
    expect(new LoggerInterceptor(mockConfig)).toBeDefined();
  });
});
