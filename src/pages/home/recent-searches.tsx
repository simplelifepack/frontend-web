import { History } from "lucide-react";

import Card from "@/components/Card";
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
        style={{
          color: T.faint,
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: 1,
          marginBottom: 10,
        }}
      >
        READINESS CENTER
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 12,
          marginBottom: 22,
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
                gap: 12,
                alignItems: "center",
                textAlign: "left",
                background: T.panel,
                border: `1px solid ${T.border}`,
                borderRadius: 14,
                padding: 18,
                cursor: item.query ? "pointer" : "default",
                opacity: item.query ? 1 : 0.78,
              }}
            >
              <span
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: T.raised,
                  color: T.gold,
                }}
              >
                <History size={17} />
              </span>
              <span style={{ minWidth: 0 }}>
                <span
                  style={{
                    display: "block",
                    color: T.white,
                    fontWeight: 800,
                    fontSize: 14,
                  }}
                >
                  {item.query}
                </span>
                <span
                  style={{
                    display: "block",
                    color: T.muted,
                    fontSize: 12,
                    marginTop: 4,
                  }}
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
            <div style={{ color: T.white, fontWeight: 800, fontSize: 15 }}>
              No recent searches yet
            </div>
            <div style={{ color: T.muted, fontSize: 13, marginTop: 6 }}>
              Search for a document pack like Passport renewal, Home loan, or
              Bike loan to see it here.
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
