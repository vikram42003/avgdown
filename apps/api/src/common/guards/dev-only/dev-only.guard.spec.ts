import { DevOnlyGuard } from "./dev-only.guard";
import { ConfigService } from "@nestjs/config";

describe("DevOnlyGuard", () => {
  it("should be defined", () => {
    const mockConfig = { get: jest.fn() } as unknown as ConfigService;
    expect(new DevOnlyGuard(mockConfig)).toBeDefined();
  });
});
