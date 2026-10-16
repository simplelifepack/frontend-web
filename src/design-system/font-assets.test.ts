import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Validate the binaries, since a CSS declaration can incorrectly label an italic
// font as upright or map a regular file to every requested weight.
describe("self-hosted Poppins faces", () => {
  it.each([
    ["regular", 400],
    ["medium", 500],
    ["semibold", 600],
    ["bold", 700],
  ] as const)("%s contains the declared upright weight", (name, weight) => {
    const data = readFileSync(`public/fonts/poppins/${name}.ttf`);
    const tables = new Map<string, number>();
    for (let index = 0; index < data.readUInt16BE(4); index++) {
      const offset = 12 + index * 16;
      tables.set(
        data.toString("ascii", offset, offset + 4),
        data.readUInt32BE(offset + 8),
      );
    }
    const os2 = tables.get("OS/2")!;
    expect(data.readUInt16BE(os2 + 4)).toBe(weight);
    expect(data.readUInt16BE(os2 + 62) & 1).toBe(0);
    expect(data.readInt32BE(tables.get("post")! + 4)).toBe(0);
  });
});
