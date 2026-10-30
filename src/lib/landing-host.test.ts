import { describe, expect, it } from "vitest";
import { usesEarlyAccessLanding } from "./landing-host";

describe("landing hostname selection", () => {
  it.each(["readines.com", "www.readines.com", "READINES.COM", "main.d21rr29vpd3rfl.amplifyapp.com"])("shows registration on %s", hostname => {
    expect(usesEarlyAccessLanding(hostname)).toBe(true);
  });
  it.each(["localhost", "127.0.0.1", "[::1]", "frontend-web-nine-amber.vercel.app", "frontend-preview.vercel.app", "readines.com.example.org", "other.example", "other.amplifyapp.com", "main.d21rr29vpd3rfl.amplifyapp.com.example.org"])("preserves regular landing on %s", hostname => {
    expect(usesEarlyAccessLanding(hostname)).toBe(false);
  });
});
