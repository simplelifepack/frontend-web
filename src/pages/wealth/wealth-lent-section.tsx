import { Coins, Plus } from "lucide-react";

import Card from "@/components/Card";
import type { WealthRecord } from "@/lib/api";
import { LentBorrowedRow } from "./wealth-lent-row";

export function LentBorrowedSection({
  records,
  onRecord,
  onSelect,
  onSettle,
}: {
  records: WealthRecord[];
  onRecord: () => void;
  onSelect: (record: WealthRecord) => void;
  onSettle: (record: WealthRecord, settled: boolean) => void;
}) {
  const sorted = [...records].sort(
    (a, b) =>
      Number(Boolean(a.details.followUpDone)) -
      Number(Boolean(b.details.followUpDone)),
  );
  const open = records.filter((record) => !record.details.followUpDone).length;
  return (
    <Card
      id="lp-lentborrowed"
      style={{
        padding: 0,
        overflow: "hidden",
        marginBottom: 16,
        scrollMarginTop: 60,
      }}
    >
      <div className="lp-wealth-section-head lp-lent-head">
        <span>
          <Coins size={16} /> Lent and borrowed
        </span>
        {open > 0 ? <small>{open} open</small> : null}
        <button type="button" onClick={onRecord}>
          <Plus size={13} /> Record
        </button>
      </div>
      {!records.length ? (
        <p className="lp-lent-empty">
          Money lent to or borrowed from people, with the screenshot or chat
          that proves it. Nothing a bank would ever tell your family.
        </p>
      ) : (
        sorted.map((record) => (
          <LentBorrowedRow
            key={record.id}
            record={record}
            onSelect={() => onSelect(record)}
            onSettle={(settled) => onSettle(record, settled)}
          />
        ))
      )}
    </Card>
  );
}
