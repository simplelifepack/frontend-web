import { lightColorTokens as colors } from "@/design-system/variables/colorTokens";
import { typography, interFontFaces, typographyVariables } from "@/design-system/variables/typography";
import type { DocumentRecord, HealthMember, HealthRecord } from "@/lib/api.types";
import { type VisitContext, type VisitDocument } from "./HealthDialog.HealthDialogKind";
import { humanRecordType } from "./HealthDialog.documentDetail";


export function buildVisitContexts(records: HealthRecord[]) {
  const contexts = new Map<string, VisitContext>();
  const add = (kind: VisitContext["kind"], label: string, recordId: string) => {
    const clean = label.trim();
    if (!clean) return;
    const id = `${kind}:${clean.toLocaleLowerCase()}`;
    const current = contexts.get(id) ?? {
      id,
      label: clean,
      kind,
      recordIds: [],
    };
    if (!current.recordIds.includes(recordId)) current.recordIds.push(recordId);
    contexts.set(id, current);
  };
  // Only persisted doctor fields describe a visit context. Follow-up titles are
  // extracted recommendations and must never be presented as a visit option.
  records.forEach((record) => {
    if (record.doctor) add("doctor", record.doctor, record.id);
    if (record.provider) add("provider", record.provider, record.id);
  });
  const recent = records
    .slice()
    .sort((a, b) =>
      String(b.documentDate || b.createdAt).localeCompare(
        String(a.documentDate || a.createdAt),
      ),
    )
    .slice(0, 8)
    .map((record) => record.id);
  if (recent.length) {
    contexts.set("recent:everything", {
      id: "recent:everything",
      label: "Everything recent",
      kind: "recent",
      recordIds: recent,
    });
  }
  return [...contexts.values()].sort(
    (a, b) => a.kind.localeCompare(b.kind) || a.label.localeCompare(b.label),
  );
}

export function findInsuranceDocument(records: HealthRecord[], documents: DocumentRecord[]) {
  const ids = new Set(records.map((record) => record.documentId));
  const healthRecordDocument = documents.find((document) => {
    if (!ids.has(document.id)) return false;
    return isInsuranceDocument(document);
  });
  if (healthRecordDocument) return healthRecordDocument;
  return documents.find(isInsuranceDocument);
}

export function isInsuranceDocument(document: DocumentRecord) {
  const text =
    `${document.category} ${document.documentType} ${document.normalizedType ?? ""}`.toLowerCase();
  return /insurance|policy/.test(text);
}

export function known(value: string | null | undefined) {
  return value && value !== "Unknown" ? value : "NOT ANSWERED";
}

export function contactSummary(member: HealthMember) {
  return [member.emergencyContactName, member.emergencyContactPhone]
    .filter(Boolean)
    .join(" · ");
}

export function medicineSummary(records: HealthRecord[]) {
  const total = records.reduce(
    (sum, record) => sum + record.medicationCount,
    0,
  );
  return total
    ? `${total} medication${total === 1 ? "" : "s"} on file`
    : "NOT ANSWERED";
}

export function preferredHospital(records: HealthRecord[]) {
  const provider = records.find((record) => record.provider)?.provider;
  return provider ?? "";
}

export function exportEmergencyCardPdf(html: string) {
  const popup = window.open("", "_blank");
  if (!popup) return;
  popup.document.write(html);
  popup.document.close();
  popup.focus();
  void Promise.all(Object.values(typography.weights).map((weight) =>
    popup.document.fonts.load(`${weight} ${typography.text.md} Inter`),
  )).catch(() => undefined).then(() => popup.print());
}

export function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char] ?? char,
  );
}

