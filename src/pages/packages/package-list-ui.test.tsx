import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { DerivedPackSummary } from "@/readiness/selectors";
import { PackageGrid } from "./package-list-ui";

function pack(slug: string, completion: number, ready: number, total = 4): DerivedPackSummary {
  const requiredDocumentTypes = Array.from({ length: total }, (_, index) => `Requirement ${index + 1}`);
  return {
    id: slug,
    slug,
    title: `${slug} package`,
    category: "Health",
    description: "Reference package",
    completion,
    requiredDocumentTypes,
    uploadedDocumentTypes: requiredDocumentTypes.slice(0, ready),
    missingDocumentTypes: requiredDocumentTypes.slice(ready),
    requirements: [],
    searchMetadata: { searchPhrases: [], uiAccent: "#E86A9B", uiIcon: "HeartPulse" },
  };
}

function renderGrid(packs: DerivedPackSummary[]) {
  return render(
    <PackageGrid
      activeQuerySettled
      debouncedQuery=""
      generationStatus="idle"
      hasSearchQuery={false}
      packs={packs}
      quotaReached={false}
      searchCanGenerate={false}
      searchStatus="succeeded"
      status="succeeded"
      onGenerate={vi.fn()}
      onOpen={vi.fn()}
    />,
  );
}

describe("PackageGrid", () => {
  afterEach(cleanup);

  it("uses App.tsx readiness text and completed stamp state", () => {
    const { container } = renderGrid([pack("partial", 50, 2), pack("complete", 100, 4)]);

    expect(screen.getByText("2 of 4 ready")).toBeTruthy();
    expect(screen.queryByText("2 missing · 2 of 4 ready")).toBeNull();
    expect(screen.getByText("Everything in place")).toBeTruthy();
    expect(screen.getByText("READY")).toBeTruthy();
    expect(container.querySelectorAll(".lucide-chevron-right")).toHaveLength(1);
  });

  it.each([
    [0, "var(--lp-coral)"],
    [25, "var(--lp-coral)"],
    [50, "var(--lp-readiness)"],
    [67, "var(--lp-readiness)"],
    [80, "var(--lp-mint)"],
    [89, "var(--lp-mint)"],
    [100, "var(--lp-mint)"],
  ])("keeps package accent separate from the %i%% readiness ring", (completion, stroke) => {
    renderGrid([pack(`score-${completion}`, completion, completion === 100 ? 4 : 2)]);

    expect(screen.getByTestId("readiness-ring-progress").getAttribute("stroke")).toBe(stroke);
  });
});
