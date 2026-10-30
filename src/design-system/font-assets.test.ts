import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("self-hosted Inter font", () => {
  it("contains a complete WOFF2 binary", () => {
    const data = readFileSync("public/fonts/inter/InterVariable.woff2");
    expect(data.toString("ascii", 0, 4)).toBe("wOF2");
    expect(data.readUInt32BE(8)).toBe(data.length);
    expect(data.readUInt16BE(12)).toBeGreaterThan(0);
    expect(data.readUInt32BE(16)).toBeGreaterThan(data.length);
  });
});
