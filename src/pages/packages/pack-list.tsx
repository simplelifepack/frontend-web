import { Button, Card, Ring } from "@/design-system";

import { Plane, Search } from "lucide-react";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { T } from "@/constants/theme";
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
    <div style={{ display: "grid", gap: "var(--space-s10)", alignContent: "start" }}>
      <div
        style={{
          display: "flex",
          gap: "var(--space-s10)",
          alignItems: "center",
          background: T.panel,
          border: `1px solid ${T.border}`,
          borderRadius: "var(--radius-s10)",
          padding: "var(--space-s10) var(--space-s12)",
        }}
      >
        <Search aria-hidden="true" focusable="false" size="var(--icon-small)" color={T.action} />
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search packs"
          style={{ minWidth: 0, flex: 1, background: "transparent", border: "none", outline: "none", color: T.white, fontSize: "var(--text-md)" }}
        />
      </div>

      {status === "loading" ? (
        <Card>
          <div style={{ color: T.muted, fontSize: "var(--text-md)" }}>Loading packs...</div>
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
              border: `1px solid ${active ? T.action : T.border}`,
              borderRadius: "var(--radius-s10)",
              padding: "var(--space-s12) var(--space-s14)",
              display: "grid",
              gridTemplateColumns: "44px minmax(0, 1fr)",
              gap: 11,
              alignItems: "center",
            }}
          >
            <Ring score={Math.round(pack.completion)} size={40} />
            <span style={{ minWidth: 0 }}>
              <span
                style={{ display: "block", color: T.white, fontWeight: "var(--weight-bold)", fontSize: "var(--text-md)" }}
              >
                {pack.title}
              </span>
              <span
                style={{ display: "block", color: T.faint, fontSize: "var(--text-sm)", marginTop: 2 }}
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
            borderRadius: "var(--radius-s10)",
            padding: "var(--space-s10) var(--space-s12)",
          }}
        >
          <PaginationContent
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "var(--space-s10)",
            }}
          >
            <PaginationItem>
              <Button variant="secondary" size="sm"
                type="button"
                onClick={() => onPageChange((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}

              >
                Previous
              </Button>
            </PaginationItem>
            <PaginationItem>
              <div style={{ color: T.text, fontSize: "var(--text-md)", fontWeight: "var(--weight-bold)" }}>
                Page {currentPage} of {totalPages}
              </div>
            </PaginationItem>
            <PaginationItem>
              <Button variant="secondary" size="sm"
                type="button"
                onClick={() =>
                  onPageChange((page) => Math.min(totalPages, page + 1))
                }
                disabled={currentPage === totalPages}

              >
                Next
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      ) : null}

      {!filteredCount && status !== "loading" ? (
        <Card style={{ textAlign: "center", padding: "var(--space-s32)" }}>
          <span style={{ width: 46, height: 46, borderRadius: "var(--radius-panel)", display: "grid", placeItems: "center", background: "color-mix(in srgb, var(--lp-purple) 14%, transparent)", margin: "0 auto var(--space-s12)" }}>
            <Plane aria-hidden="true" focusable="false" size={21} color={T.purple} />
          </span>
          <div style={{ color: T.white, fontSize: "var(--text-md)", fontWeight: "var(--weight-bold)" }}>
            No packages yet
          </div>
          <div style={{ color: T.muted, fontSize: "var(--text-md)", marginTop: 5 }}>
            Packs from the backend will appear here, ready to review and export.
          </div>
        </Card>
      ) : null}
    </div>
  );
}
