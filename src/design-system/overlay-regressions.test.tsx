import { afterEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { DrawerPanel, DrawerPortal } from "@/design-system";
import SearchablePreferenceSelect from "@/pages/settings/SearchablePreferenceSelect";

HTMLElement.prototype.scrollIntoView ??= vi.fn();
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

afterEach(cleanup);

describe("overlays inside clipped and isolated application content", () => {
  it("portals searchable options outside a clipped card, filters and restores focus", async () => {
    const change = vi.fn();
    const { container } = render(
      <div style={{ overflow: "hidden", isolation: "isolate" }}>
        <SearchablePreferenceSelect
          ariaLabel="Country"
          placeholder="Choose country"
          value={null}
          options={[
            { code: "IN", label: "India" },
            { code: "GB", label: "United Kingdom" },
          ]}
          onChange={change}
        />
      </div>,
    );
    const trigger = screen.getByRole("combobox", { name: "Country" });
    fireEvent.click(trigger);
    const search = await screen.findByRole("combobox", {
      name: "Search options",
    });
    expect(container.contains(search)).toBe(false);
    fireEvent.change(search, { target: { value: "India" } });
    expect(screen.queryByRole("option", { name: /United Kingdom/ })).toBeNull();
    fireEvent.click(screen.getByRole("option", { name: /India/ }));
    expect(change).toHaveBeenCalledWith("IN");
    await waitFor(() => expect(document.activeElement).toBe(trigger));
    fireEvent.click(trigger);
    fireEvent.keyDown(await screen.findByRole("combobox", { name: "Search options" }), { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("combobox", { name: "Search options" })).toBeNull());
    expect(change).toHaveBeenCalledTimes(1);
  });

  it("portals standalone drawers outside route isolation and dismisses with Escape", () => {
    const dismiss = vi.fn();
    const { container } = render(
      <div style={{ isolation: "isolate", overflow: "hidden" }}>
        <DrawerPortal>
          <DrawerPanel aria-label="Actions" onDismiss={dismiss}>
            <button type="button">Done</button>
          </DrawerPanel>
        </DrawerPortal>
      </div>,
    );
    expect(container.contains(screen.getByRole("dialog"))).toBe(false);
    fireEvent.keyDown(screen.getByRole("button", { name: "Done" }), {
      key: "Escape",
    });
    expect(dismiss).toHaveBeenCalledOnce();
  });
});
