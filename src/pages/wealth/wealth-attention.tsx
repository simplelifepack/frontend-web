import { useState } from "react";
import { AlertTriangle, ChevronRight } from "lucide-react";

import Card from "@/components/Card";
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
    <Card style={{ padding: 0, overflow: "hidden", marginBottom: 16 }}>
      <div className="lp-wealth-panel-head">
        <span>
          <AlertTriangle size={16} /> Needs attention
        </span>
        <b>{rows.length}</b>
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
          <ChevronRight size={14} />
        </button>
      ))}
      {rows.length > 3 ? (
        <button
          type="button"
          className="lp-wealth-view-all"
          onClick={() => setAll((value) => !value)}
        >
          {all ? "Show less" : `View all ${rows.length}`}{" "}
          <ChevronRight size={14} />
        </button>
      ) : null}
      {!rows.length ? (
        <div className="lp-wealth-empty">No urgent Wealth gaps right now.</div>
      ) : null}
    </Card>
  );
}
