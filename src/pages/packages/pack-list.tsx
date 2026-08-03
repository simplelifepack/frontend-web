import { Plane, Search } from "lucide-react";

import Card from "@/components/Card";
import Ring from "@/components/Ring";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { btnGhost, T } from "@/constants/theme";
import type { DerivedPackSummary } from "@/readiness/selectors";

type PackListProps = {
  currentPage: number;
  filteredCount: number;
  packs: DerivedPackSummary[];
  query: string;
  selectedSlug: string | undefined;
  shouldShowPagination: boolean;
  status: "idle" | "loading" | "succeeded" | "failed";
  totalPages: number;
  onPageChange: (page: number | ((current: number) => number)) => void;
  onQueryChange: (query: string) => void;
  onSelect: (slug: string) => void;
};

export default function PackList({
  currentPage,
  filteredCount,
  packs,
  query,
  selectedSlug,
  shouldShowPagination,
  status,
  totalPages,
  onPageChange,
  onQueryChange,
  onSelect,
}: PackListProps) {
  return (
    <div style={{ display: "grid", gap: 10, alignContent: "start" }}>
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          background: T.panel,
          border: `1px solid ${T.border}`,
          borderRadius: 10,
          padding: "10px 12px",
        }}
      >
        <Search size={16} color={T.gold} />
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search packs"
          style={{
            minWidth: 0,
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            color: T.white,
            fontSize: 13,
          }}
        />
      </div>

      {status === "loading" ? (
        <Card>
          <div style={{ color: T.muted, fontSize: 13 }}>Loading packs...</div>
        </Card>
      ) : null}

      {packs.map((pack) => {
        const active = pack.slug === selectedSlug;
        return (
          <button
            key={pack.slug}
            type="button"
            onClick={() => onSelect(pack.slug)}
            style={{
              textAlign: "left",
              cursor: "pointer",
              background: active ? T.raised : T.panel,
              border: `1px solid ${active ? T.gold : T.border}`,
              borderRadius: 10,
              padding: "12px 14px",
              display: "grid",
              gridTemplateColumns: "44px minmax(0, 1fr)",
              gap: 11,
              alignItems: "center",
            }}
          >
            <Ring score={Math.round(pack.completion)} size={40} />
            <span style={{ minWidth: 0 }}>
              <span
                style={{
                  display: "block",
                  color: T.white,
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                {pack.title}
              </span>
              <span
                style={{
                  display: "block",
                  color: T.faint,
                  fontSize: 11.5,
                  marginTop: 2,
                }}
              >
                {pack.category} . {pack.uploadedDocumentTypes.length}/
                {pack.requiredDocumentTypes.length} ready
              </span>
            </span>
          </button>
        );
      })}

      {shouldShowPagination ? (
        <Pagination
          style={{
            background: T.panel,
            border: `1px solid ${T.border}`,
            borderRadius: 10,
            padding: "10px 12px",
          }}
        >
          <PaginationContent
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <PaginationItem>
              <button
                type="button"
                onClick={() => onPageChange((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                style={{
                  ...btnGhost,
                  padding: "8px 11px",
                  opacity: currentPage === 1 ? 0.55 : 1,
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                }}
              >
                Previous
              </button>
            </PaginationItem>
            <PaginationItem>
              <div style={{ color: T.text, fontSize: 12.5, fontWeight: 700 }}>
                Page {currentPage} of {totalPages}
              </div>
            </PaginationItem>
            <PaginationItem>
              <button
                type="button"
                onClick={() =>
                  onPageChange((page) => Math.min(totalPages, page + 1))
                }
                disabled={currentPage === totalPages}
                style={{
                  ...btnGhost,
                  padding: "8px 11px",
                  opacity: currentPage === totalPages ? 0.55 : 1,
                  cursor:
                    currentPage === totalPages ? "not-allowed" : "pointer",
                }}
              >
                Next
              </button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      ) : null}

      {!filteredCount && status !== "loading" ? (
        <Card style={{ textAlign: "center", padding: 32 }}>
          <span style={{ width: 46, height: 46, borderRadius: 14, display: "grid", placeItems: "center", background: "rgba(155,123,232,.14)", margin: "0 auto 12px" }}>
            <Plane size={21} color="#9B7BE8" />
          </span>
          <div style={{ color: T.white, fontSize: 15, fontWeight: 800 }}>
            No life-event packs yet
          </div>
          <div style={{ color: T.muted, fontSize: 13, marginTop: 5 }}>
            Packs from the backend will appear here, ready to review and export.
          </div>
        </Card>
      ) : null}
    </div>
  );
}
