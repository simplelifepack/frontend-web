import { afterEach, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "@/store";
import AccountMenu from "./AccountMenu";

afterEach(cleanup);
it("supports menu navigation, Escape, and Tab without invoking an account action", async () => {
  render(<Provider store={store}><MemoryRouter><AccountMenu user={null}/></MemoryRouter></Provider>);
  const trigger = screen.getByRole("button", { name: "Open account menu" });
  trigger.focus();
  fireEvent.keyDown(trigger, { key: "ArrowDown" });
  const archive = screen.getByRole("menuitem", { name: /My archive\s*Your real documents/ });
  await waitFor(() => expect(document.activeElement).toBe(archive));
  fireEvent.keyDown(archive, { key: "End" });
  await waitFor(() => expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "Sign out" })));
  fireEvent.keyDown(document.activeElement!, { key: "Escape" });
  expect(screen.queryByRole("menu")).toBeNull();
  expect(document.activeElement).toBe(trigger);
  fireEvent.keyDown(trigger, { key: "ArrowDown" });
  await waitFor(() => expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: /My archive\s*Your real documents/ })));
  fireEvent.keyDown(document.activeElement!, { key: "Tab" });
  expect(screen.queryByRole("menu")).toBeNull();
  expect(document.activeElement).toBe(trigger);
});
