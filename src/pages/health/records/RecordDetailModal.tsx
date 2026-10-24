import { Text, Heading, ModalBackdrop, ModalPanel, Button } from "@/design-system";

import { useEffect, useState } from "react";
import { ExternalLink, FileText, ShieldCheck, X } from "lucide-react";
import { api, type DocumentRecord } from "@/lib/api";
import type {
  HealthMember,
  HealthMeasurement,
  HealthRecordDetail,
} from "@/lib/api.types";
import { documentTypeLabels, formatDate, valueWithUnit } from "../healthUtils";

function RecordDetailModal({
  record,
  member,
  onClose,
  onCorrectDetails,
  onViewOriginal,
}: {
  record: HealthRecordDetail | null;
  member: HealthMember | null;
  onClose: () => void;
  onCorrectDetails: (record: HealthRecordDetail) => void;
  onViewOriginal: (documentId: string) => void;
}) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);

  return (
    <ModalBackdrop

      style={{ zIndex: "var(--layer-detailDialog)" }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <ModalPanel onDismiss={onClose}
        className="lp-health-record-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Health record document"
      >
        {record ? (
          <HealthRecordDocumentViewer
            record={record}
            member={member}
            onClose={onClose}
            onCorrectDetails={() => onCorrectDetails(record)}
            onViewOriginal={() => onViewOriginal(record.documentId)}
          />
        ) : (
          <Text as="div" size="md" weight="semibold" className="lp-health-document-loading">
            Loading health record...
          </Text>
        )}
      </ModalPanel>
    </ModalBackdrop>
  );
}

export default RecordDetailModal;

function HealthRecordDocumentViewer({
  record,
  member,
  onClose,
  onCorrectDetails,
  onViewOriginal,
}: {
  record: HealthRecordDetail;
  member: HealthMember | null;
  onClose: () => void;
  onCorrectDetails: () => void;
  onViewOriginal: () => void;
}) {
  const [documentRecord, setDocumentRecord] = useState<DocumentRecord | null>(
    null,
  );

  useEffect(() => {
    let active = true;
    setDocumentRecord(null);
    void api.documents
      .getById(record.documentId)
      .then((document) => {
        if (active) setDocumentRecord(document);
      })
      .catch(() => {
        if (active) setDocumentRecord(null);
      });
    return () => {
      active = false;
    };
  }, [record.documentId]);

  const title = documentTypeLabels[record.type] ?? record.type;
  const sourceLabel = documentRecord
    ? sourceCopy(documentRecord.source)
    : "Upload";
  const categoryLabel = documentRecord?.category || "Medical";
  const statusLabel = documentRecord
    ? documentRecord.source === "GOOGLE_DRIVE"
      ? "Secured from Google Drive"
      : `Encrypted in Readines · ${sourceLabel}`
    : "Encrypted in Readines";

  return (
    <>
      <header className="lp-health-document-head">
        <div className="lp-health-document-title">
          <span className="lp-health-document-icon" aria-hidden="true">
            <FileText aria-hidden="true" focusable="false" size={17} />
          </span>
          <span>
            <Text as="b" size="md" weight="semibold">{title}</Text>
            <Text as="small" size="sm" weight="semibold">
              {sourceLabel} · {categoryLabel}
            </Text>
          </span>
        </div>
        <Button size="sm" iconOnly variant="tertiary"
          type="button"
          onClick={onClose}
          aria-label="Close document viewer"
        >
          <X aria-hidden="true" focusable="false" size={17} />
        </Button>
      </header>
      <main className="lp-health-document-stage">
        <article className="lp-health-document-paper">
          <StructuredDocument
            record={record}
            member={member}
            documentRecord={documentRecord}
          />
        </article>
      </main>
      <footer className="lp-health-document-footer">
        <Text size="sm" weight="semibold">
          <ShieldCheck size={14} aria-hidden="true" />
          {statusLabel}
        </Text>
        <div className="lp-health-document-actions">
          <Button size="sm" variant="secondary" type="button" onClick={onViewOriginal}>
            <ExternalLink aria-hidden="true" focusable="false" size={14} />
            View original
          </Button>
          <Button size="sm" variant="primary" type="button" onClick={onCorrectDetails}>
            Correct details
          </Button>
        </div>
      </footer>
    </>
  );
}

