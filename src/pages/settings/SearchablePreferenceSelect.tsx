import { ChevronDown, Search } from "lucide-react";
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
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const blurTimer = useRef<number | null>(null);
  const selected = options.find((option) => option.code === value) ?? null;
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return options;
    return options.filter((option) =>
      `${option.code} ${option.label}`.toLowerCase().includes(needle),
    );
  }, [options, query]);

  const closeSoon = () => {
    blurTimer.current = window.setTimeout(() => setOpen(false), 120);
  };

  const cancelClose = () => {
    if (blurTimer.current) window.clearTimeout(blurTimer.current);
  };

  return (
    <div onBlur={closeSoon} onFocus={cancelClose} style={{ position: "relative", minWidth: 230 }}>
      <button type="button" disabled={disabled} aria-label={ariaLabel} aria-expanded={open} onClick={() => { setOpen((value) => !value); setQuery(""); }} style={{
        width: "100%",
        minHeight: 38,
        display: "flex",
        alignItems: "center",
        gap: 8,
        border: `1px solid ${T.border}`,
        borderRadius: 9,
        background: T.raised,
        color: selected ? T.text : T.muted,
        padding: "7px 10px",
        fontWeight: 700,
        cursor: disabled ? "wait" : "pointer",
      }}>
        <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "left" }}>
          {selected ? optionLabel(selected) : placeholder}
        </span>
        <ChevronDown size={15} color={T.faint} />
      </button>
      {open ? (
        <div style={{
          position: "absolute",
          zIndex: 30,
          right: 0,
          top: "calc(100% + 8px)",
          width: "min(330px, calc(100vw - 42px))",
          border: `1px solid ${T.border}`,
          borderRadius: 12,
          background: T.panel,
          boxShadow: "0 18px 40px color-mix(in srgb, var(--lp-navy) 32%, transparent)",
          padding: 8,
        }}>
          <label style={{ display: "flex", alignItems: "center", gap: 7, border: `1px solid ${T.border}`, borderRadius: 9, padding: "7px 9px", color: T.muted }}>
            <Search size={14} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} autoFocus placeholder="Search" style={{ flex: 1, minWidth: 0, border: 0, outline: 0, background: "transparent", color: T.text, font: "inherit" }} />
          </label>
          <div style={{ maxHeight: 240, overflowY: "auto", marginTop: 7 }}>
            {filtered.map((option) => (
              <button key={option.code} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => { onChange(option.code); setOpen(false); }} style={{
                width: "100%",
                display: "flex",
                gap: 8,
                alignItems: "center",
                border: 0,
                borderRadius: 8,
                background: option.code === value ? "color-mix(in srgb, var(--lp-action) 16%, transparent)" : "transparent",
                color: option.code === value ? T.action : T.text,
                padding: "8px 9px",
                textAlign: "left",
                fontWeight: 700,
              }}>
                <span style={{ flex: 1 }}>{optionLabel(option)}</span>
                <small style={{ color: T.muted }}>{option.code}</small>
              </button>
            ))}
            {!filtered.length ? <div style={{ color: T.muted, fontSize: 12, padding: 10 }}>No matches</div> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
