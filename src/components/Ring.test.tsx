import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Ring from "./Ring";

describe("Ring", () => {
  it("uses a clamped SVG dash fill for readiness scores", () => {
    render(<Ring score={72.4} />);
    const progress = screen.getByTestId("readiness-ring-progress");
    expect(progress.getAttribute("stroke-dasharray")).toBe("72 100");
    expect(screen.getByText("72")).toBeTruthy();
  });
});
