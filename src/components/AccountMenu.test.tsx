import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { api } from "@/lib/api";
import AccountMenu from "./AccountMenu";

const dispatch = vi.fn();
vi.mock("@/store/hooks", () => ({ useAppDispatch: () => dispatch }));
vi.mock("@/lib/api", () => ({
  api: { auth: { logout: vi.fn().mockResolvedValue(undefined) } },
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function renderMenu() {
  function CurrentPath() {
    const location = useLocation();
    return <span data-testid="route">{location.pathname}</span>;
  }
  return render(
    <MemoryRouter initialEntries={["/documents"]}>
      <Routes>
        <Route
          path="*"
          element={
            <>
              <AccountMenu
                user={{
                  id: "user-a",
                  name: "Ranjith Kumar",
                  email: "ranjith@example.com",
                }}
              />
              <CurrentPath />
            </>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe("account dropdown", () => {
  it("shows authenticated identity and closes on toggle, outside click, and Escape", () => {
    renderMenu();
    const trigger = screen.getByRole("button", { name: "Open account menu" });
    fireEvent.click(trigger);
    expect(screen.getByRole("menu").textContent).toContain("Ranjith Kumar");
    expect(screen.getByRole("menu").textContent).toContain("Signed in");
    expect(screen.getByRole("menu").textContent).toContain("My archive");
    fireEvent.click(trigger);
    expect(screen.queryByRole("menu")).toBeNull();
    fireEvent.click(trigger);
    fireEvent.pointerDown(screen.getByTestId("route"));
    expect(screen.queryByRole("menu")).toBeNull();
    fireEvent.click(trigger);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("routes to settings and Family and uses the existing logout action", async () => {
    renderMenu();
    const trigger = screen.getByRole("button", { name: "Open account menu" });
    fireEvent.click(trigger);
    fireEvent.click(
      screen.getByRole("menuitem", { name: /Profile and settings/ }),
    );
    expect(screen.getByTestId("route").textContent).toBe("/settings");
    expect(screen.queryByRole("menu")).toBeNull();
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("menuitem", { name: /Family/ }));
    expect(screen.getByTestId("route").textContent).toBe("/family");
    expect(screen.queryByRole("menu")).toBeNull();
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("menuitem", { name: /Sign out/ }));
    await vi.waitFor(() => expect(api.auth.logout).toHaveBeenCalledOnce());
    await vi.waitFor(() => expect(dispatch).toHaveBeenCalledOnce());
    expect(screen.getByTestId("route").textContent).toBe("/login");
  });
});
