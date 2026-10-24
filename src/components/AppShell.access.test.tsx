import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import AppShell from "./AppShell";

vi.mock("@/store/hooks", () => ({
  useAppDispatch: () => vi.fn(),
  useAppSelector: (select: (state: unknown) => unknown) =>
    select({ auth: { user: { id: "user", name: "Member" } } }),
}));

afterEach(cleanup);

function CurrentPath() {
  return <output data-testid="current-path">{useLocation().pathname}</output>;
}

function renderShell() {
  return render(
    <MemoryRouter initialEntries={["/health"]}>
      <AppShell>
        <CurrentPath />
      </AppShell>
    </MemoryRouter>,
  );
}

describe("authenticated navigation without billing state", () => {
  it("keeps equivalent primary destinations in the responsive sidebar and tab bar", () => {
    renderShell();
    // JSDOM does not evaluate responsive CSS. Verify both mounted compositions;
    // their mutually exclusive visibility is checked in a real browser.
    for (const label of ["Sidebar", "Primary"]) {
      const navigation = within(
        screen.getByLabelText(label, { selector: "nav" }),
      );
      expect(
        navigation
          .getAllByRole("link", { hidden: true })
          .slice(0, 5)
          .map((link) => link.getAttribute("href")),
      ).toEqual(["/home", "/documents", "/packages", "/health", "/wealth"]);
      expect(
        navigation
          .getByLabelText("Health", { selector: "a" })
          .getAttribute("aria-current"),
      ).toBe("page");
      expect(
        navigation
          .getByLabelText("Wealth", { selector: "a" })
          .getAttribute("href"),
      ).toBe("/wealth");
    }
    expect(
      within(screen.getByRole("navigation", { name: "Sidebar" }))
        .getByRole("link", { name: "Settings" })
        .getAttribute("href"),
    ).toBe("/settings");
    expect(screen.queryByText(/upgrade|premium|paid plan/i)).toBeNull();
  });

  it("preserves accessible names when the sidebar collapses", () => {
    renderShell();
    fireEvent.click(screen.getByRole("button", { name: "Collapse menu" }));
    const sidebar = within(screen.getByRole("navigation", { name: "Sidebar" }));
    for (const name of [
      "Home",
      "Documents",
      "Packages",
      "Health",
      "Wealth",
      "Settings",
    ]) {
      const link = sidebar.getByRole("link", { name });
      expect(link.getAttribute("aria-label")).toBe(name);
      expect(link.textContent?.trim()).toBe("");
    }
    expect(screen.getByRole("button", { name: "Expand menu" })).toBeTruthy();
  });

  it("offers Family access through the account menu on either responsive layout", () => {
    renderShell();
    fireEvent.click(screen.getByRole("button", { name: "Open account menu" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Family" }));
    expect(screen.getByTestId("current-path").textContent).toBe("/family");
    expect(screen.queryByRole("menu")).toBeNull();
  });
});
