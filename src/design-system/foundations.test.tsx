import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import {
  Button,
  Field,
  Input,
  ModalBackdrop,
  ModalPanel,
} from "@/design-system";
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
describe("foundation accessibility", () => {
  it("associates native fields with labels, hints, and errors while preserving IDs and validation", () => {
    render(
      <Field label="Email" hint="Use your account email" error="Invalid email">
        <Input
          id="email"
          aria-describedby="existing"
          required
          type="email"
          defaultValue="bad"
        />
      </Field>,
    );
    const field = screen.getByLabelText("Email *") as HTMLInputElement;
    expect(field.id).toBe("email");
    expect(field.required).toBe(true);
    expect(field.checkValidity()).toBe(false);
    expect(field.getAttribute("aria-invalid")).toBe("true");
    expect(field.getAttribute("aria-describedby")).toBe(
      "existing email-hint email-error",
    );
    expect(screen.getByRole("alert").id).toBe("email-error");
  });
  it("portals dialogs, wraps keyboard focus, dismisses with Escape, and restores trigger focus", () => {
    vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
      { width: 10, height: 10 },
    ] as unknown as DOMRectList);
    function Example() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setOpen(true)}>Open</Button>
          {open && (
            <ModalBackdrop>
              <ModalPanel aria-label="Example" onDismiss={() => setOpen(false)}>
                <Input aria-label="Name" />
                <Button>Last</Button>
              </ModalPanel>
            </ModalBackdrop>
          )}
        </>
      );
    }
    const { container } = render(<Example />);
    const trigger = screen.getByText("Open");
    trigger.focus();
    fireEvent.click(trigger);
    expect(container.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(screen.getByLabelText("Name"));
    screen.getByText("Last").focus();
    fireEvent.keyDown(document.activeElement!, { key: "Tab" });
    expect(document.activeElement).toBe(screen.getByLabelText("Name"));
    fireEvent.keyDown(document.activeElement!, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(screen.getByText("Last"));
    fireEvent.keyDown(document.activeElement!, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
  it("dismisses only the top dialog and restores focus to its parent", () => {
    vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
      { width: 10, height: 10 },
    ] as unknown as DOMRectList);
    const closeOuter = vi.fn();
    function Nested() {
      const [open, setOpen] = useState(false);
      return (
        <ModalBackdrop>
          <ModalPanel aria-label="Outer" onDismiss={closeOuter}>
            <Button onClick={() => setOpen(true)}>Nested</Button>
            {open && (
              <ModalBackdrop>
                <ModalPanel aria-label="Inner" onDismiss={() => setOpen(false)}>
                  <Button>Inside</Button>
                </ModalPanel>
              </ModalBackdrop>
            )}
          </ModalPanel>
        </ModalBackdrop>
      );
    }
    render(<Nested />);
    fireEvent.click(screen.getByText("Nested"));
    fireEvent.keyDown(document.activeElement!, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "Inner" })).toBeNull();
    expect(closeOuter).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(screen.getByText("Nested"));
  });
});
