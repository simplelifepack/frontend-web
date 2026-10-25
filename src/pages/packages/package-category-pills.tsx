import { ChoiceGroup, Choice } from "@/design-system";
import { visiblePackageCategories } from "@/packages/packageCategories";
import { isUserPack } from "@/packages/packageCategories";

type CategoryPillsProps = {
  active: string;
  categories: string[];
  packs: Array<{ createdBy?: string }>;
  onSelect: (category: string) => void;
  customPackCount?: number;
};

export function PackageCategoryPills({
  active,
  categories,
  packs,
  onSelect,
  customPackCount,
}: CategoryPillsProps) {
  const items = ["All", ...visiblePackageCategories(categories), "My packs"];
  return (
    <ChoiceGroup
      className="packages-category-pills"
      aria-label="Package categories"
    >
      {items.map((item) => (
        <Choice
          appearance="filter"
          type="button"
          aria-pressed={active === item}
          key={item}
          onClick={() => onSelect(item)}
        >
          {item === "My packs"
            ? `My packs (${customPackCount ?? packs.filter(isUserPack).length})`
            : item}
        </Choice>
      ))}
    </ChoiceGroup>
  );
}
