import { Text, ModalBackdrop, ModalPanel, Button } from "@/design-system";
import { useEffect, useState } from "react";
import { ExternalLink, FileText, ShieldCheck, X } from "lucide-react";
import { api, type DocumentRecord } from "@/lib/api";
import type { HealthMember, HealthRecordDetail } from "@/lib/api.types";
import { documentTypeLabels } from "../healthUtils";
import { PrescriptionDocument, MedicalReportDocument, LabReportDocument } from "./RecordDetailModal.LabReportDocument";
import { sourceCopy } from "./RecordDetailModal.DocumentMeta";


export function RecordDetailModal({
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


export function HealthRecordDocumentViewer({
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


export function StructuredDocument({
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
