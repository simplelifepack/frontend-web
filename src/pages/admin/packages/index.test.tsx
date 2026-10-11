import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import AdminPackagesPage from "./index";
import { api } from "@/lib/api";

const clearPackageCatalogueCache = vi.fn().mockResolvedValue(undefined);

vi.mock("@/store/hooks", () => ({
  useAppSelector: () => ({ email: "admin@readines.com", name: "Packages Admin" }),
}));

vi.mock("@/packages/packageCatalogueCache", () => ({
  clearPackageCatalogueCache: () => clearPackageCatalogueCache(),
}));

vi.mock("@/lib/api", () => ({
  api: {
    adminPackages: {
      create: vi.fn(),
      delete: vi.fn(),
      downloadTemplate: vi.fn(),
      importCsv: vi.fn(),
      list: vi.fn(),
      previewCsv: vi.fn(),
      update: vi.fn(),
    },
  },
}));

const createdPackage = {
  aliases: [],
  category: "Testing",
  createdAt: "2026-10-11T00:00:00.000Z",
  createdBy: "seed",
  description: "A package created from the admin panel.",
  id: "pack_created",
  keywords: ["admin", "flow"],
  requirements: [{
    acceptedDocumentTypes: ["identity_proof"],
    alternativeLabels: [],
    group: "Required",
    id: "req_created",
    owner: "self",
    required: true,
    title: "Identity proof",
  }],
  slug: "admin-flow-package",
  title: "Admin Flow Package",
  updatedAt: "2026-10-11T00:00:00.000Z",
  version: 1,
};

describe("AdminPackagesPage add package flow", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("opens the existing form, creates one package, closes, and refreshes the list", async () => {
    vi.mocked(api.adminPackages.list)
      .mockResolvedValueOnce({ categories: [], items: [], pagination: { page: 1, limit: 25, total: 0, hasNextPage: false } })
      .mockResolvedValue({ categories: ["Testing"], items: [createdPackage], pagination: { page: 1, limit: 25, total: 1, hasNextPage: false } });
    vi.mocked(api.adminPackages.create).mockResolvedValue({ package: createdPackage });

    render(<AdminPackagesPage />);

    await screen.findByText("No shared packages found.");
    expect(screen.queryByLabelText("Package name")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /New package/ }));
    fireEvent.change(screen.getByLabelText("Package name"), { target: { value: "Admin Flow Package" } });
    fireEvent.change(screen.getByLabelText("Category"), { target: { value: "Testing" } });
    fireEvent.change(screen.getAllByLabelText("Description")[0]!, { target: { value: "A package created from the admin panel." } });
    fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Identity proof" } });

    fireEvent.click(screen.getByRole("button", { name: /Create package/ }));

    await waitFor(() => expect(api.adminPackages.create).toHaveBeenCalledOnce());
    expect(api.adminPackages.create).toHaveBeenCalledWith(expect.objectContaining({
      category: "Testing",
      description: "A package created from the admin panel.",
      requirements: [expect.objectContaining({ title: "Identity proof" })],
      title: "Admin Flow Package",
    }));
    await waitFor(() => expect(screen.queryByLabelText("Package name")).toBeNull());
    expect(await screen.findByText("Admin Flow Package")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    await waitFor(() => expect(api.adminPackages.list).toHaveBeenCalledTimes(3));
    expect(screen.getByText("Admin Flow Package")).toBeTruthy();
  });
});
