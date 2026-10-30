import { Command } from "cmdk";
import { Check, ChevronDown } from "lucide-react";
import { useRef, useState } from "react";
import styled from "styled-components";
import { Popover, PopoverContent, PopoverTrigger } from "../Popover";
import { fieldStyles } from "../Input/styles";
import { theme } from "../../variables/theme";
import {
  SelectTriggerButton,
  selectOptionStyles,
  selectSurfaceStyles,
  type SelectMenuProps,
} from "./SelectMenu";

const Content = styled(PopoverContent)`
  ${selectSurfaceStyles}
  width: max(260px, var(--radix-popover-trigger-width));
`;
const Search = styled(Command.Input)`
  ${fieldStyles}
  margin-bottom: ${({ theme }) => theme.spacing.s4};
`;
const List = styled(Command.List)`
  max-height: min(260px, var(--radix-popover-content-available-height));
  overflow-y: auto;
`;
const Item = styled(Command.Item)`
  ${selectOptionStyles}
`;
const Empty = styled(Command.Empty)`
  padding: ${({ theme }) => theme.spacing.s12};
  color: ${({ theme }) => theme.colors.muted};
`;
for (const component of [Content, Search, List, Item, Empty])
  component.defaultProps = { theme };

/** Searchable option list using the same trigger, menu, and items as SelectMenu. */
type Props = SelectMenuProps & {
  onSearchChange?: (query: string) => void;
  allowCustomValue?: boolean;
};

export function SearchableSelectMenu({
  value,
  onValueChange,
  options,
  placeholder,
  disabled,
  container,
  onSearchChange,
  allowCustomValue = false,
  ...props
}: Props) {
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = options.find((option) => option.value === value);
  const customValue = query.trim();
  const showCustom =
    allowCustomValue &&
    customValue &&
    !options.some(
      (option) => option.value.toLowerCase() === customValue.toLowerCase(),
    );
  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        setQuery("");
        onSearchChange?.("");
      }}
    >
      <PopoverTrigger asChild>
        <SelectTriggerButton
          {...props}
          ref={trigger}
          type="button"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          data-ds-control=""
          data-ds-select=""
        >
          <span>
            {selected?.label ??
              (allowCustomValue && value ? value : placeholder)}
          </span>
          <ChevronDown aria-hidden="true" />
        </SelectTriggerButton>
      </PopoverTrigger>
      <Content
        aria-label={`${props["aria-label"] ?? "Select"} options`}
        container={
          container ?? trigger.current?.closest<HTMLElement>('[role="dialog"]')
        }
        align="start"
        data-ds-select-menu=""
      >
        <Command label="Search options" defaultValue={value}>
          <Search
            aria-label="Search options"
            placeholder="Search"
            value={query}
            onValueChange={(next) => {
              setQuery(next);
              onSearchChange?.(next);
            }}
          />
          <List>
            <Empty>No matches</Empty>
            {options.map((option) => (
              <Item
                key={option.value}
                value={option.value}
                keywords={[
                  option.searchText ??
                    (typeof option.label === "string"
                      ? option.label
                      : option.value),
                ]}
                disabled={option.disabled}
                forceMount={option.alwaysVisible}
                data-state={value === option.value ? "checked" : undefined}
                onSelect={() => {
                  onValueChange?.(option.value);
                  setOpen(false);
                }}
              >
                <span>{option.label}</span>
                {value === option.value && <Check aria-hidden="true" />}
              </Item>
            ))}
            {showCustom && (
              <Item
                value={customValue}
                onSelect={() => {
                  onValueChange?.(customValue);
                  setOpen(false);
                }}
              >
                Use “{customValue}”
              </Item>
            )}
          </List>
        </Command>
      </Content>
    </Popover>
  );
}
