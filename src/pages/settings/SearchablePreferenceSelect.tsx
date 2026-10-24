import {
  Stack,
  ControlSlot,
  ScrollRegion,
  Text,
  SearchField,
  Button,
  Choice,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/design-system";

import { ChevronDown } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { T } from "@/constants/theme";
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
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = options.find((option) => option.code === value) ?? null;
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return options;
    return options.filter((option) =>
      `${option.code} ${option.label}`.toLowerCase().includes(needle),
    );
  }, [options, query]);

  return (
    <ControlSlot>
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (next) setQuery("");
        }}
      >
        <PopoverTrigger asChild>
          <Button
            fullWidth
            ref={trigger}
            variant="secondary"
            disabled={disabled}
            aria-label={ariaLabel}
            aria-expanded={open}
          >
            <Text>{selected ? optionLabel(selected) : placeholder}</Text>
            <ChevronDown aria-hidden="true" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" aria-label={`${ariaLabel} options`}>
          <Stack $gap="s8">
            <SearchField
              aria-label="Search options"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              autoFocus
              placeholder="Search"
            />
            <ScrollRegion $vertical>
              <Stack $gap="s4">
                {filtered.map((option) => (
                  <Choice
                    aria-pressed={option.code === value}
                    key={option.code}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      onChange(option.code);
                      setOpen(false);
                      trigger.current?.focus();
                    }}
                  >
                    <Text>{optionLabel(option)}</Text>
                    <Text size="sm" tone="muted">
                      {option.code}
                    </Text>
                  </Choice>
                ))}
                {!filtered.length && (
                  <Text size="sm" tone="muted">
                    No matches
                  </Text>
                )}
              </Stack>
            </ScrollRegion>
          </Stack>
        </PopoverContent>
      </Popover>
    </ControlSlot>
  );
}
