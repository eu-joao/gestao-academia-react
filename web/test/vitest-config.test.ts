import { describe, it, expect } from "vitest";

describe("Vitest configuration", () => {
  it("executa testes básicos", () => {
    expect(1 + 1).toBe(2);
  });

  it("suporta async/await", async () => {
    await Promise.resolve();
    expect(true).toBe(true);
  });
});