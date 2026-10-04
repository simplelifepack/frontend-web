import UploadDocumentModal from "@/components/UploadDocumentModal";
import type { DocumentRecord } from "@/lib/api";
import { documentMatchesRequirement, type DerivedRequirement } from "@/readiness/calculatePackageReadiness";
import { Check, FileText, Loader2, Search, Upload, X } from "lucide-react";
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
    <div className="lp-modal-backdrop lp-pack-change-backdrop">
      <div className="lp-modal-panel lp-pack-change-panel" role="dialog" aria-modal="true" aria-label="Change document">
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
      </div>
      {uploadOpen ? <UploadDocumentModal open={uploadOpen} onClose={onUploadClose} onSaved={onUploaded} /> : null}
    </div>
  );
}

function DocumentPicker(props: Omit<ChangeDocumentDialogProps, "onAssignOverride" | "onUploadClose" | "onUploaded" | "onWarningClear" | "uploadOpen" | "warningDocument">) {
  const otherDocuments = props.documentsForPicker.filter((document) => document.id !== props.currentDocument?.id);
  return (
    <>
      <div className="lp-pack-change-head">
        <div><h2>Change document</h2><p>{props.changing.title}</p></div>
        <button type="button" className="lp-pack-change-close" onClick={props.onClose} aria-label="Close change document"><X size={16} /></button>
      </div>
      <div className="lp-pack-change-section">
        <span>CURRENT</span>
        {props.currentDocument ? (
          <label className="lp-pack-document-option current">
            <input type="radio" checked={props.selectedDocumentId === props.currentDocument.id} onChange={() => props.onSelectedDocumentChange(props.currentDocument!.id)} />
            <Check size={14} />
            <b>{documentName(props.currentDocument, props.changing.matchedDocument?.originalName)}</b>
          </label>
        ) : <p>The selected document is no longer available.</p>}
      </div>
      <div className="lp-pack-change-section">
        <span>OTHER DOCUMENTS</span>
        <label className="lp-pack-document-search">
          <Search size={14} />
          <input value={props.documentQuery} onChange={(event) => props.onDocumentQueryChange(event.target.value)} placeholder="Search your documents" />
        </label>
        {otherDocuments.length ? otherDocuments.map((document) => (
          <DocumentOption
            document={document}
            key={document.id}
            requirement={props.changing}
            selected={props.selectedDocumentId === document.id}
            onSelect={() => props.onSelectedDocumentChange(document.id)}
          />
        )) : <p>No documents match your search.</p>}
      </div>
      {props.assignmentError ? <div className="lp-pack-assignment-error">{props.assignmentError}</div> : null}
      <div className="lp-pack-change-actions">
        <button type="button" className="lp-pack-upload-new" onClick={props.onUploadOpen}><Upload size={14} /> Upload new document</button>
        {props.changing.assignmentSource !== "AUTO" ? <button type="button" className="lp-pack-secondary-action" disabled={props.busy} onClick={props.onClearAssignment}>Use automatic match</button> : null}
        <button type="button" className="lp-pack-secondary-action" onClick={props.onClose}>Cancel</button>
        <button type="button" className="lp-pack-confirm-action" disabled={props.busy || !props.selectedDocumentId || props.selectedDocumentId === props.currentDocument?.id} onClick={props.onConfirmSelected}>
          {props.busy ? <Loader2 size={14} className="lp-spin" /> : null}Confirm replacement
        </button>
      </div>
    </>
  );
}

function DocumentOption({ document, requirement, selected, onSelect }: { document: DocumentRecord; requirement: DerivedRequirement; selected: boolean; onSelect: () => void }) {
  const eligible = documentMatchesRequirement(requirement, document);
  return (
    <label className="lp-pack-document-option">
      <input type="radio" checked={selected} onChange={onSelect} />
      <FileText size={14} />
      <b>{documentName(document)}{!eligible ? <small>May not match</small> : null}</b>
    </label>
  );
}

function MismatchWarning({ assignmentError, busy, changing, warningDocument, onAssignOverride, onWarningClear }: Pick<ChangeDocumentDialogProps, "assignmentError" | "busy" | "changing" | "warningDocument" | "onAssignOverride" | "onWarningClear"> & { warningDocument: DocumentRecord }) {
  return (
    <>
      <div className="lp-pack-change-head"><div><h2>This document may not match this requirement</h2><p>{changing.title}</p></div></div>
      <div className="lp-pack-warning-copy">
        Readiness detected this document as <b>{warningDocument.normalizedType || warningDocument.documentType || "Unknown"}</b>, which doesn't appear to satisfy <b>{changing.title}</b>.
      </div>
      {assignmentError ? <div className="lp-pack-assignment-error">{assignmentError}</div> : null}
      <div className="lp-pack-change-actions">
        <button type="button" className="lp-pack-secondary-action" disabled={busy} onClick={onWarningClear}>Choose another document</button>
        <button type="button" className="lp-pack-confirm-action" disabled={busy} onClick={() => onAssignOverride(warningDocument)}>
          {busy ? <Loader2 size={14} className="lp-spin" /> : null}Use anyway
        </button>
      </div>
    </>
  );
}
