import { ChevronRight, Coins, FileCheck, Landmark, ShieldCheck } from "lucide-react";

import Card from "@/components/Card";
import type { WealthRecord } from "@/lib/api";
import { money, recordAmount, recordMoney, recordSubtitle, statusFor } from "./wealth-view";

export function RecordSection({
  title,
  total,
  records,
  negative,
  tone,
  onSelect,
}: {
  title: string;
  total?: number;
  records: WealthRecord[];
  negative?: boolean;
  tone: "asset" | "liability" | "protection" | "proof";
  onSelect: (record: WealthRecord) => void;
}) {
  if (!records.length) return null;
  return (
    <Card style={{ padding: 0, overflow: "hidden", marginBottom: 16 }}>
      <div className="lp-wealth-section-head">
        <span>{title}</span>
        {total !== undefined ? (
          <b>
            {negative ? "-" : ""}
            {money(total)}
          </b>
        ) : null}
      </div>
      {records.map((record) => (
        <RecordRow
          key={record.id}
          record={record}
          negative={negative}
          tone={tone}
          onSelect={() => onSelect(record)}
        />
      ))}
    </Card>
  );
}

function RecordRow({
  record,
  negative,
  tone,
  onSelect,
}: {
  record: WealthRecord;
  negative?: boolean;
  tone: "asset" | "liability" | "protection" | "proof";
  onSelect: () => void;
}) {
  const status = statusFor(record);
  const Icon =
    tone === "liability"
      ? Landmark
      : tone === "protection"
        ? ShieldCheck
        : tone === "proof"
          ? FileCheck
          : Coins;
  return (
    <button
      type="button"
      className="lp-wealth-record-row lp-wrow lp-hrow"
      onClick={onSelect}
    >
      <span className={`lp-wealth-link-icon ${tone}`}>
        <Icon size={16} />
      </span>
      <span className="lp-wname">
        <b>{record.title}</b>
        <small>{recordSubtitle(record)}</small>
      </span>
      <strong className={`lp-wamt ${negative ? "negative" : ""}`}>
        {negative ? "-" : ""}
        {recordMoney(record, recordAmount(record))}
      </strong>
      <span className="lp-wchips">
        <StatusBadge ok={status.document} label="Doc" />
        {tone !== "liability" ? (
          <StatusBadge ok={status.nominee} label="Nominee" />
        ) : null}
        <StatusBadge
          ok={status.access}
          label={tone === "liability" ? "Closure" : "Access"}
        />
      </span>
      <ChevronRight size={14} className="lp-wealth-chevron" />
    </button>
  );
}
export function StatusBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <em className={`lp-wealth-status ${ok ? "ok" : "bad"}`}>
      {ok ? "✓" : "×"} {label}
    </em>
  );
}
