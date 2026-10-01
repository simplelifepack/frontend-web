import { ChevronRight, Coins, Link2, ShieldAlert, Wallet } from "lucide-react";

import Card from "@/components/Card";
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
    <Card className="lp-wealth-summary-card lp-readystrip-card">
      <div className="lp-readystrip">
        <span className="lp-es-label">
          <Link2 size={15} />
          <b>Family access readiness</b>
        </span>
        <span className="lp-wealth-score">{stats.readiness}%</span>
        <span className="lp-wealth-progress">
          <i style={{ width: `${stats.readiness}%` }} />
        </span>
        <span className="lp-wealth-gaps">
          <span>{records.length} docs</span>
          <span>{gaps} access missing</span>
        </span>
        <button className="lp-wealth-how" type="button" onClick={onMath}>
          {showMath ? "Hide" : "How?"}
        </button>
        <button type="button" className="lp-wealth-debt-link" onClick={onLent} title="Lent and borrowed" aria-label="Lent and borrowed">
          <Coins size={14} />
          <span>Owed to you <b>{money(owedToYou)}</b></span>
          <span>·</span>
          <span>You owe <b>{money(youOwe)}</b></span>
          <ChevronRight size={14} />
        </button>
        <div className="lp-wealth-sos-action">
          <span className="lp-vdiv" />
          <div className="lp-wealth-summary-actions">
            <button type="button" className="danger" onClick={onSos}>
              <ShieldAlert size={15} /> SOS handoff
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function ReadinessMath({ records }: { records: WealthRecord[] }) {
  return (
    <Card style={{ marginBottom: 14 }}>
      <p className="lp-wealth-math-copy">
        Readiness counts each record once for proof and once for access
        instructions. Nominees stay visible on rows, but are not folded into
        this score yet.
      </p>
      {records.slice(0, 6).map((record) => {
        const status = statusFor(record);
        return (
          <div key={record.id} className="lp-wealth-math-row">
            <span>{record.title}</span>
            <b>
              {status.document ? "proof" : "no proof"} ·{" "}
              {status.access ? "access" : "no access"}
            </b>
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
      style={{ textAlign: "center", padding: "26px 20px", marginBottom: 16 }}
    >
      <span className="lp-wealth-empty-icon">
        <Wallet size={22} />
      </span>
      <div className="lp-wealth-empty-title">
        {query ? "No matching records" : "Nothing recorded yet"}
      </div>
      <p>
        {query
          ? "Try another search term, or capture proof for a new account, policy, loan, or payment."
          : "Capture an account, a policy, a loan, or informal money proof so your family can find it later."}
      </p>
      <button
        type="button"
        className="lp-wealth-summary-primary"
        onClick={onCapture}
      >
        Capture proof
      </button>
    </Card>
  );
}
