import { Text, Button } from "@/design-system";

import { Check, Coins } from "lucide-react";

import type { WealthRecord } from "@/lib/api";
import { followUpText, formatShortDate, recordAmount, recordMoney } from "./wealth-view";
import { StatusBadge } from "./wealth-record-section";

export function LentBorrowedRow({
  record,
  onSelect,
  onSettle,
}: {
  record: WealthRecord;
  onSelect: () => void;
  onSettle: (settled: boolean) => void;
}) {
  const party = String(
    record.details.who ||
      record.details.party ||
      record.details.paidTo ||
      record.details.receivedFrom ||
      record.details.provider ||
      "Unspecified",
  );
  const amount = recordAmount(record);
  const youOwe =
    record.type === "LOAN_TAKEN" ||
    record.details.direction === "received" ||
    record.details.direction === "BORROWED";
  const settled =
    record.details.followUpDone === true ||
    record.details.followUpDone === "true" ||
    (!record.followUpDate && record.type === "PAYMENT_PROOF");
  const label =
    record.details.recordKind === "money_lent_borrowed"
      ? youOwe
        ? "you owe"
        : "owed to you"
      : youOwe
        ? "you owe"
        : "owed to you";
  const proofAcknowledged = record.details.proofStatus === "cash_no_record";
  const date =
    typeof record.details.transactionDate === "string"
      ? record.details.transactionDate
      : typeof record.details.date === "string"
        ? record.details.date
        : "";
  const followUp =
    typeof record.followUpDate === "string" && !settled
      ? followUpText(record.followUpDate)
      : "";
  return (
    <div
      className="lp-lent-row lp-txrow"
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") onSelect();
      }}
    >
      <span
        className={`lp-lent-icon ${settled ? "settled" : youOwe ? "borrowed" : "lent"}`}
      >
        <Coins aria-hidden="true" focusable="false" size={15} />
      </span>
      <span className="lp-wname" style={{ opacity: settled ? 0.6 : 1 }}>
        <Text as="b" size="md" weight="semibold">
          {party === "Unspecified" ? (youOwe ? "Borrowed" : "Lent") : party}
        </Text>
        <Text as="small" size="sm">
          {record.title}
          {date ? ` · ${formatShortDate(date)}` : ""}
          {followUp ? ` · ${followUp}` : settled ? " · settled" : ""}
        </Text>
      </span>
      <Text as="strong" size="md" weight="semibold"
        className={`${youOwe ? "negative" : ""} ${settled ? "settled" : ""}`}
      >
        {recordMoney(record, amount)} <span>{settled ? "" : label}</span>
      </Text>
      {!settled ? (
        <span className="lp-wchips">
          <StatusBadge
            ok={proofAcknowledged || record.attachments.length > 0}
            label={proofAcknowledged ? "No proof" : "Evidence"}
          />
          <StatusBadge ok={party !== "Unspecified"} label="Contact" />
        </span>
      ) : null}
      <Button size="sm" variant="tertiary"
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onSettle(!settled);
        }}
      >
        {settled ? (
          "Reopen"
        ) : (
          <>
            <Check aria-hidden="true" focusable="false" size={12} /> Settled
          </>
        )}
      </Button>
    </div>
  );
}
