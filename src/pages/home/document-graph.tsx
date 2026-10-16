import { Card, Ring } from "@/design-system";

import { T } from "@/constants/theme";
import type { DocumentRecord } from "@/lib/api";
import { categories } from "@/pages/documents/document-utils";

export default function DocumentGraph({
  documents,
}: {
  documents: DocumentRecord[];
}) {
  return (
    <>
      <div
        style={{ color: T.faint, fontSize: "var(--text-sm)", fontWeight: "var(--weight-bold)", letterSpacing: 1.5, marginBottom: "var(--space-s12)" }}
      >
        YOUR DOCUMENT GRAPH
      </div>
      <div
        className="lp-category-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,minmax(0,1fr))",
          gap: "var(--space-s14)",
          marginBottom: 28,
        }}
      >
        {categories.map((category) => {
          const items = documents.filter(
            (document) => document.category === category.key,
          );
          const Icon = category.icon;
          return (
            <Card key={category.key}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "var(--radius-surface)",
                    display: "grid",
                    placeItems: "center",
                    background: `color-mix(in srgb, ${category.accent} 12%, transparent)`,
                  }}
                >
                  <Icon aria-hidden="true" focusable="false" size="var(--icon-regular)" color={category.accent} />
                </span>
                <Ring
                  score={items.length ? 100 : 0}
                  size={42}
                  color={category.accent}
                />
              </div>
              <div
                style={{ color: T.white, fontSize: "var(--text-md)", fontWeight: "var(--weight-bold)", marginTop: "var(--space-s14)" }}
              >
                {category.name}
              </div>
              <div style={{ color: T.muted, fontSize: "var(--text-md)", marginTop: 5 }}>
                {items.length} documents
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
