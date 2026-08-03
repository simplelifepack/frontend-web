import Card from "@/components/Card";
import Ring from "@/components/Ring";
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
        style={{
          color: T.faint,
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: 1.5,
          marginBottom: 12,
        }}
      >
        YOUR DOCUMENT GRAPH
      </div>
      <div
        className="lp-category-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,minmax(0,1fr))",
          gap: 14,
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
                    borderRadius: 12,
                    display: "grid",
                    placeItems: "center",
                    background: `${category.accent}18`,
                  }}
                >
                  <Icon size={18} color={category.accent} />
                </span>
                <Ring
                  score={items.length ? 100 : 0}
                  size={42}
                  color={category.accent}
                />
              </div>
              <div
                style={{
                  color: T.white,
                  fontSize: 15,
                  fontWeight: 700,
                  marginTop: 14,
                }}
              >
                {category.name}
              </div>
              <div style={{ color: T.muted, fontSize: 12.5, marginTop: 5 }}>
                {items.length} documents
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
