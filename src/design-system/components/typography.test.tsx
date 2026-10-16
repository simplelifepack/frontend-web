import { createRef } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ThemeProvider } from "styled-components";
import { MemoryRouter, Link } from "react-router-dom";
import { Heading, Text, Input, darkTheme, lightTheme } from "@/design-system";

afterEach(cleanup);

describe("semantic typography", () => {
  it.each([1, 2, 3, 4, 5, 6] as const)(
    "renders level %s independently of visual size",
    (level) => {
      const ref = createRef<HTMLHeadingElement>();
      render(
        <Heading ref={ref} level={level} size="sm">
          Section title
        </Heading>,
      );
      expect(screen.getByRole("heading", { level }).tagName).toBe(
        `H${level}`.toUpperCase(),
      );
      expect(ref.current).toBe(screen.getByText("Section title"));
    },
  );
  it("keeps label association, native attributes and semantic refs", () => {
    const ref = createRef<HTMLLabelElement>();
    render(
      <>
        <Text as="label" htmlFor="person" ref={ref}>
          Person
        </Text>
        <Input id="person" />
      </>,
    );
    expect(screen.getByLabelText("Person").tagName).toBe("INPUT");
    expect(ref.current?.htmlFor).toBe("person");
  });
  it("preserves links, emphasis, content and selection behavior", () => {
    render(
      <MemoryRouter>
        <Text as="p">
          Read <strong>important</strong> <em>notes</em> and{" "}
          <Text as={Link} to="/documents">
            documents
          </Text>
          .
        </Text>
      </MemoryRouter>,
    );
    expect(screen.getByText("important").tagName).toBe("STRONG");
    expect(screen.getByText("notes").tagName).toBe("EM");
    expect(
      screen.getByRole("link", { name: "documents" }).getAttribute("href"),
    ).toBe("/documents");
    expect(screen.getByText("important").parentElement?.textContent).toBe(
      "Read important notes and documents.",
    );
  });
  it.each([lightTheme, darkTheme])(
    "supports all tones without altering interaction in $mode",
    (theme) => {
      const label = createRef<HTMLAnchorElement>();
      render(
        <ThemeProvider theme={theme}>
          <Text
            as="a"
            href="#details"
            ref={label}
            tone="success"
            weight="semibold"
          >
            Details
          </Text>
          <Text tone="muted">Muted</Text>
          <Text tone="danger">Problem</Text>
        </ThemeProvider>,
      );
      label.current?.focus();
      expect(document.activeElement).toBe(screen.getByRole("link"));
      fireEvent.click(screen.getByRole("link"));
      expect(screen.getByText("Problem")).toBeTruthy();
    },
  );
});

// Compile-time checks couple native attributes and refs to the semantic element.
function verifyTypographyTypes() {
  const label = (
    <Text as="label" htmlFor="name">
      Name
    </Text>
  );
  const link = (
    <Text as="a" href="/documents">
      Documents
    </Text>
  );
  const invalidLabel = (
    // @ts-expect-error A label cannot accept anchor-only attributes.
    <Text as="label" href="/documents">
      Name
    </Text>
  );
  // @ts-expect-error Heading level is restricted to the six semantic levels.
  const invalidHeading = <Heading level={7}>Title</Heading>;
  // @ts-expect-error Text uses the three named weights.
  const invalidWeight = <Text weight="bold">Value</Text>;
  return [label, link, invalidLabel, invalidHeading, invalidWeight];
}
