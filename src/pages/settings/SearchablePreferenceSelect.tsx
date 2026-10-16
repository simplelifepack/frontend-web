import {
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
    <div style={{ minWidth: 230, maxWidth: "100%" }}>
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (next) setQuery("");
        }}
      >
        <PopoverTrigger asChild>
          <Button
            ref={trigger}
            variant="secondary"
            type="button"
            disabled={disabled}
            aria-label={ariaLabel}
            aria-expanded={open}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "var(--space-s8)",
            }}
          >
            <span
              style={{
                flex: 1,
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                textAlign: "left",
              }}
            >
              {selected ? optionLabel(selected) : placeholder}
            </span>
            <ChevronDown
              aria-hidden="true"
              focusable="false"
              size={15}
              color={T.faint}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" aria-label={`${ariaLabel} options`}>
          <SearchField
            aria-label="Search options"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoFocus
            placeholder="Search"
          />
          <div style={{ maxHeight: 240, overflowY: "auto", marginTop: 7 }}>
            {filtered.map((option) => (
              <Choice
                aria-pressed={option.code === value}
                key={option.code}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onChange(option.code);
                  setOpen(false);
                  trigger.current?.focus();
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  gap: "var(--space-s8)",
                  alignItems: "center",
                  textAlign: "left",
                }}
              >
                <span style={{ flex: 1 }}>{optionLabel(option)}</span>
                <small style={{ color: T.muted }}>{option.code}</small>
              </Choice>
            ))}
            {!filtered.length ? (
              <Text
                as="div"
                size="sm"
                tone="muted"
                style={{ color: T.muted, padding: "var(--space-s10)" }}
              >
                No matches
              </Text>
            ) : null}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
