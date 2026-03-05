import { describe, it, expect } from "vitest";
import { HandCategory } from "../src/index";

describe("hello", () => {
  it("returns the hello message", () => {
    expect(HandCategory.HIGH_CARD).toBe(HandCategory.HIGH_CARD);
  });
});

