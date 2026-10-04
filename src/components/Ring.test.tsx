import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import Ring from "./Ring";

describe("Ring", () => {
  afterEach(cleanup);

  it("uses an animated circular fill and centered readiness score", () => {
    render(<Ring score={67} />);
    const progress = screen.getByTestId("readiness-ring-progress");
    expect(Number(progress.getAttribute("stroke-dasharray"))).toBeGreaterThan(0);
    expect(progress.getAttribute("stroke-linecap")).toBe("round");
    expect(screen.getByText("67")).toBeTruthy();
  });

  it.each([
    [0, "var(--lp-coral)"],
    [25, "var(--lp-coral)"],
    [50, "var(--lp-readiness)"],
    [67, "var(--lp-readiness)"],
    [80, "var(--lp-mint)"],
    [89, "var(--lp-mint)"],
    [100, "var(--lp-mint)"],
  ])("uses the App.tsx readiness color for %i%%", (score, color) => {
    render(<Ring score={score} />);
    expect(screen.getByTestId("readiness-ring-progress").getAttribute("stroke")).toBe(color);
  });
});
