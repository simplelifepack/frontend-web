import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import PreferencesSection from "./PreferencesSection";
vi.mock("@/lib/preferences-api", () => ({ preferencesApi: { get: vi.fn().mockResolvedValue({ country: null, passportCountry: null, homeCurrency: null, appearance: "system", aiProcessingEnabled: true }) } }));
vi.mock("./NotificationSettingsRow", () => ({ default: () => null }));
afterEach(cleanup);
it("renders account preferences and AI controls", async () => {
  render(<PreferencesSection />);
  expect(screen.getByText("Preferences")).toBeTruthy();
  await waitFor(() => expect(screen.getByRole("switch", { name: "AI processing" }).getAttribute("aria-checked")).toBe("true"));
});
