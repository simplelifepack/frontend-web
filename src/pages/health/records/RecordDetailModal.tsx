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
    <div
      className="lp-modal-backdrop"
      style={{ zIndex: 95 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="lp-modal-panel lp-health-record-modal"
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
          <div className="lp-health-document-loading">
            Loading health record...
          </div>
        )}
      </div>
    </div>
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
      : `Encrypted in Readiness · ${sourceLabel}`
    : "Encrypted in Readiness";

  return (
    <>
      <header className="lp-health-document-head">
        <div className="lp-health-document-title">
          <span className="lp-health-document-icon" aria-hidden="true">
            <FileText size={17} />
          </span>
          <span>
            <b>{title}</b>
            <small>
              {sourceLabel} · {categoryLabel}
            </small>
          </span>
        </div>
        <button
          type="button"
          className="lp-health-document-close"
          onClick={onClose}
          aria-label="Close document viewer"
        >
          <X size={17} />
        </button>
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
        <span>
          <ShieldCheck size={14} aria-hidden="true" />
          {statusLabel}
        </span>
        <div className="lp-health-document-actions">
          <button type="button" onClick={onViewOriginal}>
            <ExternalLink size={14} />
            View original
          </button>
          <button type="button" className="primary" onClick={onCorrectDetails}>
            Correct details
          </button>
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
            <th>Test</th>
            <th>Result</th>
            <th>Reference</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {record.measurements.length ? (
            record.measurements.map((measurement) => (
              <tr key={measurement.id}>
                <td>{measurement.displayName || measurement.originalName}</td>
                <td>
                  <strong>{valueWithUnit(measurement)}</strong>
                </td>
                <td>{referenceText(measurement)}</td>
                <td>{documentDate(measurement.measuredAt ?? record.documentDate)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="empty">
                No measurements were extracted from this report.
              </td>
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
            <th>Medicine</th>
            <th>Dose</th>
            <th>Frequency</th>
            <th>Duration / Instructions</th>
          </tr>
        </thead>
        <tbody>
          {record.medications.length ? (
            record.medications.map((medication) => (
              <tr key={medication.id}>
                <td>
                  <strong>{medication.name}</strong>
                </td>
                <td>{cleanValue(medication.dose)}</td>
                <td>{cleanValue(medication.frequency)}</td>
                <td>
                  {[medication.duration, medication.quantity]
                    .map(cleanValue)
                    .filter((value) => value !== "—")
                    .join(" · ") || "—"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="empty">
                No medications were extracted from this prescription.
              </td>
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
              <th>Finding</th>
              <th>Result</th>
              <th>Reference</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {record.measurements.map((measurement) => (
              <tr key={measurement.id}>
                <td>{measurement.displayName || measurement.originalName}</td>
                <td>
                  <strong>{valueWithUnit(measurement)}</strong>
                </td>
                <td>{referenceText(measurement)}</td>
                <td>{documentDate(measurement.measuredAt ?? record.documentDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="lp-health-document-note">
          No structured findings were extracted from this report.
        </div>
      )}
      {record.followUps.length ? (
        <section className="lp-health-document-section">
          <h4>Follow-ups</h4>
          {record.followUps.map((followUp) => (
            <p key={followUp.id}>
              <b>{followUp.title}</b>
              <span>{documentDate(followUp.dueDate ?? followUp.explicitDate)}</span>
            </p>
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
        <h3>{title}</h3>
        <span>{provider || doctor || "—"}</span>
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
          <dt>{label}</dt>
          <dd>{cleanValue(value)}</dd>
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
