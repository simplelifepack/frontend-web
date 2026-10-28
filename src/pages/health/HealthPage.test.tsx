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
    fireEvent.click(screen.getByRole("button", { name: /Jordan Example.*Child/ }));
    expect(
      await screen.findByRole("heading", { name: "Jordan Example" }),
    ).toBeTruthy();
    await waitFor(() =>
      expect(api.health.records).toHaveBeenCalledWith("member-b"),
    );
  });
