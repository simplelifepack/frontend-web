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
      <div className="lp-wealth-filters">
        {wealthCategories.map((item) => (
          <button
            key={item.key}
            type="button"
            className={value === item.key ? "active" : ""}
            onClick={() => onChange(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
