import { Card, Pill } from "@/design-system";
import { Clock } from "lucide-react";

import { T } from "@/constants/theme";
import type { DocumentRecord } from "@/lib/api";

type ExpiringSoonCardProps = {
  items: Array<{ doc: DocumentRecord; days: number }>;
};

export default function ExpiringSoonCard({ items }: ExpiringSoonCardProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: "var(--space-s12)",
        marginBottom: "var(--space-s22)",
      }}
    >
      <Card>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-s8)",
            marginBottom: "var(--space-s12)",
          }}
        >
          <Clock aria-hidden="true" focusable="false" size="var(--icon-small)" color={T.warning} />
          <span style={{ fontWeight: "var(--weight-bold)", color: T.white, fontSize: "var(--text-md)" }}>
            Expiring soon
          </span>
        </div>
        {items.length === 0 ? (
          <div style={{ color: T.muted, fontSize: "var(--text-md)" }}>
            No expiry dates found in saved backend documents yet.
          </div>
        ) : null}
        {items.map(({ doc, days }, index) => (
          <div
            key={doc.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "11px 0",
              borderTop: index ? `1px solid ${T.border}` : "none",
            }}
          >
            <span style={{ color: T.text, fontSize: "var(--text-md)" }}>
              {doc.originalName}
            </span>
            <Pill tone={days < 90 ? "wax" : "warn"}>{days} days</Pill>
          </div>
        ))}
      </Card>
    </div>
  );
}
