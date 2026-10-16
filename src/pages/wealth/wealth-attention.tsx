import { Text, Button, Card } from "@/design-system";

import { useState } from "react";
import { AlertTriangle, ChevronRight } from "lucide-react";

import type { WealthRecord } from "@/lib/api";
import { attentionRows, recordSubtitle } from "./wealth-view";

export function NeedsAttention({
  records,
  onSelect,
  onAction,
}: {
  records: WealthRecord[];
  onSelect: (record: WealthRecord) => void;
  onAction: (mode: "note" | "attach", record: WealthRecord) => void;
}) {
  const [all, setAll] = useState(false);
  const rows = attentionRows(records);
  const shownRows = all ? rows : rows.slice(0, 3);
  return (
    <Card flush style={{ overflow: "hidden", marginBottom: "var(--space-s16)" }}>
      <div className="lp-wealth-panel-head">
        <Text size="md" weight="semibold">
          <AlertTriangle aria-hidden="true" focusable="false" size="var(--icon-small)" /> Needs attention
        </Text>
        <Text as="b" size="sm" weight="semibold">{rows.length}</Text>
      </div>
      {shownRows.map(({ record, severity, reason, action }) => (
        <button
          key={`${record.id}-${reason}`}
          type="button"
          className="lp-wealth-attention-row"
          onClick={() =>
            action === "Attach"
              ? onAction("attach", record)
              : action === "Add note"
                ? onAction("note", record)
                : onSelect(record)
          }
        >
          <em className={severity.toLowerCase()}>
            {severity[0] + severity.slice(1).toLowerCase()}
          </em>
          <span>
            <b>
              {record.title} · {reason}
            </b>
            <small>{recordSubtitle(record)}</small>
          </span>
          <strong>{action}</strong>
          <ChevronRight aria-hidden="true" focusable="false" size={14} />
        </button>
      ))}
      {rows.length > 3 ? (
        <Button size="sm" variant="tertiary"
          type="button"
          onClick={() => setAll((value) => !value)}
        >
          {all ? "Show less" : `View all ${rows.length}`}{" "}
          <ChevronRight aria-hidden="true" focusable="false" size={14} />
        </Button>
      ) : null}
      {!rows.length ? (
        <Text as="div" size="sm" className="lp-wealth-empty">No urgent Wealth gaps right now.</Text>
      ) : null}
    </Card>
  );
}
