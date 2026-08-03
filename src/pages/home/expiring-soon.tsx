import { Clock } from "lucide-react";

import Card from "@/components/Card";
import Pill from "@/components/Pill";
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
        gap: 12,
        marginBottom: 22,
      }}
    >
      <Card>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 12,
          }}
        >
          <Clock size={16} color={T.gold} />
          <span style={{ fontWeight: 700, color: T.white, fontSize: 14 }}>
            Expiring soon
          </span>
        </div>
        {items.length === 0 ? (
          <div style={{ color: T.muted, fontSize: 13.5 }}>
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
            <span style={{ color: T.text, fontSize: 13.5 }}>
              {doc.originalName}
            </span>
            <Pill tone={days < 90 ? "wax" : "warn"}>{days} days</Pill>
          </div>
        ))}
      </Card>
    </div>
  );
}
