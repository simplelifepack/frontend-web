import { Text, Heading } from "@/design-system";
import { type DocumentRecord } from "@/lib/api";
import type { HealthMember, HealthRecordDetail } from "@/lib/api.types";
import { valueWithUnit } from "../healthUtils";
import { DocumentMeta, documentDate, reportIdentifier, referenceText, cleanValue } from "./RecordDetailModal.DocumentMeta";


export function LabReportDocument({
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


export function PrescriptionDocument({
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


export function MedicalReportDocument({
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


export function DocumentTopline({
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
