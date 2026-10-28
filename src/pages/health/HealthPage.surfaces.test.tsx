import { members, records, details, documents, manualMedication, renderHealthPage } from "./healthPageTestFixtures";
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
    const remindersCard = screen.getByRole("region", { name: "Reminders" });
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
