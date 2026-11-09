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
import { afterEach, describe, expect, it, onTestFinished, vi } from "vitest";
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
HTMLElement.prototype.scrollIntoView ??= vi.fn();
it("renders, switches profiles, and opens exact records with duplicate type and date", async () => {
    const storage = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
    });
    onTestFinished(() => { vi.unstubAllGlobals(); });
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
    const originalTab = {
      opener: window,
      document: document.implementation.createHTMLDocument(),
      closed: false,
      close: vi.fn(),
      location: { replace: vi.fn() },
    };
    vi.spyOn(window, "open").mockReturnValue(originalTab as unknown as Window);

    const initial = renderHealthPage("/health?member=member-a&tab=Records");
    expect(
      await screen.findByRole("heading", { name: "Alex Example" }),
    ).toBeTruthy();
    await screen.findAllByRole("button", { name: /^Open Lab Report/ });
    fireEvent.click(screen.getByRole("button", { name: "Overview" }));
    expect(screen.queryByRole("button", { name: /^Open Lab Report/ })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /^Records/ }));
    await waitFor(() =>
      expect(
        screen.getAllByRole("button", {
          name: /^Open Lab Report/,
        }),
      ).toHaveLength(2),
    );

    fireEvent.click(
      screen.getAllByRole("button", {
        name: /^Open Lab Report/,
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
    fireEvent.click(within(dialog).getByRole("button", { name: "Close document viewer" }));
    const row = screen.getAllByRole("listitem").find((item) => item.textContent?.includes("Clinic B"))!;
    fireEvent.click(within(row).getByRole("button", { name: "View original document" }));
    expect(window.open).toHaveBeenCalledWith("about:blank", "_blank");
    await waitFor(() => expect(originalTab.location.replace).toHaveBeenCalledWith("blob:health-preview"));
    expect(api.documents.preview).toHaveBeenCalledWith("document-b");
    expect(originalTab.opener).toBeNull();
    expect(screen.queryByRole("button", { name: /Correct what was read/ })).toBeNull();

    fireEvent.click(
      screen.getAllByRole("button", {
        name: /^Open Lab Report/,
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
    const pdf = new Blob(["%PDF-1.7"], { type: "application/pdf" });
    vi.mocked(api.documents.preview).mockResolvedValueOnce({ blob: pdf, fileName: "original.pdf" });
    fireEvent.click(within(dialog).getByRole("button", { name: "View original" }));
    await waitFor(() =>
      expect(URL.createObjectURL).toHaveBeenCalledWith(pdf),
    );
    expect(api.documents.preview).toHaveBeenCalledWith("document-a");

    vi.mocked(api.documents.preview).mockRejectedValueOnce(new Error("Document not found."));
    fireEvent.click(within(dialog).getByRole("button", { name: "View original" }));
    await waitFor(() => expect(originalTab.close).toHaveBeenCalled());

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

    initial.unmount();
    const reopened = renderHealthPage("/health");
    expect(await screen.findByRole("heading", { name: "Jordan Example" })).toBeTruthy();
    reopened.unmount();

    window.localStorage.setItem("readiness.health.lastMember", "removed-profile");
    vi.mocked(api.health.members).mockResolvedValue([...members].reverse());
    renderHealthPage("/health");
    expect(await screen.findByRole("heading", { name: "Alex Example" })).toBeTruthy();
    window.localStorage.removeItem("readiness.health.lastMember");
    originalTab.closed = true;
  });
