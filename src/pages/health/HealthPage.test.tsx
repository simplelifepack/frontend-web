import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { api } from "@/lib/api";
import { preferencesApi } from "@/lib/preferences-api";
import type {
  DocumentRecord,
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
      measurements: vi.fn(),
      createMeasurement: vi.fn(),
      createReminder: vi.fn(),
      availableMetrics: vi.fn(),
      createMedication: vi.fn(),
      updateRecord: vi.fn(),
    },
    documents: {
      download: vi.fn(),
      getById: vi.fn(),
      list: vi.fn(),
      preview: vi.fn(),
      previewPage: vi.fn(),
    },
  },
}));

vi.mock("@/lib/preferences-api", () => ({
  preferencesApi: {
    get: vi.fn(),
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
const documents: Record<string, DocumentRecord> = Object.fromEntries(
  records.map((record) => [
    record.documentId,
    {
      id: record.documentId,
      originalName: `${record.documentId}.png`,
      mimeType: "image/png",
      size: 1200,
      documentType: "Lab Report",
      category: "Medical",
      analysisSource: "upload",
      confidence: 0.98,
      classificationStatus: "verified",
      classificationConfidence: 0.98,
      ownershipStatus: "verified",
      readinessEligible: true,
      fields: {},
      source: "MANUAL_UPLOAD",
      createdAt: "2026-05-02",
      updatedAt: "2026-05-02",
    },
  ]),
);
const manualMedication = {
  id: "medication-manual",
  memberId: "member-a",
  name: "Metformin",
  dose: "500 mg",
  frequency: "morning, night",
  whenToTake: ["morning", "night"],
  mealTiming: "after_food",
  repeatRunsOut: "2026-10-25",
  repeats: true,
  runsOutAt: "2026-10-25",
  status: "continuing",
  stoppedAt: null,
  createdAt: "2026-09-25",
};

function renderHealthPage() {
  return render(
    <MemoryRouter>
      <HealthPage />
    </MemoryRouter>,
  );
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("Health page orchestration", () => {
  it("renders, switches profiles, and opens exact records with duplicate type and date", async () => {
    vi.mocked(preferencesApi.get).mockResolvedValue({
      country: "IN",
      passportCountry: "IN",
      homeCurrency: "INR",
      appearance: "dark",
      aiProcessingEnabled: true,
    });
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
    vi.mocked(api.documents.getById).mockImplementation(
      async (documentId) => documents[documentId],
    );
    vi.mocked(api.documents.preview).mockResolvedValue({
      blob: new Blob(["preview"], { type: "image/png" }),
      fileName: "preview.png",
    });
    vi.mocked(api.health.timeline).mockResolvedValue([]);
    vi.mocked(api.health.measurements).mockResolvedValue([]);
    vi.mocked(api.health.availableMetrics).mockResolvedValue([]);
    if (!URL.createObjectURL)
      Object.defineProperty(URL, "createObjectURL", {
        configurable: true,
        value: vi.fn(),
      });
    if (!URL.revokeObjectURL)
      Object.defineProperty(URL, "revokeObjectURL", {
        configurable: true,
        value: vi.fn(),
      });
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:health-preview");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    vi.spyOn(window, "open").mockReturnValue(null);

    renderHealthPage();
    expect(
      await screen.findByRole("heading", { name: "Alex Example" }),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /^Records/ }));
    await waitFor(() =>
      expect(
        screen.getAllByRole("button", {
          name: /^Correct what was read for Lab Report/,
        }),
      ).toHaveLength(2),
    );

    fireEvent.click(
      screen.getAllByRole("button", {
        name: /^Correct what was read for Lab Report/,
      })[1],
    );
    let dialog = await screen.findByRole("dialog", {
      name: "Health record document",
    });
    await waitFor(() =>
      expect(api.documents.getById).toHaveBeenCalledWith("document-b"),
    );
    expect(api.health.record).toHaveBeenCalledWith("record-b");
    expect(within(dialog).getByText("Lab Report")).toBeTruthy();
    expect(within(dialog).getByText("Upload · Medical")).toBeTruthy();
    expect(within(dialog).getByText("LABORATORY REPORT")).toBeTruthy();
    expect(within(dialog).getByText("Alex Example")).toBeTruthy();
    expect(within(dialog).getByText("Clinic B")).toBeTruthy();
    expect(within(dialog).queryByText("Tracked measurements")).toBeNull();
    expect(within(dialog).queryByText("All measurements")).toBeNull();
    expect(
      within(dialog).queryByRole("button", { name: "View original document" }),
    ).toBeNull();
    expect(
      within(dialog).getByRole("button", { name: "View original" }),
    ).toBeTruthy();
    expect(
      [...document.querySelectorAll(".lp-health-record-row")]
        .find((row) => row.textContent?.includes("Clinic B"))
        ?.classList.contains("active"),
    ).toBe(true);
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Correct details" }),
    );
    expect(
      await screen.findByRole("dialog", { name: "Choose measurements to track" }),
    ).toBeTruthy();
    vi.mocked(api.health.updateRecord).mockResolvedValue({
      ...details["record-b"]!,
      type: "prescription",
    });
    const correctionDialog = screen.getByRole("dialog", {
      name: "Choose measurements to track",
    });
    fireEvent.change(within(correctionDialog).getByLabelText("Document type"), {
      target: { value: "prescription" },
    });
    fireEvent.click(
      within(correctionDialog).getByRole("button", { name: "Save tracking" }),
    );
    await waitFor(() =>
      expect(api.health.updateRecord).toHaveBeenCalledWith("record-b", {
        type: "prescription",
      }),
    );

    fireEvent.click(
      screen.getAllByRole("button", {
        name: /^Correct what was read for Lab Report/,
      })[0],
    );
    dialog = await screen.findByRole("dialog", {
      name: "Health record document",
    });
    await waitFor(() =>
      expect(api.documents.getById).toHaveBeenCalledWith("document-a"),
    );
    expect(api.health.record).toHaveBeenCalledWith("record-a");
    expect(api.documents.download).not.toHaveBeenCalled();
    fireEvent.click(within(dialog).getByRole("button", { name: "View original" }));
    await waitFor(() =>
      expect(api.documents.preview).toHaveBeenCalledWith("document-a"),
    );

    fireEvent.click(
      within(dialog).getByRole("button", { name: "Close document viewer" }),
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
    vi.mocked(preferencesApi.get).mockResolvedValue({
      country: "IN",
      passportCountry: "IN",
      homeCurrency: "INR",
      appearance: "dark",
      aiProcessingEnabled: true,
    });
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
    vi.mocked(api.health.measurements).mockResolvedValue([]);
    vi.mocked(api.health.availableMetrics).mockResolvedValue([]);
    vi.mocked(api.health.createMedication).mockResolvedValue(manualMedication);
    vi.mocked(api.health.createReminder).mockResolvedValue({
      id: "reminder-a",
      title: "Cardiology follow-up",
      type: "appointment",
      dueDate: "2026-10-25",
      frequency: "weekly",
      memberId: "member-a",
      memberName: "Alex Example",
      origin: "manual",
      status: "active",
    });
    vi.mocked(api.documents.list).mockResolvedValue([]);

    renderHealthPage();
    await screen.findByRole("heading", { name: "Alex Example" });
    const remindersCard = screen.getByText("Reminders").closest(".lp-health-reminders-card")!;
    fireEvent.click(within(remindersCard as HTMLElement).getByRole("button", { name: "Add" }));
    const reminderDialog = await screen.findByRole("dialog", { name: "Add reminder" });
    expect(within(reminderDialog).getByRole<HTMLButtonElement>("button", { name: "Add reminder" }).disabled).toBe(true);
    fireEvent.change(within(reminderDialog).getByLabelText("Title"), { target: { value: "Cardiology follow-up" } });
    fireEvent.click(within(reminderDialog).getByRole("button", { name: "Appointment" }));
    fireEvent.change(within(reminderDialog).getByLabelText("Due"), { target: { value: "2026-10-25" } });
    fireEvent.click(within(reminderDialog).getByRole("button", { name: "Every week" }));
    fireEvent.click(within(reminderDialog).getByRole("button", { name: "Add reminder" }));
    await waitFor(() =>
      expect(api.health.createReminder).toHaveBeenCalledWith({
        memberId: "member-a",
        title: "Cardiology follow-up",
        type: "appointment",
        dueDate: "2026-10-25",
        frequency: "weekly",
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Timeline" }));
    expect(await screen.findByText("Test reading 118 mg/dL")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Medications" }));
    expect(await screen.findByText("Test medication")).toBeTruthy();
    const medicationCard = screen
      .getByText("Current medications")
      .closest(".lp-health-med-card")!;
    fireEvent.click(
      within(medicationCard as HTMLElement).getByRole("button", {
        name: "Add",
      }),
    );
    const medicationDialog = await screen.findByRole("dialog", { name: "Add medication" });
    expect(within(medicationDialog).getByRole<HTMLButtonElement>("button", { name: "Add medication" }).disabled).toBe(true);
    fireEvent.change(within(medicationDialog).getByLabelText("Name"), { target: { value: "Metformin" } });
    fireEvent.change(within(medicationDialog).getByLabelText("Dose"), { target: { value: "500 mg" } });
    fireEvent.click(within(medicationDialog).getByRole("button", { name: "Morning" }));
    fireEvent.click(within(medicationDialog).getByRole("button", { name: "Night" }));
    fireEvent.change(within(medicationDialog).getByLabelText("Repeat runs out"), { target: { value: "2026-10-25" } });
    fireEvent.click(within(medicationDialog).getByRole("button", { name: "After Food" }));
    fireEvent.click(within(medicationDialog).getByRole("button", { name: "Add medication" }));
    await waitFor(() =>
      expect(api.health.createMedication).toHaveBeenCalledWith("member-a", {
        name: "Metformin",
        dose: "500 mg",
        whenToTake: ["morning", "night"],
        mealTiming: "after_food",
        repeatRunsOut: "2026-10-25",
      }),
    );
    expect(api.health.timeline).toHaveBeenCalledTimes(3);

    fireEvent.click(screen.getByRole("button", { name: "In an emergency" }));
    expect(
      await screen.findByRole("dialog", { name: "Emergency card" }),
    ).toBeTruthy();
    fireEvent.click(screen.getAllByRole("button", { name: "Close" })[0]);
    fireEvent.click(screen.getByRole("button", { name: "Log reading" }));
    expect(
      await screen.findByRole("dialog", { name: "Log a reading for Alex" }),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    fireEvent.click(screen.getByRole("button", { name: "Records" }));
    fireEvent.click(screen.getByRole("button", { name: "Upload medical record" }));
    expect(
      await screen.findByRole("heading", { name: "Add health record" }),
    ).toBeTruthy();
  });
});