function StructuredDocument({
  record,
  member,
  documentRecord,
}: {
  record: HealthRecordDetail;
  member: HealthMember | null;
  documentRecord: DocumentRecord | null;
}) {
  if (record.type === "prescription")
    return (
      <PrescriptionDocument
        record={record}
        member={member}
        documentRecord={documentRecord}
      />
    );
  if (record.type === "medical_report")
    return (
      <MedicalReportDocument
        record={record}
        member={member}
        documentRecord={documentRecord}
      />
    );
  return (
    <LabReportDocument
      record={record}
      member={member}
      documentRecord={documentRecord}
    />
  );
}

function LabReportDocument({
  record,
  member,
  documentRecord,
}: {
  record: HealthRecordDetail;
  member: HealthMember | null;
  documentRecord: DocumentRecord | null;
}) {
  return (
    <>
      <DocumentTopline
        title="LABORATORY REPORT"
        provider={record.provider}
        doctor={record.doctor}
      />
      <DocumentMeta
        rows={[
          ["Patient", member?.name ?? "—"],
          ["Collected", documentDate(record.documentDate)],
          ["Report ID", reportIdentifier(documentRecord)],
        ]}
      />
      <table className="lp-health-report-table">
        <thead>
          <tr>
            <Text as="th" size="sm" weight="semibold">Test</Text>
            <Text as="th" size="sm" weight="semibold">Result</Text>
            <Text as="th" size="sm" weight="semibold">Reference</Text>
            <Text as="th" size="sm" weight="semibold">Date</Text>
          </tr>
        </thead>
        <tbody>
          {record.measurements.length ? (
            record.measurements.map((measurement) => (
              <tr key={measurement.id}>
                <Text as="td" size="md">{measurement.displayName || measurement.originalName}</Text>
                <Text as="td" size="md">
                  <strong>{valueWithUnit(measurement)}</strong>
                </Text>
                <Text as="td" size="md">{referenceText(measurement)}</Text>
                <Text as="td" size="md">{documentDate(measurement.measuredAt ?? record.documentDate)}</Text>
              </tr>
            ))
          ) : (
            <tr>
              <Text as="td" size="md" colSpan={4} className="empty">
                No measurements were extracted from this report.
              </Text>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}

function PrescriptionDocument({
  record,
  member,
  documentRecord,
}: {
  record: HealthRecordDetail;
  member: HealthMember | null;
  documentRecord: DocumentRecord | null;
}) {
  return (
    <>
      <DocumentTopline
        title="PRESCRIPTION"
        provider={record.provider}
        doctor={record.doctor}
      />
      <DocumentMeta
        rows={[
          ["Patient", member?.name ?? "—"],
          ["Date", documentDate(record.documentDate)],
          ["Document ID", reportIdentifier(documentRecord)],
        ]}
      />
      <table className="lp-health-report-table prescription">
        <thead>
          <tr>
            <Text as="th" size="sm" weight="semibold">Medicine</Text>
            <Text as="th" size="sm" weight="semibold">Dose</Text>
            <Text as="th" size="sm" weight="semibold">Frequency</Text>
            <Text as="th" size="sm" weight="semibold">Duration / Instructions</Text>
          </tr>
        </thead>
        <tbody>
          {record.medications.length ? (
            record.medications.map((medication) => (
              <tr key={medication.id}>
                <Text as="td" size="md">
                  <strong>{medication.name}</strong>
                </Text>
                <Text as="td" size="md">{cleanValue(medication.dose)}</Text>
                <Text as="td" size="md">{cleanValue(medication.frequency)}</Text>
                <Text as="td" size="md">
                  {[medication.duration, medication.quantity]
                    .map(cleanValue)
                    .filter((value) => value !== "—")
                    .join(" · ") || "—"}
                </Text>
              </tr>
            ))
          ) : (
            <tr>
              <Text as="td" size="md" colSpan={4} className="empty">
                No medications were extracted from this prescription.
              </Text>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}

function MedicalReportDocument({
  record,
  member,
  documentRecord,
}: {
  record: HealthRecordDetail;
  member: HealthMember | null;
  documentRecord: DocumentRecord | null;
}) {
  return (
    <>
      <DocumentTopline
        title="MEDICAL REPORT"
        provider={record.provider}
        doctor={record.doctor}
      />
      <DocumentMeta
        rows={[
          ["Patient", member?.name ?? "—"],
          ["Date", documentDate(record.documentDate)],
          ["Report ID", reportIdentifier(documentRecord)],
        ]}
      />
      {record.measurements.length ? (
        <table className="lp-health-report-table">
          <thead>
            <tr>
              <Text as="th" size="sm" weight="semibold">Finding</Text>
              <Text as="th" size="sm" weight="semibold">Result</Text>
              <Text as="th" size="sm" weight="semibold">Reference</Text>
              <Text as="th" size="sm" weight="semibold">Date</Text>
            </tr>
          </thead>
          <tbody>
            {record.measurements.map((measurement) => (
              <tr key={measurement.id}>
                <Text as="td" size="md">{measurement.displayName || measurement.originalName}</Text>
                <Text as="td" size="md">
                  <strong>{valueWithUnit(measurement)}</strong>
                </Text>
                <Text as="td" size="md">{referenceText(measurement)}</Text>
                <Text as="td" size="md">{documentDate(measurement.measuredAt ?? record.documentDate)}</Text>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <Text as="div" size="md" weight="semibold" className="lp-health-document-note">
          No structured findings were extracted from this report.
        </Text>
      )}
      {record.followUps.length ? (
        <section className="lp-health-document-section">
          <Heading level={4} size="sm">Follow-ups</Heading>
          {record.followUps.map((followUp) => (
            <Text as="p" size="sm" key={followUp.id}>
              <b>{followUp.title}</b>
              <span>{documentDate(followUp.dueDate ?? followUp.explicitDate)}</span>
            </Text>
          ))}
        </section>
      ) : null}
    </>
  );
}

function DocumentTopline({
  title,
  provider,
  doctor,
}: {
  title: string;
  provider?: string | null;
  doctor?: string | null;
}) {
  return (
    <>
      <div className="lp-health-document-topline">
        <Heading level={3} size="sm">{title}</Heading>
        <Text size="sm" weight="medium">{provider || doctor || "—"}</Text>
      </div>
      <div className="lp-health-document-accent" />
    </>
  );
}

function DocumentMeta({ rows }: { rows: Array<[string, string]> }) {
  return (
    <dl className="lp-health-document-meta">
      {rows.map(([label, value]) => (
        <div key={label}>
          <Text as="dt" size="sm" weight="medium">{label}</Text>
          <Text as="dd" size="md" weight="semibold">{cleanValue(value)}</Text>
        </div>
      ))}
    </dl>
  );
}

function referenceText(measurement: HealthMeasurement) {
  if (measurement.referenceText) return measurement.referenceText;
  if (
    typeof measurement.referenceMin === "number" &&
    typeof measurement.referenceMax === "number"
  )
    return `${measurement.referenceMin}–${measurement.referenceMax}`;
  if (typeof measurement.referenceMin === "number")
    return `> ${measurement.referenceMin}`;
  if (typeof measurement.referenceMax === "number")
    return `< ${measurement.referenceMax}`;
  return "—";
}

function documentDate(value: string | null | undefined) {
  return value ? formatDate(value) : "—";
}

function reportIdentifier(documentRecord: DocumentRecord | null) {
  return firstPresent(
    documentRecord?.uniqueIdentifier,
    documentRecord?.displayName,
    documentRecord?.title,
  );
}

function cleanValue(value: string | null | undefined) {
  const text = value?.trim();
  return text || "—";
}

function firstPresent(...values: Array<string | null | undefined>) {
  return values.map((value) => value?.trim()).find(Boolean) || "—";
}

function sourceCopy(source: DocumentRecord["source"]) {
  if (source === "GMAIL") return "Gmail";
  if (source === "GOOGLE_DRIVE") return "Google Drive";
  return "Upload";
}
