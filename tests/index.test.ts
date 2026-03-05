import { describe, it, expect } from "vitest";
import { hello } from "../src/index";

describe("hello", () => {
  it("returns the hello message", () => {
    expect(hello()).toBe("hello, texas holdem");
  });
});