export function buildEmergencyCardHtml(rows: string[][], generatedDate: string) {
  const rowHtml = rows
    .map(
      ([label, value]) => `
        <div>
          <dt>${escapeHtml(label)}</dt>
          <dd>${escapeHtml(value)}</dd>
        </div>`,
    )
    .join("");
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Emergency card</title>
  <style>
    ${interFontFaces}
    ${typographyVariables}
    * { box-sizing: border-box; }
    body { margin: 0; padding: 24px; background: ${colors["surface-canvas"]}; color: ${colors["text-primary"]}; font-family: ${typography.family}; font-size: ${typography.text.md}; line-height: ${typography.lineHeights.body}; }
    .paper { max-width: 560px; margin: 0 auto; overflow: hidden; border: 1px solid ${colors["border-default"]}; border-radius: 10px; background: ${colors["surface-default"]}; }
    .band { display: flex; justify-content: space-between; align-items: center; padding: 18px 16px; background: ${colors["action-destructive-default"]}; color: ${colors["surface-default"]}; }
    .band b { font-size: var(--text-md); font-weight: var(--weight-bold); letter-spacing: 1px; text-transform: uppercase; }
    .band span { font-size: var(--text-sm); font-weight: var(--weight-bold); }
    dl { display: grid; margin: 0; padding: 8px 16px 12px; }
    dl div { display: grid; grid-template-columns: 124px minmax(0, 1fr); gap: 12px; padding: 9px 0; }
    dt { color: ${colors["text-secondary"]}; font-size: var(--text-sm); line-height: var(--line-body); }
    dd { margin: 0; color: ${colors["text-primary"]}; font-size: var(--text-md); font-weight: var(--weight-bold); line-height: var(--line-body); }
    footer { display: flex; justify-content: space-between; gap: 12px; padding: 12px 16px; border-top: 1px solid ${colors["border-default"]}; color: ${colors["text-secondary"]}; font-size: var(--text-sm); }
  </style>
</head>
<body>
  <section class="paper">
    <div class="band"><b>Emergency info</b><span>Readines</span></div>
    <dl>${rowHtml}</dl>
    <footer><span>Assembled facts only · no diagnosis.</span><span>Generated ${escapeHtml(generatedDate)}</span></footer>
  </section>
</body>
</html>`;
}

export function visitChooserGroups(
  contexts: VisitContext[],
  selectedId: string,
  query: string,
) {
  const needle = query.trim().toLowerCase();
  const order: Array<{ title: string; kind: VisitContext["kind"] }> = [
    { title: "Doctors", kind: "doctor" },
    { title: "Hospitals and labs", kind: "provider" },
    { title: "Everything recent", kind: "recent" },
  ];
  return order
    .map((group) => ({
      title: group.title,
      items: contexts
        .filter((context) => context.kind === group.kind)
        .filter(
          (context) => !needle || context.label.toLowerCase().includes(needle),
        )
        .sort((a, b) =>
          a.id === selectedId
            ? -1
            : b.id === selectedId
              ? 1
              : a.label.localeCompare(b.label),
        ),
    }))
    .filter((group) => group.items.length);
}

export function visitSummary(items: VisitDocument[]) {
  const dates = [
    ...new Set(items.map(visitDate).filter((date) => date !== "Undated")),
  ].sort();
  const visits = dates.length || (items.length ? 1 : 0);
  const range =
    dates.length > 1
      ? `${formatVisitDate(dates[0]!)} – ${formatVisitDate(dates[dates.length - 1]!)}`
      : dates.length
        ? formatVisitDate(dates[0]!)
        : "date unavailable";
  return `${items.length} ${items.length === 1 ? "document" : "documents"} from ${visits} ${visits === 1 ? "visit" : "visits"} · ${range}`;
}

export function visitAppointmentDate(items: VisitDocument[]) {
  const dates = items
    .map(visitDate)
    .filter((date) => date !== "Undated")
    .sort();
  return dates[dates.length - 1] ?? "";
}

export function visitDate(item: VisitDocument) {
  return item.record.documentDate || item.document?.documentDate || "Undated";
}

export function formatVisitDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value.slice(0, 10)}T00:00:00`));
}

export function documentLabel(item: VisitDocument) {
  return (
    item.document?.title ||
    item.document?.displayName ||
    humanRecordType(item.record.type)
  );
}
