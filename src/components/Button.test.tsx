import { ThemeProvider } from "styled-components";
import { createRef } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Button, theme } from "@/design-system";

afterEach(cleanup);

describe("shared Button behavior", () => {
  it("keeps action buttons from submitting a surrounding form", () => {
    const submit = vi.fn((event) => event.preventDefault());
    const click = vi.fn();
    render(
      <form onSubmit={submit}>
        <Button variant="primary" onClick={click}>
          Add document
        </Button>
      </form>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(click).toHaveBeenCalledOnce();
    expect(submit).not.toHaveBeenCalled();
  });

  it("preserves explicit submit buttons, including an external form target", () => {
    const submit = vi.fn((event) => event.preventDefault());
    render(
      <>
        <form id="profile" onSubmit={submit} />
        <Button variant="primary" type="submit" form="profile">
          Save profile
        </Button>
      </>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(submit).toHaveBeenCalledOnce();
  });

  it.each(["primary", "secondary", "tertiary", "default"] as const)(
    "blocks disabled %s actions",
    (variant) => {
      const click = vi.fn();
      render(
        <Button variant={variant} disabled onClick={click}>
          Save
        </Button>,
      );
      fireEvent.click(screen.getByRole("button"));
      expect(click).not.toHaveBeenCalled();
      expect(screen.getByRole("button").hasAttribute("disabled")).toBe(true);
    },
  );

  it("exposes loading state and restores normal behavior when loading ends", () => {
    const click = vi.fn();
    const view = render(
      <Button variant="primary" loading loadingText="Saving…" onClick={click}>
        Save
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Saving…" });
    expect(button.getAttribute("aria-busy")).toBe("true");
    fireEvent.click(button);
    expect(click).not.toHaveBeenCalled();
    view.rerender(
      <Button variant="primary" onClick={click}>
        Save
      </Button>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(click).toHaveBeenCalledOnce();
  });

  it("preserves labels, titles, icon sizes, focus, and refs for icon-only actions", () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <Button
        ref={ref}
        variant="secondary"
        size="sm"
        iconOnly
        aria-label="Close preview"
        title="Close"
      >
        <svg width="18" height="18" aria-hidden="true" />
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Close preview" });
    ref.current?.focus();
    expect(document.activeElement).toBe(button);
    expect(button.getAttribute("title")).toBe("Close");
    expect(button.querySelector("svg")?.getAttribute("width")).toBe("18");
  });

  it("supports leading/trailing icons and a custom loading indicator", () => {
    const view = render(
      <Button
        variant="secondary"
        startIcon={<span data-testid="leading" />}
        endIcon={<span data-testid="trailing" />}
      >
        Download
      </Button>,
    );
    expect(screen.getByTestId("leading")).toBeTruthy();
    expect(screen.getByTestId("trailing")).toBeTruthy();
    view.rerender(
      <Button
        variant="secondary"
        loading
        loadingIndicator={<span role="status">Preparing</span>}
      >
        Download
      </Button>,
    );
    expect(screen.getByRole("status").textContent).toBe("Preparing");
  });

  it("keeps composed navigation as a real anchor", () => {
    const click = vi.fn((event) => event.preventDefault());
    render(
      <Button asChild variant="secondary">
        <a href="/documents" onClick={click}>
          Documents
        </a>
      </Button>,
    );
    const link = screen.getByRole("link", { name: "Documents" });
    expect(link.getAttribute("href")).toBe("/documents");
    expect(link.hasAttribute("type")).toBe(false);
    expect(screen.queryByRole("button")).toBeNull();
    fireEvent.click(link);
    expect(click).toHaveBeenCalledOnce();
  });

  it("reads color and spacing overrides from the typed ThemeProvider", () => {
    const customTheme = {
      ...theme,
      colors: { ...theme.colors, action: "rgb(11, 22, 33)" },
      spacing: { ...theme.spacing, s15: "19px" },
    };
    render(
      <ThemeProvider theme={customTheme}>
        <Button variant="primary">Themed action</Button>
      </ThemeProvider>,
    );
    const button = screen.getByRole("button", { name: "Themed action" });
    const computed = getComputedStyle(button);
    expect(
      computed.getPropertyValue("--button-accent").replace(/\s/g, ""),
    ).toBe("rgb(11,22,33)");
    expect(computed.paddingRight).toBe("19px");
    expect(button.style.backgroundColor).toBe("");
    expect(button.hasAttribute("$variant")).toBe(false);
    expect(button.hasAttribute("$size")).toBe(false);
  });

  it("blocks loading and disabled links without changing their navigation semantics", () => {
    const click = vi.fn();
    const view = render(
      <Button asChild loading>
        <a href="/documents" onClick={click}>
          Documents
        </a>
      </Button>,
    );
    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe("/documents");
    expect(link.getAttribute("aria-disabled")).toBe("true");
    expect(link.getAttribute("tabindex")).toBe("-1");
    fireEvent.click(link);
    expect(click).not.toHaveBeenCalled();
    view.rerender(
      <Button asChild disabled>
        <a href="/documents" onClick={click}>
          Documents
        </a>
      </Button>,
    );
    fireEvent.click(link);
    expect(click).not.toHaveBeenCalled();
  });

  it("supports danger independently of the action hierarchy", () => {
    render(
      <Button variant="primary" tone="danger" onClick={() => undefined}>
        Delete record
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Delete record" });
    expect(getComputedStyle(button).getPropertyValue("--button-accent")).toBe(
      "var(--color-action-destructive-default)",
    );
    expect(button.getAttribute("data-button-variant")).toBe("primary");
    expect(button.hasAttribute("tone")).toBe(false);
    expect(button.hasAttribute("iconOnly")).toBe(false);
  });
});
