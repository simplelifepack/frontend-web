import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PackageCategoryPills } from "./package-category-pills";
import { matchesPackageCategory } from "@/packages/packageCategories";
const packs = [
  { title: "Care visit", category: "Health", createdBy: "seed" },
  { title: "Visa", category: "Travel & Immigration", createdBy: "seed" },
  { title: "My checklist", category: "Health", createdBy: "user-1" },
];
afterEach(cleanup);
function Catalogue() {
  const [active, setActive] = useState("All");
  return (
    <>
      <PackageCategoryPills
        active={active}
        categories={[]}
        packs={packs}
        onSelect={setActive}
      />
      <ul>
        {packs
          .filter((pack) => matchesPackageCategory(pack, active))
          .map((pack) => (
            <li key={pack.title}>{pack.title}</li>
          ))}
      </ul>
    </>
  );
}
describe("package category navigation", () => {
  it("retains all reference categories when an older cached response has no category metadata", () => {
    render(<Catalogue />);
    for (const name of [
      "All",
      "Identity & Civic",
      "Money & Tax",
      "Health",
      "Family & Life",
      "Home & Property",
      "Education",
      "Jobs & Employment",
      "Travel & Immigration",
      "My packs (1)",
    ])
      expect(screen.getByRole("button", { name })).toBeTruthy();
  });
  it("filters Health, Travel, My packs and restores All with correct pressed states", () => {
    render(<Catalogue />);
    fireEvent.click(
      screen.getByRole("button", { name: "Health" }),
    );
    expect(
      screen
        .getByRole("button", { name: "Health" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
    expect(screen.queryByText("Visa")).toBeNull();
    expect(screen.getByText("Care visit")).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", { name: "Travel & Immigration" }),
    );
    expect(screen.getByText("Visa")).toBeTruthy();
    expect(screen.queryByText("Care visit")).toBeNull();
    fireEvent.click(
      screen.getByRole("button", { name: "My packs (1)" }),
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByText("My checklist")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "All" }));
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });
  it("shows the server’s full custom pack count instead of a partial cached page", () => {
    render(
      <PackageCategoryPills
        active="All"
        categories={["Health", "Custom category", "All"]}
        packs={packs}
        customPackCount={42}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "My packs (42)" })).toBeTruthy();
    expect(
      screen.getAllByRole("button", { name: "Health" }),
    ).toHaveLength(1);
    expect(
      screen.getByRole("button", { name: "Custom category" }),
    ).toBeTruthy();
  });
});
