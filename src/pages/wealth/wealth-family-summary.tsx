import { Download, FileText, Printer, X } from "lucide-react";

import type { WealthRecord } from "@/lib/api";
import { dashboardStats, money, recordAmount, recordHomeAmount, recordMoney, statusFor } from "./wealth-view";

type Stats = ReturnType<typeof dashboardStats>;

export function FamilySummaryDialog({ records, stats, onClose }: { records: WealthRecord[]; stats: Stats; onClose: () => void }) {
  const html = buildFamilySummary(records, stats);
  const exportHtml = () => {
    const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "Family_Summary.html";
    link.click();
    URL.revokeObjectURL(url);
  };
  const printHtml = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 250);
  };
  return (
    <div className="lp-family-summary-backdrop" onClick={onClose}>
      <div className="lp-family-summary-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <div className="lp-family-summary-head">
          <div>
            <span>What your family would need</span>
            <b>Family summary</b>
          </div>
          <button type="button" onClick={onClose} aria-label="Close"><X size={16} /></button>
        </div>
        <iframe className="lp-family-summary-preview" title="Family summary preview" srcDoc={html} />
        <div className="lp-family-summary-actions">
          <button type="button" className="primary" onClick={printHtml}><Printer size={16} /> Save as PDF</button>
          <button type="button" onClick={exportHtml}><Download size={16} /> Export</button>
        </div>
      </div>
    </div>
  );
}

function buildFamilySummary(records: WealthRecord[], stats: Stats) {
  const assets = stats.assets;
  const loans = stats.liabilities;
  const insurance = stats.protection;
  const moneyBetweenPeople = stats.lentBorrowed.filter((record) => !record.details.followUpDone);
  const sum = (items: WealthRecord[]) => items.reduce((total, record) => total + recordHomeAmount(record), 0);
  const net = sum(assets) - sum(loans);
  const th = (text: string) => `<th>${esc(text)}</th>`;
  const holdingRows = (items: WealthRecord[], showNominee: boolean) =>
    items.map((record) => {
      const details = record.details;
      const institution = text(details.provider || details.institution || details.party || details.location);
      const identifier = text(details.accountRef || details.accountNumber || details.policyNumber || details.reference || details.loanAccountNumber);
      const nominee = details.nominee ? text(details.nomineeName || "named") : "NOT NAMED";
      const doc = record.attachments[0]?.title || record.attachments[0]?.originalName || (statusFor(record).document ? "attached" : "NOT ATTACHED");
      const access = text(details.accessInstruction || record.notes || "—");
      return `<tr><td><b>${esc(record.title)}</b></td><td>${esc(text(details.assetType || details.loanType || details.insuranceType || record.type))}</td><td>${esc([institution, identifier].filter(Boolean).join(" "))}</td><td>${esc(recordMoney(record, recordAmount(record)))}</td>${showNominee ? `<td class="${details.nominee ? "" : "bad"}">${esc(nominee)}</td>` : ""}<td class="${statusFor(record).document ? "" : "bad"}">${esc(doc)}</td><td>${esc(access)}</td></tr>`;
    }).join("");
  const section = (title: string, items: WealthRecord[], showNominee: boolean) =>
    `<h3>${esc(title)}</h3><table><tr>${th("Holding")}${th("Type")}${th("Where")}${th("Value")}${showNominee ? th("Nominee") : ""}${th("Document")}${th("How to access")}</tr>${holdingRows(items, showNominee) || `<tr><td colspan="${showNominee ? 7 : 6}" class="muted">None recorded</td></tr>`}</table>`;
  const peopleRows = moneyBetweenPeople.map((record) => {
    const youOwe = record.type === "LOAN_TAKEN" || record.details.direction === "BORROWED" || record.details.direction === "received";
    const who = text(record.details.who || record.details.party || record.details.paidTo || record.details.receivedFrom || "—");
    const evidence = record.attachments[0]?.title || record.attachments[0]?.originalName || (record.details.proofStatus === "cash_no_record" ? "No proof acknowledged" : "NONE");
    return `<tr><td><b>${esc(who)}</b></td><td>${esc(record.title)}</td><td>${esc(recordMoney(record, recordAmount(record)))}</td><td>${youOwe ? "the family owes" : "owed to the family"}</td><td class="${record.attachments.length || record.details.proofStatus === "cash_no_record" ? "" : "bad"}">${esc(evidence)}</td></tr>`;
  }).join("");
  return `<!doctype html><html><head><meta charset="utf-8"><title>Family Summary</title><style>body{font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;color:#111827;max-width:760px;margin:20px auto;padding:0 20px;background:#fff}.top{display:flex;justify-content:space-between;gap:16px;align-items:center;border-bottom:3px solid #d8b25a;padding-bottom:12px}.brand{font-weight:800;font-size:20px}.muted{color:#6b7280}.metrics{display:flex;gap:26px;margin-top:16px;flex-wrap:wrap}.metric span{display:block;font-size:12px;color:#6b7280}.metric b{font-size:18px}.metric:first-child b{font-size:22px}h3{margin:18px 0 6px;font-size:14px}table{width:100%;border-collapse:collapse;font-size:12.5px}th{text-align:left;padding:6px 10px;font-size:12px;color:#6b7280;background:#f3f4f6}td{padding:6px 10px;border-bottom:1px solid #eef0f3;vertical-align:top}.bad{color:#b91c1c;font-weight:700}ol{margin:0;padding-left:18px;line-height:1.8;color:#374151;font-size:13px}.foot{margin-top:22px;font-size:12px;color:#6b7280;border-top:1px solid #e5e7eb;padding-top:10px}</style></head><body><div class="top"><div><div class="brand">ReadiNes · Family Summary</div><div class="muted" style="font-size:13px">What your family would need to find and claim everything</div></div><div class="muted" style="text-align:right;font-size:12px">Prepared ${esc(new Date().toLocaleString())}</div></div><div class="metrics"><div class="metric"><span>Net worth (documented)</span><b>${esc(money(net))}</b></div><div class="metric"><span>Assets</span><b>${esc(money(sum(assets)))}</b></div><div class="metric"><span>Liabilities</span><b>${esc(money(sum(loans)))}</b></div><div class="metric"><span>Protection</span><b>${esc(money(sum(insurance)))}</b></div></div>${section("Accounts and investments", assets, true)}${section("Loans", loans, false)}${section("Insurance", insurance, true)}<h3>Money between people</h3><table><tr>${th("Who")}${th("What for")}${th("Amount")}${th("Direction")}${th("Evidence")}</tr>${peopleRows || '<tr><td colspan="5" class="muted">None recorded</td></tr>'}</table><h3>If something happens: first steps for the family</h3><ol><li>Use this summary to identify records with missing documents, nominees, or access instructions.</li><li>Contact each institution listed above with identity proof, death certificate where applicable, and the account references available in your records.</li><li>Attached proof coverage: ${records.filter((record) => statusFor(record).document).length} of ${records.length} records.</li>${loans.length ? `<li>Outstanding liabilities to settle or transfer: ${esc(loans.map((loan) => loan.title).join(", "))}</li>` : ""}</ol><p class="foot">Prepared by ReadiNes from your own records. Account references may be partial. This is an organizational summary, not a will, and not legal, tax, or financial advice.</p></body></html>`;
}

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function esc(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] ?? char);
}
