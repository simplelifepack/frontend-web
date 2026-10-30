import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
it("permits encrypted PDF blob previews while retaining the frame policy", () => {
  const config = JSON.parse(readFileSync(`${process.cwd()}/vercel.json`, "utf8"));
  const csp = config.headers.flatMap((entry: { headers: Array<{ key: string; value: string }> }) => entry.headers).find((header: { key: string }) => header.key === "Content-Security-Policy").value as string;
  const frames = csp.split(";").find(value => value.trim().startsWith("frame-src "))!;
  expect(frames.split(/\s+/)).toContain("blob:");
  expect(frames).not.toContain("*");
  expect(csp).toContain("object-src 'none'");
  expect(csp).toContain("frame-ancestors 'none'");
});
