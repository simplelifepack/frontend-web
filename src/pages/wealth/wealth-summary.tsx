import { Text, Button, Card } from "@/design-system";

import { ChevronRight, Coins, Link2, ShieldAlert, Wallet } from "lucide-react";

import type { WealthRecord } from "@/lib/api";
import { classifyWealthRecord, dashboardStats, money, recordHomeAmount, statusFor } from "./wealth-view";

export function Readiness({
  stats,
  records,
  showMath,
  onMath,
  onSos,
  onLent,
}: {
  stats: ReturnType<typeof dashboardStats>;
  records: WealthRecord[];
  showMath: boolean;
  onMath: () => void;
  onSos: () => void;
  onLent: () => void;
}) {
  const gaps = stats.accessMissing;
  const owedToYou = records
    .filter(
      (record) =>
        classifyWealthRecord(record) === "lentBorrowed" &&
        record.details.direction !== "BORROWED" &&
        record.details.direction !== "received",
    )
    .reduce((total, record) => total + recordHomeAmount(record), 0);
  const youOwe = records
    .filter(
      (record) =>
        classifyWealthRecord(record) === "lentBorrowed" &&
        (record.type === "LOAN_TAKEN" ||
        record.details.direction === "BORROWED" ||
        record.details.direction === "received"),
    )
    .reduce((total, record) => total + recordHomeAmount(record), 0);
  return (
    <Card flush className="lp-wealth-summary-card lp-readystrip-card">
      <div className="lp-readystrip">
        <span className="lp-es-label">
          <Link2 aria-hidden="true" focusable="false" size={15} />
          <Text as="b" size="md" weight="semibold">Family access readiness</Text>
        </span>
        <Text size="lg" weight="semibold" className="lp-wealth-score">{stats.readiness}%</Text>
        <span className="lp-wealth-progress">
          <i style={{ width: `${stats.readiness}%` }} />
        </span>
        <span className="lp-wealth-gaps">
          <Text size="md">{records.length} docs</Text>
          <Text size="md">{gaps} access missing</Text>
        </span>
        <Button size="sm" variant="tertiary" type="button" onClick={onMath}>
          {showMath ? "Hide" : "How?"}
        </Button>
        <button type="button" className="lp-wealth-debt-link" onClick={onLent} title="Lent and borrowed" aria-label="Lent and borrowed">
          <Coins aria-hidden="true" focusable="false" size={14} />
          <span>Owed to you <b>{money(owedToYou)}</b></span>
          <span>·</span>
          <span>You owe <b>{money(youOwe)}</b></span>
          <ChevronRight aria-hidden="true" focusable="false" size={14} />
        </button>
        <div className="lp-wealth-sos-action">
          <span className="lp-vdiv" />
          <div className="lp-wealth-summary-actions">
            <Button variant="tertiary" type="button" onClick={onSos}>
              <ShieldAlert aria-hidden="true" focusable="false" size={15} /> SOS handoff
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function ReadinessMath({ records }: { records: WealthRecord[] }) {
  return (
    <Card style={{ marginBottom: "var(--space-s14)" }}>
      <Text as="p" size="sm" className="lp-wealth-math-copy">
        Readiness counts each record once for proof and once for access
        instructions. Nominees stay visible on rows, but are not folded into
        this score yet.
      </Text>
      {records.slice(0, 6).map((record) => {
        const status = statusFor(record);
        return (
          <div key={record.id} className="lp-wealth-math-row">
            <Text size="md">{record.title}</Text>
            <Text as="b" size="md" weight="semibold">
              {status.document ? "proof" : "no proof"} ·{" "}
              {status.access ? "access" : "no access"}
            </Text>
          </div>
        );
      })}
    </Card>
  );
}

export function EmptyWealth({
  query,
  onCapture,
}: {
  query: string;
  onCapture: () => void;
}) {
  return (
    <Card
      style={{ textAlign: "center", marginBottom: "var(--space-s16)" }}
    >
      <span className="lp-wealth-empty-icon">
        <Wallet aria-hidden="true" focusable="false" size={22} />
      </span>
      <Text as="div" size="md" weight="semibold" className="lp-wealth-empty-title">
        {query ? "No matching records" : "Nothing recorded yet"}
      </Text>
      <Text as="p" size="md">
        {query
          ? "Try another search term, or capture proof for a new account, policy, loan, or payment."
          : "Capture an account, a policy, a loan, or informal money proof so your family can find it later."}
      </Text>
      <Button variant="primary"
        type="button"
        onClick={onCapture}
      >
        Capture proof
      </Button>
    </Card>
  );
}
