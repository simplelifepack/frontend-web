import { Heading, Text, ModalBackdrop, ModalPanel, Radio, SearchField, Button } from "@/design-system";

import UploadDocumentModal from "@/components/UploadDocumentModal";
import type { DocumentRecord } from "@/lib/api";
import { documentMatchesRequirement, type DerivedRequirement } from "@/readiness/calculatePackageReadiness";
import { Check, FileText, Loader2, Upload, X } from "lucide-react";
import { documentName } from "./pack-detail-panels";

type ChangeDocumentDialogProps = {
  assignmentError: string | null;
  busy: boolean;
  changing: DerivedRequirement;
  currentDocument: DocumentRecord | undefined;
  documentQuery: string;
  documentsForPicker: DocumentRecord[];
  selectedDocumentId: string;
  uploadOpen: boolean;
  warningDocument: DocumentRecord | null;
  onAssignOverride: (document: DocumentRecord) => void;
  onClearAssignment: () => void;
  onClose: () => void;
  onConfirmSelected: () => void;
  onDocumentQueryChange: (query: string) => void;
  onSelectedDocumentChange: (documentId: string) => void;
  onUploadClose: () => void;
  onUploadOpen: () => void;
  onUploaded: (document: DocumentRecord) => void;
  onWarningClear: () => void;
};

export default function ChangeDocumentDialog({
  assignmentError,
  busy,
  changing,
  currentDocument,
  documentQuery,
  documentsForPicker,
  selectedDocumentId,
  uploadOpen,
  warningDocument,
  onAssignOverride,
  onClearAssignment,
  onClose,
  onConfirmSelected,
  onDocumentQueryChange,
  onSelectedDocumentChange,
  onUploadClose,
  onUploadOpen,
  onUploaded,
  onWarningClear,
}: ChangeDocumentDialogProps) {
  return (
    <ModalBackdrop className="lp-pack-change-backdrop">
      <ModalPanel onDismiss={onClose} className="lp-pack-change-panel" role="dialog" aria-modal="true" aria-label="Change document">
        {!warningDocument ? (
          <DocumentPicker
            assignmentError={assignmentError}
            busy={busy}
            changing={changing}
            currentDocument={currentDocument}
            documentQuery={documentQuery}
            documentsForPicker={documentsForPicker}
            selectedDocumentId={selectedDocumentId}
            onClearAssignment={onClearAssignment}
            onClose={onClose}
            onConfirmSelected={onConfirmSelected}
            onDocumentQueryChange={onDocumentQueryChange}
            onSelectedDocumentChange={onSelectedDocumentChange}
            onUploadOpen={onUploadOpen}
          />
        ) : (
          <MismatchWarning
            assignmentError={assignmentError}
            busy={busy}
            changing={changing}
            warningDocument={warningDocument}
            onAssignOverride={onAssignOverride}
            onWarningClear={onWarningClear}
          />
        )}
      </ModalPanel>
      {uploadOpen ? <UploadDocumentModal open={uploadOpen} onClose={onUploadClose} onSaved={onUploaded} /> : null}
    </ModalBackdrop>
  );
}

