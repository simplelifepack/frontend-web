import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { api } from "@/lib/api";
import type {
  HealthMember,
  HealthRecord,
  HealthRecordDetail,
} from "@/lib/api.types";
import HealthPage from "./index";

vi.mock("@/lib/api", () => ({
  api: {
    health: {
      members: vi.fn(),
      overview: vi.fn(),
      records: vi.fn(),
      record: vi.fn(),
      timeline: vi.fn(),
      availableMetrics: vi.fn(),
    },
    documents: { download: vi.fn() },
  },
}));

const members: HealthMember[] = [
  {
    id: "member-a",
    name: "Alex Example",
    relation: "Self",
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  },
  {
    id: "member-b",
    name: "Jordan Example",
    relation: "Child",
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  },
];

const records: HealthRecord[] = [
  {
    id: "record-a",
    memberId: "member-a",
    documentId: "document-a",
    type: "lab_report",
    documentDate: "2026-05-02",
    provider: "Clinic A",
    processingStatus: "processed",
    measurementCount: 0,
    trackedMeasurementCount: 0,
    medicationCount: 0,
    followUpCount: 0,
    createdAt: "2026-05-02",
  },
  {
    id: "record-b",
    memberId: "member-a",
    documentId: "document-b",
    type: "lab_report",
    documentDate: "2026-05-02",
    provider: "Clinic B",
    processingStatus: "processed",
    measurementCount: 0,
    trackedMeasurementCount: 0,
    medicationCount: 0,
    followUpCount: 0,
    createdAt: "2026-05-02",
  },
];

const details: Record<string, HealthRecordDetail> = Object.fromEntries(
  records.map((record) => [
    record.id,
    {
      ...record,
      measurements: [],
      medications: [],
      followUps: [],
      reminders: [],
    },
  ]),
);

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("Health page orchestration", () => {
  it("renders, switches profiles, and opens exact records with duplicate type and date", async () => {
    vi.mocked(api.health.members).mockResolvedValue(members);
    vi.mocked(api.health.overview).mockImplementation(async (memberId) => ({
      member: members.find((member) => member.id === memberId)!,
      upcoming: [],
      trackedMetrics: [],
      recentRecords: memberId === "member-a" ? records : [],
    }));
    vi.mocked(api.health.records).mockImplementation(async (memberId) =>
      memberId === "member-a" ? records : [],
    );
    vi.mocked(api.health.record).mockImplementation(
      async (recordId) => details[recordId],
    );
    vi.mocked(api.health.timeline).mockResolvedValue([]);
    vi.mocked(api.health.availableMetrics).mockResolvedValue([]);

    render(<HealthPage />);
    expect(
      await screen.findByRole("heading", { name: "Alex Example" }),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Records" }));
    await waitFor(() =>
      expect(screen.getAllByRole("button", { name: "View" })).toHaveLength(2),
    );

    fireEvent.click(screen.getAllByRole("button", { name: "View" })[1]);
    let dialog = await screen.findByRole("dialog", {
      name: "Health record details",
    });
    await waitFor(() =>
      expect(within(dialog).getByText("Clinic B")).toBeTruthy(),
    );
    expect(api.health.record).toHaveBeenCalledWith("record-b");
    expect(
      [...document.querySelectorAll(".lp-health-record-row")]
        .find((row) => row.textContent?.includes("Clinic B"))
        ?.classList.contains("active"),
    ).toBe(true);

    fireEvent.click(
      within(dialog).getByRole("button", { name: "Close report details" }),
    );
    fireEvent.click(screen.getAllByRole("button", { name: "View" })[0]);
    dialog = await screen.findByRole("dialog", {
      name: "Health record details",
    });
    await waitFor(() =>
      expect(within(dialog).getByText("Clinic A")).toBeTruthy(),
    );
    expect(api.health.record).toHaveBeenCalledWith("record-a");
    expect(api.documents.download).not.toHaveBeenCalled();

    fireEvent.click(
      within(dialog).getByRole("button", { name: "Close report details" }),
    );
    fireEvent.click(screen.getByRole("button", { name: /JordanChild/ }));
    expect(
      await screen.findByRole("heading", { name: "Jordan Example" }),
    ).toBeTruthy();
    await waitFor(() =>
      expect(api.health.records).toHaveBeenCalledWith("member-b"),
    );
  });

  it("keeps the Timeline, Medications, emergency, reading, and add-record surfaces wired", async () => {
    vi.mocked(api.health.members).mockResolvedValue(members);
    vi.mocked(api.health.overview).mockResolvedValue({
      member: members[0]!,
      upcoming: [],
      trackedMetrics: [],
      recentRecords: [],
    });
    vi.mocked(api.health.records).mockResolvedValue([]);
    vi.mocked(api.health.timeline).mockResolvedValue([
      {
        id: "reading-a",
        eventType: "measurement",
        recordId: "record-a",
        occurredAt: "2026-05-02",
        title: "Test reading",
        value: 118,
        unit: "mg/dL",
        source: "Lab result",
        sourceType: "lab_report",
      },
      {
        id: "medication-a",
        eventType: "medication",
        recordId: "record-a",
        occurredAt: "2026-05-02",
        title: "Test medication",
        source: "Prescription",
        sourceType: "prescription",
      },
    ]);
    vi.mocked(api.health.availableMetrics).mockResolvedValue([]);

    render(<HealthPage />);
    await screen.findByRole("heading", { name: "Alex Example" });
    fireEvent.click(screen.getByRole("button", { name: "Timeline" }));
    expect(await screen.findByText("Test reading 118 mg/dL")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Medications" }));
    expect(await screen.findByText("Test medication")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Emergency card" }));
    expect(
      await screen.findByRole("dialog", { name: "Emergency card" }),
    ).toBeTruthy();
    fireEvent.click(screen.getAllByRole("button", { name: "Close" })[0]);
    fireEvent.click(screen.getByRole("button", { name: "Log reading" }));
    expect(
      await screen.findByRole("dialog", { name: "Log reading" }),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Add health record" }));
    expect(
      await screen.findByRole("heading", { name: "Add health record" }),
    ).toBeTruthy();
  });
});
