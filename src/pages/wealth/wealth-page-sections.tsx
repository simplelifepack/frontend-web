import type { WealthRecord } from "@/lib/api";
import { dashboardStats } from "./wealth-view";
import { CategoryFilters } from "./wealth-filters";
import { RecordSection } from "./wealth-record-section";
import { LentBorrowedSection } from "./wealth-lent-section";
import type { WealthCategory } from "./wealth-categories";

export function WealthSections({
  category,
  stats,
  onCategory,
  onRecord,
  onSelect,
  onSettle,
}: {
  category: WealthCategory;
  stats: ReturnType<typeof dashboardStats>;
  onCategory: (category: WealthCategory) => void;
  onRecord: () => void;
  onSelect: (record: WealthRecord) => void;
  onSettle: (record: WealthRecord, settled: boolean) => void;
}) {
  return (
    <>
      <CategoryFilters value={category} onChange={onCategory} />
      {category === "all" || category === "Accounts and investments" ? <RecordSection title="Accounts and investments" total={stats.assetTotal} records={stats.assets} tone="asset" onSelect={onSelect} /> : null}
      {category === "all" || category === "Loans" ? <RecordSection title="Loans" total={stats.liabilityTotal} records={stats.liabilities} tone="liability" negative onSelect={onSelect} /> : null}
      {category === "all" || category === "Insurance" ? <RecordSection title="Insurance" total={stats.protectionTotal} records={stats.protection} tone="protection" onSelect={onSelect} /> : null}
      {category === "all" || category === "Lent and borrowed" ? <LentBorrowedSection records={stats.lentBorrowed} onRecord={onRecord} onSelect={onSelect} onSettle={onSettle} /> : null}
    </>
  );
}