function DocumentPicker(props: Omit<ChangeDocumentDialogProps, "onAssignOverride" | "onUploadClose" | "onUploaded" | "onWarningClear" | "uploadOpen" | "warningDocument">) {
  const otherDocuments = props.documentsForPicker.filter((document) => document.id !== props.currentDocument?.id);
  return (
    <>
      <div className="lp-pack-change-head">
        <div><Heading level={2} size="sm">Change document</Heading><Text as="p" size="md">{props.changing.title}</Text></div>
        <Button size="sm" iconOnly variant="tertiary" type="button" onClick={props.onClose} aria-label="Close change document"><X aria-hidden="true" focusable="false" size="var(--icon-small)" /></Button>
      </div>
      <div   className="lp-pack-change-section">
        <Text size="md">CURRENT</Text>
        {props.currentDocument ? (
          <Text as="label" size="md" className="lp-pack-document-option current">
            <Radio type="radio" checked={props.selectedDocumentId === props.currentDocument.id} onChange={() => props.onSelectedDocumentChange(props.currentDocument!.id)} />
            <Check aria-hidden="true" focusable="false" size={14} />
            <b>{documentName(props.currentDocument, props.changing.matchedDocument?.originalName)}</b>
          </Text>
        ) : <Text as="p" size="md">The selected document is no longer available.</Text>}
      </div>
      <div className="lp-pack-change-section">
        <Text size="md">OTHER DOCUMENTS</Text>
        <SearchField aria-label="Search your documents" value={props.documentQuery} onChange={(event) => props.onDocumentQueryChange(event.target.value)} placeholder="Search your documents" />
        {otherDocuments.length ? otherDocuments.map((document) => (
          <DocumentOption
            document={document}
            key={document.id}
            requirement={props.changing}
            selected={props.selectedDocumentId === document.id}
            onSelect={() => props.onSelectedDocumentChange(document.id)}
          />
        )) : <Text as="p" size="md">No documents match your search.</Text>}
      </div>
      {props.assignmentError ? <Text as="div" size="sm" className="lp-pack-assignment-error">{props.assignmentError}</Text> : null}
      <div className="lp-pack-change-actions">
        <Button variant="primary" type="button" onClick={props.onUploadOpen}><Upload aria-hidden="true" focusable="false" size={14} /> Upload new document</Button>
        {props.changing.assignmentSource !== "AUTO" ? <Button variant="secondary" type="button" disabled={props.busy} onClick={props.onClearAssignment}>Use automatic match</Button> : null}
        <Button variant="secondary" type="button" onClick={props.onClose}>Cancel</Button>
        <Button loading={props.busy} variant="primary" type="button" disabled={props.busy || !props.selectedDocumentId || props.selectedDocumentId === props.currentDocument?.id} onClick={props.onConfirmSelected}>
          {props.busy ? <Loader2 aria-hidden="true" focusable="false" size={14} className="lp-spin" /> : null}Confirm replacement
        </Button>
      </div>
    </>
  );
}

function DocumentOption({ document, requirement, selected, onSelect }: { document: DocumentRecord; requirement: DerivedRequirement; selected: boolean; onSelect: () => void }) {
  const eligible = documentMatchesRequirement(requirement, document);
  return (
    <Text as="label" size="md" className="lp-pack-document-option">
      <Radio type="radio" checked={selected} onChange={onSelect} />
      <FileText aria-hidden="true" focusable="false" size={14} />
      <b>{documentName(document)}{!eligible ? <small>May not match</small> : null}</b>
    </Text>
  );
}

function MismatchWarning({ assignmentError, busy, changing, warningDocument, onAssignOverride, onWarningClear }: Pick<ChangeDocumentDialogProps, "assignmentError" | "busy" | "changing" | "warningDocument" | "onAssignOverride" | "onWarningClear"> & { warningDocument: DocumentRecord }) {
  return (
    <>
      <div className="lp-pack-change-head"><div><Heading level={2} size="sm">This document may not match this requirement</Heading><Text as="p" size="md">{changing.title}</Text></div></div>
      <Text as="div" size="md" className="lp-pack-warning-copy">
        Readiness detected this document as <b>{warningDocument.normalizedType || warningDocument.documentType || "Unknown"}</b>, which doesn't appear to satisfy <b>{changing.title}</b>.
      </Text>
      {assignmentError ? <Text as="div" size="sm" className="lp-pack-assignment-error">{assignmentError}</Text> : null}
      <div className="lp-pack-change-actions">
        <Button variant="secondary" type="button" disabled={busy} onClick={onWarningClear}>Choose another document</Button>
        <Button loading={Boolean(busy)} variant="primary" type="button" disabled={busy} onClick={() => onAssignOverride(warningDocument)}>
          {busy ? <Loader2 aria-hidden="true" focusable="false" size={14} className="lp-spin" /> : null}Use anyway
        </Button>
      </div>
    </>
  );
}
