import { createRef, useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PasswordInput } from "./PasswordInput";
import { Field } from "../Field";

afterEach(cleanup);

describe("password visibility control", () => {
  it("preserves controlled value, native ref, keyboard input and form submission", () => {
    const ref = createRef<HTMLInputElement>();
    const submit = vi.fn((event) => event.preventDefault());
    function Form() {
      const [value, setValue] = useState("");
      return (
        <form onSubmit={submit}>
          <PasswordInput
            ref={ref}
            name="password"
            aria-label="Password"
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
          <button type="submit">Submit</button>
        </form>
      );
    }
    render(<Form />);
    const input = screen.getByLabelText("Password") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Example1!" } });
    expect(ref.current).toBe(input);
    expect(input.type).toBe("password");
    fireEvent.click(screen.getByRole("button", { name: "Show password" }));
    expect(input.type).toBe("text");
    expect(input.value).toBe("Example1!");
    expect(submit).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Hide password" }));
    expect(input.type).toBe("password");
    expect(input.value).toBe("Example1!");
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    expect(submit).toHaveBeenCalledOnce();
  });

  it("retains Field label, validation associations, and disabled behavior", () => {
    render(
      <Field label="Password" error="Use a stronger password">
        <PasswordInput disabled aria-label="Password" />
      </Field>,
    );
    const input = screen.getByLabelText("Password");
    const toggle = screen.getByRole("button", {
      name: "Show password",
    }) as HTMLButtonElement;
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toBe(
      screen.getByRole("alert").id,
    );
    expect(toggle.disabled).toBe(true);
  });
});
