import { History } from "lucide-react";

import { Card } from "@/design-system";
import { T } from "@/constants/theme";
import type { SearchHistoryItem } from "@/lib/search-history";

type RecentSearchesProps = {
  items: SearchHistoryItem[];
  onSelect: (query: string | undefined) => void;
};

export default function RecentSearches({ items, onSelect }: RecentSearchesProps) {
  return (
    <>
      <div
        style={{ color: T.faint, fontSize: "var(--text-sm)", fontWeight: "var(--weight-bold)", letterSpacing: 1, marginBottom: "var(--space-s10)" }}
      >
        READINESS CENTER
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "var(--space-s12)",
          marginBottom: "var(--space-s22)",
        }}
      >
        {items.length ? (
          items.map((item) => (
            <button
              key={`${item.queryHash}-${item.createdAt}`}
              type="button"
              onClick={() => onSelect(item.query)}
              disabled={!item.query}
              style={{
                display: "grid",
                gridTemplateColumns: "34px minmax(0, 1fr)",
                gap: "var(--space-s12)",
                alignItems: "center",
                textAlign: "left",
                background: T.panel,
                border: `1px solid ${T.border}`,
                borderRadius: "var(--radius-panel)",
                padding: "var(--space-s18)",
                cursor: item.query ? "pointer" : "default",
                opacity: item.query ? 1 : 0.78,
              }}
            >
              <span
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "var(--radius-s10)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: T.raised,
                  color: T.action,
                }}
              >
                <History aria-hidden="true" focusable="false" size={17} />
              </span>
              <span style={{ minWidth: 0 }}>
                <span
                  style={{ display: "block", color: T.white, fontWeight: "var(--weight-bold)", fontSize: "var(--text-md)" }}
                >
                  {item.query}
                </span>
                <span
                  style={{ display: "block", color: T.muted, fontSize: "var(--text-sm)", marginTop: "var(--space-s4)" }}
                >
                  Last searched{" "}
                  {new Date(item.updatedAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </span>
            </button>
          ))
        ) : (
          <Card style={{ gridColumn: "1 / -1" }}>
            <div style={{ color: T.white, fontWeight: "var(--weight-bold)", fontSize: "var(--text-md)" }}>
              No recent searches yet
            </div>
            <div style={{ color: T.muted, fontSize: "var(--text-md)", marginTop: "var(--space-s6)" }}>
              Search for a document pack or describe what you need to see it
              here.
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
