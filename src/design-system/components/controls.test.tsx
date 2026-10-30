import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createRef, useState, useSyncExternalStore } from "react";
import { ThemeProvider, useTheme } from "styled-components";
import {
  Button,
  Checkbox,
  Choice,
  Input,
  ModalPanel,
  Radio,
  SearchField,
  Select,
  Switch,
  Textarea,
  darkTheme,
  lightTheme,
} from "@/design-system";
import {
  applyTheme,
  getAppliedAppearance,
  persistTheme,
  subscribeAppearance,
} from "@/lib/theme";

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  applyTheme("dark");
});

describe("shared controls in product forms", () => {
  it.each([lightTheme, darkTheme])(
    "keeps input refs, values and form submission in $mode",
    (theme) => {
      const input = createRef<HTMLInputElement>();
      const submit = vi.fn((event) => event.preventDefault());
      render(
        <ThemeProvider theme={theme}>
          <ModalPanel as="form" onSubmit={submit}>
            <Input
              ref={input}
              aria-label="Name"
              name="name"
              defaultValue="Alex"
              required
            />
            <Textarea aria-label="Notes" name="notes" defaultValue="Details" />
            <Select aria-label="Category" name="category" value="two" options={[
              { value: "one", label: "One" },
              { value: "two", label: "Two" },
            ]} />
            <Checkbox aria-label="Consent" name="consent" defaultChecked />
            <Radio
              aria-label="First"
              name="choice"
              value="first"
              defaultChecked
            />
            <Radio aria-label="Second" name="choice" value="second" />
            <Button type="submit">Save</Button>
          </ModalPanel>
        </ThemeProvider>,
      );
      input.current?.focus();
      expect(document.activeElement).toBe(input.current);
      fireEvent.change(screen.getByLabelText("Name"), {
        target: { value: "Morgan" },
      });
      fireEvent.click(screen.getByLabelText("Second"));
      const form = input.current!.form!;
      const data = new FormData(form);
      expect(Object.fromEntries(data)).toEqual({
        name: "Morgan",
        notes: "Details",
        category: "two",
        consent: "on",
        choice: "second",
      });
      fireEvent.click(screen.getByRole("button", { name: "Save" }));
      expect(submit).toHaveBeenCalledOnce();
    },
  );

  it("preserves controlled search keyboard handling and forwarded focus", () => {
    const ref = createRef<HTMLInputElement>();
    const key = vi.fn();
    render(
      <SearchField
        ref={ref}
        role="combobox"
        aria-label="Search"
        onKeyDown={key}
      />,
    );
    ref.current?.focus();
    fireEvent.keyDown(ref.current!, { key: "ArrowDown" });
    expect(document.activeElement).toBe(ref.current);
    expect(key).toHaveBeenCalledOnce();
    expect(screen.getByRole("combobox")).toBe(ref.current);
  });

  it("keeps controlled choice and switch state and blocks disabled interaction", () => {
    function Example() {
      const [checked, setChecked] = useState(false);
      return (
        <>
          <Switch
            aria-label="AI"
            checked={checked}
            onCheckedChange={setChecked}
          />
          <Choice aria-pressed={checked} onClick={() => setChecked(!checked)}>
            Select
          </Choice>
          <Switch
            aria-label="Disabled"
            disabled
            checked={false}
            onCheckedChange={setChecked}
          />
        </>
      );
    }
    render(<Example />);
    fireEvent.click(screen.getByRole("switch", { name: "AI" }));
    expect(
      screen.getByRole("switch", { name: "AI" }).getAttribute("aria-checked"),
    ).toBe("true");
    expect(
      screen
        .getByRole("button", { name: "Select" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
    fireEvent.click(screen.getByRole("switch", { name: "Disabled" }));
    expect(
      screen.getByRole("switch", { name: "AI" }).getAttribute("aria-checked"),
    ).toBe("true");
  });

  it("updates the ThemeProvider and CSS appearance together, including storage events", () => {
    function ReadMode() {
      return <output>{useTheme().mode}</output>;
    }
    function AppTheme() {
      const mode = useSyncExternalStore(
        subscribeAppearance,
        getAppliedAppearance,
      );
      return (
        <ThemeProvider theme={mode === "dark" ? darkTheme : lightTheme}>
          <ReadMode />
          <button onClick={() => persistTheme("light")}>Light</button>
        </ThemeProvider>
      );
    }
    applyTheme("dark");
    render(<AppTheme />);
    fireEvent.click(screen.getByRole("button", { name: "Light" }));
    expect(screen.getByText("light").tagName).toBe("OUTPUT");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    window.localStorage.setItem("readiness-theme", "dark");
    fireEvent(
      window,
      new StorageEvent("storage", { key: "readiness-theme", newValue: "dark" }),
    );
    expect(screen.getByText("dark").tagName).toBe("OUTPUT");
    expect(document.documentElement.style.colorScheme).toBe("dark");
  });
});
