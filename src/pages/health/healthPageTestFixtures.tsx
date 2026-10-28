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
  HealthMedication,
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

export const members: HealthMember[] = [
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

export const records: HealthRecord[] = [
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

export const details: Record<string, HealthRecordDetail> = Object.fromEntries(
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
export const documents: Record<string, DocumentRecord> = Object.fromEntries(
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
export const manualMedication: HealthMedication = {
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

export function renderHealthPage() {
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