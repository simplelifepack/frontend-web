import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { useState } from "react";
import {
  Field,
  ModalPanel,
  SearchableSelectMenu,
  SelectMenu,
} from "@/design-system";

beforeAll(() => {
  HTMLElement.prototype.scrollIntoView = vi.fn();
  if (!globalThis.ResizeObserver)
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
});
afterEach(cleanup);
const options = [
  { value: "", label: "Choose" },
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta", disabled: true },
];

function Example() {
  const [value, setValue] = useState("a");
  return (
    <ModalPanel as="form">
      <Field label="Category">
        <SelectMenu
          name="category"
          value={value}
          onValueChange={setValue}
          options={options}
        />
      </Field>
    </ModalPanel>
  );
}

describe("shared select menus", () => {
  it("keeps labels, empty choices and original form values inside a dialog", async () => {
    render(<Example />);
    const trigger = screen.getByRole("combobox", { name: "Category" });
    expect(new FormData(trigger.closest("form")!).get("category")).toBe("a");
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    const list = await screen.findByRole("listbox");
    expect(trigger.closest('[role="dialog"]')!.contains(list)).toBe(true);
    expect(
      screen
        .getByRole("option", { name: "Beta" })
        .getAttribute("aria-disabled"),
    ).toBe("true");
    fireEvent.click(screen.getByRole("option", { name: "Choose" }));
    expect(trigger.textContent).toContain("Choose");
    expect(new FormData(trigger.closest("form")!).get("category")).toBe("");
  });

  it("does not open a disabled control", () => {
    render(
      <SelectMenu
        aria-label="Owner access"
        disabled
        value="owner"
        options={[{ value: "owner", label: "Owner" }]}
      />,
    );
    const trigger = screen.getByRole("combobox", { name: "Owner access" });
    expect((trigger as HTMLButtonElement).disabled).toBe(true);
    expect(trigger.textContent).toContain("Owner");
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("searches country labels and codes and returns the original code", async () => {
    const onValueChange = vi.fn();
    render(
      <SearchableSelectMenu
        aria-label="Country"
        value="IN"
        onValueChange={onValueChange}
        options={[
          { value: "IN", label: "India" },
          { value: "US", label: "United States" },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole("combobox", { name: "Country" }));
    fireEvent.change(
      await screen.findByRole("combobox", { name: "Search options" }),
      { target: { value: "US" } },
    );
    const list = screen.getByRole("listbox");
    fireEvent.click(
      within(list).getByRole("option", { name: "United States" }),
    );
    expect(onValueChange).toHaveBeenCalledWith("US");
  });
  it("keeps custom names and always-visible Other choices searchable", async () => {
    const change = vi.fn();
    const view = render(
      <SearchableSelectMenu
        aria-label="Document requirement"
        allowCustomValue
        value="Existing custom document"
        onValueChange={change}
        options={[{ value: "Passport", label: "Passport" }]}
      />,
    );
    const trigger = screen.getByRole("combobox", {
      name: "Document requirement",
    });
    expect(trigger.textContent).toContain("Existing custom document");
    fireEvent.click(trigger);
    fireEvent.change(
      await screen.findByRole("combobox", { name: "Search options" }),
      { target: { value: "School letter" } },
    );
    fireEvent.click(
      screen.getByRole("option", { name: "Use “School letter”" }),
    );
    expect(change).toHaveBeenCalledWith("School letter");
    view.unmount();
    render(
      <SearchableSelectMenu
        aria-label="Type"
        value=""
        options={[
          { value: "Savings", label: "Savings" },
          { value: "Other", label: "Other", alwaysVisible: true },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole("combobox", { name: "Type" }));
    fireEvent.change(
      await screen.findByRole("combobox", { name: "Search options" }),
      { target: { value: "Unlisted type" } },
    );
    expect(screen.getByRole("option", { name: "Other" })).toBeTruthy();
  });
});
