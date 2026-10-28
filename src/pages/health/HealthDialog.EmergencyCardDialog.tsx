import { Heading, Text, ModalPanel, ModalBackdrop, Button } from "@/design-system";
import { useEffect, useState } from "react";
import { Download, FileText, X } from "lucide-react";
import UploadDocumentModal from "@/components/UploadDocumentModal";
import { api } from "@/lib/api";
import type { DocumentRecord, HealthMember, HealthRecord } from "@/lib/api.types";
import { InsuranceDocumentPreview } from "./HealthDialog.InsuranceDocumentPreview";
import { findInsuranceDocument, known, medicineSummary, preferredHospital, contactSummary, exportEmergencyCardPdf, buildEmergencyCardHtml } from "./HealthDialog.buildVisitContexts";


export function EmergencyCardDialog({
  member,
  records,
  onClose,
}: {
  member: HealthMember;
  records: HealthRecord[];
  onClose: () => void;
}) {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  useEffect(() => {
    let active = true;
    void api.documents.list().then((items) => {
      if (active) setDocuments(items);
    });
    return () => {
      active = false;
    };
  }, []);
  const insuranceDoc = findInsuranceDocument(records, documents);
  const generatedDate = new Date().toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const rows = [
    ["Name", member.name],
    ["Blood group", known(member.bloodGroup)],
    ["Critical allergies", member.allergies || "NOT ANSWERED"],
    ["Conditions", member.conditions || "NOT ANSWERED"],
    ["Current meds", medicineSummary(records)],
    ["Primary physician", member.primaryDoctor || "NOT ANSWERED"],
    ["Preferred hospital", preferredHospital(records) || "NOT ANSWERED"],
    ["Emergency contact", contactSummary(member) || "-"],
    [
      "Insurance",
      insuranceDoc
        ? insuranceDoc.title || insuranceDoc.originalName
        : member.insuranceProvider || "NOT ANSWERED",
    ],
    ["Medical documents", `${records.length} on file in Readines`],
  ];
  return (
    <ModalBackdrop className="lp-card-preview-backdrop">
      <ModalPanel onDismiss={onClose}
        className="lp-card-preview-dialog lp-emergency-card-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="emergency-card-title"
      >
        <header className="lp-card-preview-head">
          <div>
            <Text as="p" size="sm" weight="semibold">One tap · assembled from your archive</Text>
            <Heading level={2} size="md" id="emergency-card-title">Emergency card</Heading>
          </div>
          <Button size="sm" iconOnly variant="tertiary" type="button" onClick={onClose} aria-label="Close">
            <X aria-hidden="true" focusable="false" size="var(--icon-medium)" />
          </Button>
        </header>
        <section className="lp-emergency-card-paper">
          <div className="lp-emergency-card-band">
            <Text as="b" size="md" weight="semibold">Emergency info</Text>
            <Text size="sm" weight="semibold">Readines</Text>
          </div>
          <dl>
            {rows.map(([label, value]) => (
              <div key={label}>
                <Text as="dt" size="sm">{label}</Text>
                <Text as="dd" size="md" weight="semibold">{value}</Text>
              </div>
            ))}
          </dl>
          <footer>
            <Text size="md">Assembled facts only · no diagnosis.</Text>
            <Text size="md">
              Generated{" "}
              {new Date().toLocaleDateString(undefined, {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </Text>
          </footer>
        </section>
        <div className="lp-card-preview-actions">
          <Button variant="secondary"
            type="button"
            onClick={() =>
              exportEmergencyCardPdf(buildEmergencyCardHtml(rows, generatedDate))
            }
          >
            <Download aria-hidden="true" focusable="false" size="var(--icon-small)" /> Export as PDF
          </Button>
        </div>
      </ModalPanel>
    </ModalBackdrop>
  );
}


export function InsuranceCardDialog({
  records,
  onClose,
}: {
  records: HealthRecord[];
  onClose: () => void;
}) {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [uploading, setUploading] = useState(false);
  useEffect(() => {
    let active = true;
    void api.documents.list().then((items) => {
      if (active) setDocuments(items);
    });
    return () => {
      active = false;
    };
  }, []);
  const insuranceDoc = findInsuranceDocument(records, documents);
  return (
    <ModalBackdrop className="lp-card-preview-backdrop">
      <ModalPanel onDismiss={onClose}
        className="lp-card-preview-dialog lp-insurance-card-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="insurance-card-title"
      >
        <header className="lp-insurance-card-head">
          <span>
            <FileText aria-hidden="true" focusable="false" size={22} />
          </span>
          <div>
            <Heading level={2} size="sm" id="insurance-card-title">Insurance Card</Heading>
            <Text as="p" size="md">{insuranceDoc ? insuranceDoc.title || insuranceDoc.originalName : "No insurance document added"}</Text>
          </div>
          <Button size="sm" iconOnly variant="tertiary" type="button" onClick={onClose} aria-label="Close">
            <X aria-hidden="true" focusable="false" size={22} />
          </Button>
        </header>
        {insuranceDoc ? (
          <InsuranceDocumentPreview document={insuranceDoc} />
        ) : (
          <section className="lp-insurance-empty">
            <div>
              <Text as="b" size="lg" weight="semibold">No insurance document added</Text>
              <Text as="p" size="md">Add your insurance document so it is available in an emergency.</Text>
            </div>
            <Button variant="primary" type="button" onClick={() => setUploading(true)}>
              Add insurance document
            </Button>
          </section>
        )}
        {uploading ? (
          <UploadDocumentModal
            open
            onClose={() => setUploading(false)}
            onSaved={(document) => {
              setDocuments((items) => [
                document,
                ...items.filter((item) => item.id !== document.id),
              ]);
            }}
          />
        ) : null}
      </ModalPanel>
    </ModalBackdrop>
  );
}
