import { Text, Button, Card } from "@/design-system";

import { Coins, Plus } from "lucide-react";

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
    <Card flush
      id="lp-lentborrowed"
      style={{ overflow: "hidden", marginBottom: "var(--space-s16)", scrollMarginTop: 60 }}
    >
      <div className="lp-wealth-section-head lp-lent-head">
        <Text size="md" weight="semibold">
          <Coins aria-hidden="true" focusable="false" size="var(--icon-small)" /> Lent and borrowed
        </Text>
        {open > 0 ? <Text as="small" size="sm" weight="semibold">{open} open</Text> : null}
        <Button size="sm" variant="primary" type="button" onClick={onRecord}>
          <Plus aria-hidden="true" focusable="false" size={13} /> Record
        </Button>
      </div>
      {!records.length ? (
        <Text as="p" size="md" className="lp-lent-empty">
          Money lent to or borrowed from people, with the screenshot or chat
          that proves it. Nothing a bank would ever tell your family.
        </Text>
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
