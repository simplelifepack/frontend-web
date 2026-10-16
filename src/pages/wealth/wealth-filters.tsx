import { ChoiceGroup, Choice } from "@/design-system";
import { wealthCategories, type WealthCategory } from "./wealth-categories";

export function CategoryFilters({
  value,
  onChange,
}: {
  value: WealthCategory;
  onChange: (value: WealthCategory) => void;
}) {
  return (
    <div className="lp-wealth-filter-wrap" aria-label="Wealth categories">
      <ChoiceGroup >
        {wealthCategories.map((item) => (
          <Choice
            key={item.key}
            type="button"
            aria-pressed={value === item.key}
            onClick={() => onChange(item.key)}
          >
            {item.label}
          </Choice>
        ))}
      </ChoiceGroup>
    </div>
  );
}
