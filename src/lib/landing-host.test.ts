import { describe, expect, it } from "vitest";
import { usesEarlyAccessLanding } from "./landing-host";

describe("landing hostname selection", () => {
  it.each(["readines.com", "www.readines.com", "READINES.COM", "localhost", "127.0.0.1"])("shows registration on %s", hostname => {
    expect(usesEarlyAccessLanding(hostname)).toBe(true);
  });
  it.each(["frontend-web-nine-amber.vercel.app", "frontend-preview.vercel.app", "readines.com.example.org", "other.example"])("preserves regular landing on %s", hostname => {
    expect(usesEarlyAccessLanding(hostname)).toBe(false);
  });
});
