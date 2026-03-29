import { DevOnlyGuard } from "./dev-only.guard";

describe("DevOnlyGuard", () => {
  it("should be defined", () => {
    expect(new DevOnlyGuard()).toBeDefined();
  });
});
