import { ControlSlot, SearchableSelectMenu } from "@/design-system";
import type { PreferenceOption } from "./preference-options";
import { optionLabel } from "./preference-options";

export default function SearchablePreferenceSelect({
  ariaLabel,
  disabled,
  onChange,
  options,
  placeholder,
  value,
}: {
  ariaLabel: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  options: PreferenceOption[];
  placeholder: string;
  value: string | null;
}) {
  return (
    <ControlSlot>
      <SearchableSelectMenu
        aria-label={ariaLabel}
        disabled={disabled}
        value={value ?? ""}
        placeholder={placeholder}
        onValueChange={onChange}
        options={options.map((option) => ({
          value: option.code,
          label: optionLabel(option),
          searchText: `${option.code} ${option.label}`,
        }))}
      />
    </ControlSlot>
  );
}
