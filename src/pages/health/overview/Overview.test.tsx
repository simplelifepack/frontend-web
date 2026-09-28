import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { HealthMeasurement, HealthOverview } from "@/lib/api.types";
import Overview from "./Overview";

const member = {
  id: "member-a",
  name: "Alex Example",
  relation: "Self",
  createdAt: "2026-01-01",
  updatedAt: "2026-01-01",
};

const b12Measurement: HealthMeasurement = {
  id: "measurement-b12",
  sourceDocumentId: "document-a",
  recordId: "record-a",
  metricKey: "vitamin_b12",
  displayName: "Vitamin B12",
  originalName: "Vitamin B12",
  value: 412,
  unit: "pg/mL",
  context: null,
  bodySite: null,
  measuredAt: "2026-06-15",
  sourceType: "lab_report",
};

function renderOverview(overview: HealthOverview) {
  return render(
    <Overview
      overview={overview}
      records={[]}
      measurements={[b12Measurement]}
      onTrack={vi.fn()}
      onReminder={vi.fn()}
      onEdit={vi.fn()}
      onApplyTracked={vi.fn()}
    />,
  );
}

describe("Health overview tracked tests", () => {
  it("hydrates tracked cards from member measurements before rendering charts", () => {
    renderOverview({
      member,
      upcoming: [],
      recentRecords: [],
      trackedMetrics: [
        {
          id: "tracked-b12",
          memberId: "member-a",
          metricKey: "vitamin_b12",
          displayName: "Vitamin B12",
          context: null,
          bodySite: null,
          enabled: true,
          createdAt: "2026-06-01",
          updatedAt: "2026-06-01",
          measurements: [],
          latest: null,
        },
      ],
    });

    expect(screen.getByText("Vitamin B12")).toBeTruthy();
    expect(screen.getByText("412")).toBeTruthy();
    expect(screen.getByRole("img", { name: "1 recorded measurements" }))
      .toBeTruthy();
    expect(screen.queryByText("No measurements available yet.")).toBeNull();
  });
});
