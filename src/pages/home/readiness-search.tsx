import { FormEvent } from "react";
import { Search } from "lucide-react";

import Pill from "@/components/Pill";
import { btnGold, T } from "@/constants/theme";
import type { ReadinessResult } from "@/lib/api";

type ReadinessSuggestion = ReadinessResult["suggestions"][number];

type ReadinessSearchProps = {
  query: string;
  readinessStatus: "idle" | "loading" | "failed";
  suggestions: ReadinessSuggestion[];
  suggestionsStatus: "idle" | "loading" | "failed";
  isFocused: boolean;
  onSubmit: (event: FormEvent) => void;
  onQueryChange: (value: string) => void;
  onFocus: () => void;
  onSuggestionSelect: (suggestion: ReadinessSuggestion) => void;
};

export default function ReadinessSearch({
  query,
  readinessStatus,
  suggestions,
  suggestionsStatus,
  isFocused,
  onSubmit,
  onQueryChange,
  onFocus,
  onSuggestionSelect,
}: ReadinessSearchProps) {
  return (
    <div style={{ marginBottom: 22 }}>
      <form
        onSubmit={onSubmit}
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          background: T.panel,
          border: `1px solid ${T.border}`,
          borderRadius: 12,
          padding: "12px 16px",
        }}
      >
        <Search size={17} color={T.gold} />
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          onFocus={onFocus}
          placeholder="Prepare a visa, a home loan, a hospital admission, a tax filing"
          style={{
            flex: 1,
            minWidth: 220,
            color: T.white,
            fontSize: 14,
            background: "transparent",
            border: "none",
            outline: "none",
          }}
        />
        <button
          type="submit"
          disabled={readinessStatus === "loading"}
          style={btnGold}
        >
          {readinessStatus === "loading" ? "Checking..." : "Check readiness"}
        </button>
      </form>

      {isFocused && query.trim() ? (
        <div
          style={{
            background: T.panel,
            border: `1px solid ${T.border}`,
            borderTop: "none",
            borderRadius: "0 0 12px 12px",
            marginTop: -8,
            overflow: "hidden",
            paddingTop: 8,
          }}
        >
          {suggestions.length ? (
            suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => onSuggestionSelect(suggestion)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1fr) auto",
                  gap: 12,
                  width: "100%",
                  padding: "12px 16px",
                  background: "transparent",
                  border: "none",
                  borderTop: `1px solid ${T.border}`,
                  color: T.text,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <span style={{ minWidth: 0 }}>
                  <span
                    style={{
                      display: "block",
                      color: T.white,
                      fontSize: 13.5,
                      fontWeight: 800,
                    }}
                  >
                    {suggestion.title}
                  </span>
                  <span
                    style={{
                      display: "block",
                      color: T.muted,
                      fontSize: 12,
                      marginTop: 3,
                    }}
                  >
                    {suggestion.description}
                  </span>
                </span>
                <Pill tone="flat">{suggestion.category}</Pill>
              </button>
            ))
          ) : (
            <div
              style={{
                color: T.muted,
                fontSize: 13,
                padding: "12px 16px",
                borderTop: `1px solid ${T.border}`,
              }}
            >
              {suggestionsStatus === "loading"
                ? "Searching..."
                : "No related readiness packs found"}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
