import {
  AlertTriangle,
  Check,
  CheckCircle2,
  FileText,
  FolderOpen,
  Loader2,
  Lock,
  Plane,
  Upload,
  X,
} from "lucide-react";
import { useState } from "react";

import Ring from "@/components/Ring";
import Stamp from "@/components/Stamp";
import { T } from "@/constants/theme";
import UploadDocumentModal from "@/components/UploadDocumentModal";
import type { DocumentRecord, PackSummary } from "@/lib/api";
import { documentMatchesRequirement, type DerivedRequirement, type PackReadiness } from "@/readiness/calculatePackageReadiness";

type PackDetailProps = {
  completion: number;
  isComplete: boolean;
  pack: PackSummary | undefined;
  readiness: PackReadiness | null;
  readyCount: number;
  totalCount: number;
  documents: DocumentRecord[];
  onClose: () => void;
  onAssignRequirement: (requirement: DerivedRequirement, document: DocumentRecord, source: "USER_SELECTED" | "USER_OVERRIDE") => Promise<void>;
  onClearAssignment: (requirement: DerivedRequirement) => Promise<void>;
  onUpload: () => void;
};

function formatPackageDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function packageSource(pack: PackSummary) {
  return {
    title: pack.source?.title ?? pack.source?.name ?? "Official source",
    url: pack.source?.url ?? "",
    checked: formatPackageDate(pack.source?.lastCheckedAt),
  };
}

function isStale(pack: PackSummary) {
  const value = pack.source?.lastCheckedAt;
  return Boolean(value && Date.now() - Date.parse(value) > 30 * 24 * 60 * 60 * 1000);
}

function documentName(document: DocumentRecord | undefined, fallback = "Selected document") {
  return document?.displayName || document?.title || document?.originalName || fallback;
}

export default function PackDetail({
  completion,
  isComplete,
  pack,
  readiness,
  readyCount,
  totalCount,
  documents,
  onClose,
  onAssignRequirement,
  onClearAssignment,
  onUpload,
}: PackDetailProps) {
  const [addFor, setAddFor] = useState<string | null>(null);
  const [changing, setChanging] = useState<DerivedRequirement | null>(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState("");
  const [warningDocument, setWarningDocument] = useState<DocumentRecord | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [assignmentError, setAssignmentError] = useState<string | null>(null);
  const requirements = readiness?.requirements ?? [];
  const found = requirements.filter((slot) => slot.status === "ready");
  const needed = requirements.filter((slot) => slot.required && slot.status !== "ready");
  const currentDocument = changing?.matchedDocument
    ? documents.find((document) => document.id === changing.matchedDocument?.id)
    : undefined;
  const eligibleDocuments = changing
    ? documents
      .filter((document) => documentMatchesRequirement(changing, document))
      .sort((left, right) => Number(right.id === currentDocument?.id) - Number(left.id === currentDocument?.id) || right.confidence - left.confidence)
    : [];

  const beginChange = (slot: DerivedRequirement) => {
    setChanging(slot);
    setSelectedDocumentId(slot.matchedDocument?.id ?? "");
    setWarningDocument(null);
    setAssignmentError(null);
  };

  const assignDocument = async (document: DocumentRecord, source: "USER_SELECTED" | "USER_OVERRIDE") => {
    if (!changing) return;
    setBusy(true);
    setAssignmentError(null);
    try {
      await onAssignRequirement(changing, document, source);
      setChanging(null);
      setWarningDocument(null);
      setSelectedDocumentId("");
    } catch (error) {
      setAssignmentError(error instanceof Error ? error.message : "Unable to change this requirement.");
    } finally {
      setBusy(false);
    }
  };

  const clearAssignment = async () => {
    if (!changing) return;
    setBusy(true);
    setAssignmentError(null);
    try {
      await onClearAssignment(changing);
      setChanging(null);
    } catch (error) {
      setAssignmentError(error instanceof Error ? error.message : "Unable to return to automatic matching.");
    } finally {
      setBusy(false);
    }
  };

  const handleUploaded = (document: DocumentRecord) => {
    if (!changing) return;
    if (documentMatchesRequirement(changing, document)) {
      void assignDocument(document, "USER_SELECTED");
      return;
    }
    setWarningDocument(document);
  };

  return (
    <div className="lp-pack-drawer-inner">
      {!pack ? (
        <div style={{ color: T.muted, fontSize: 13 }}>
          No packs available yet.
        </div>
      ) : (
        <>
          <header className="lp-pack-drawer-head">
            <button
              type="button"
              className="lp-pack-drawer-close"
              onClick={onClose}
              aria-label="Close package details"
            >
              <X size={18} />
            </button>
            <div className="lp-pack-drawer-title">
              <span><Plane size={23} /></span>
              <div>
                <h2>{pack.title}</h2>
                <p>{pack.description || pack.category}</p>
              </div>
            </div>
            <div className="lp-pack-drawer-source">
              {(() => {
                const source = packageSource(pack);
                return (
                  <>
                    <span>Source: </span>
                    {source.url ? (
                      <a href={source.url} target="_blank" rel="noreferrer" title={source.url}>
                        {source.title}
                      </a>
                    ) : (
                      <span>{source.title}</span>
                    )}
                    <span>Last checked: {source.checked ?? "Not available"}</span>
                  </>
                );
              })()}
            </div>
            <div className="lp-pack-drawer-score">
              <Ring score={completion} size={64} />
              {isComplete ? (
                <Stamp />
              ) : (
                <span>{readyCount} of {totalCount} ready</span>
              )}
            </div>
          </header>

            <div className="lp-pack-drawer-body">
            {isStale(pack) ? (
              <div className="lp-pack-drawer-message">
                Requirements are from {formatPackageDate(pack.source?.lastCheckedAt) ?? "an an earlier check"}. Refresh to verify current requirements.
              </div>
            ) : null}
            <section className="lp-pack-check-card">
              <h3><CheckCircle2 size={17} /> Found in Readiness ({found.length})</h3>
              {found.map((slot) => {
                return (
                  <div className="lp-pack-check-row-wrap" key={slot.id}>
                    <div className="lp-pack-check-row">
                      <span className="lp-pack-status-icon found"><Check size={13} /></span>
                      <span>{slot.title}</span>
                    </div>
                    <div className="lp-pack-check-detail">
                      <FileText size={14} />
                      <div>
                        <strong>{slot.matchedDocument?.originalName || slot.title}</strong>
                        <span>{slot.assignmentSource === "AUTO" ? "Automatically matched from Documents" : "Selected for this requirement"}</span>
                        <button type="button" className="lp-pack-change-button" onClick={() => beginChange(slot)}>
                          Change document
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>

            {needed.length ? (
              <section className="lp-pack-check-card needed">
                <h3><AlertTriangle size={17} /> Still needed ({needed.length})</h3>
                {needed.map((slot) => {
                  const menuOpen = addFor === slot.id;
                  return (
                    <div className="lp-pack-check-row-wrap" key={slot.id}>
                      <div className="lp-pack-check-row">
                        <span className="lp-pack-status-icon needed"><X size={13} /></span>
                        <span>
                          {slot.title} not added
                          {!slot.required ? <small>Optional</small> : null}
                        </span>
                        <button
                          type="button"
                          className="lp-pack-add-button"
                          onClick={() => setAddFor(menuOpen ? null : slot.id)}
                        >
                          Add
                        </button>
                      </div>
                      {menuOpen ? (
                        <div className="lp-pack-add-menu">
                          <button type="button" onClick={onUpload}>
                            <FolderOpen size={14} /> Add document
                          </button>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </section>
            ) : null}

            <p className="lp-pack-disclaimer">
              <Lock size={13} />
              Checklist based on stored requirements; completeness and eligibility are not guaranteed.
            </p>
          </div>
          {changing ? (
            <div className="lp-modal-backdrop lp-pack-change-backdrop">
              <div className="lp-modal-panel lp-pack-change-panel" role="dialog" aria-modal="true" aria-label="Change document">
                {!warningDocument ? (
                  <>
                    <div className="lp-pack-change-head">
                      <div>
                        <h2>Change document</h2>
                        <p>{changing.title}</p>
                      </div>
                      <button type="button" className="lp-pack-change-close" onClick={() => setChanging(null)} aria-label="Close change document">
                        <X size={16} />
                      </button>
                    </div>
                    <div className="lp-pack-change-section">
                      <span>CURRENT</span>
                      {currentDocument ? (
                        <label className="lp-pack-document-option current">
                          <input type="radio" checked={selectedDocumentId === currentDocument.id} onChange={() => setSelectedDocumentId(currentDocument.id)} />
                          <Check size={14} />
                          <b>{documentName(currentDocument, changing.matchedDocument?.originalName)}</b>
                        </label>
                      ) : (
                        <p>The selected document is no longer available.</p>
                      )}
                    </div>
                    <div className="lp-pack-change-section">
                      <span>OTHER ELIGIBLE DOCUMENTS</span>
                      {eligibleDocuments.filter((document) => document.id !== currentDocument?.id).length ? (
                        eligibleDocuments.filter((document) => document.id !== currentDocument?.id).map((document) => (
                          <label className="lp-pack-document-option" key={document.id}>
                            <input type="radio" checked={selectedDocumentId === document.id} onChange={() => setSelectedDocumentId(document.id)} />
                            <FileText size={14} />
                            <b>{documentName(document)}</b>
                          </label>
                        ))
                      ) : (
                        <p>No other eligible documents found for this requirement.</p>
                      )}
                    </div>
                    {assignmentError ? <div className="lp-pack-assignment-error">{assignmentError}</div> : null}
                    <div className="lp-pack-change-actions">
                      <button type="button" className="lp-pack-upload-new" onClick={() => setUploadOpen(true)}>
                        <Upload size={14} /> Upload new document
                      </button>
                      {changing.assignmentSource !== "AUTO" ? (
                        <button type="button" className="lp-pack-secondary-action" disabled={busy} onClick={() => void clearAssignment()}>
                          Use automatic match
                        </button>
                      ) : null}
                      <button type="button" className="lp-pack-secondary-action" onClick={() => setChanging(null)}>Cancel</button>
                      <button
                        type="button"
                        className="lp-pack-confirm-action"
                        disabled={busy || !selectedDocumentId || selectedDocumentId === currentDocument?.id}
                        onClick={() => {
                          const document = documents.find((item) => item.id === selectedDocumentId);
                          if (document) void assignDocument(document, "USER_SELECTED");
                        }}
                      >
                        {busy ? <Loader2 size={14} className="lp-spin" /> : null}
                        Confirm replacement
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="lp-pack-change-head">
                      <div>
                        <h2>This document may not match this requirement</h2>
                        <p>{changing.title}</p>
                      </div>
                    </div>
                    <div className="lp-pack-warning-copy">
                      Readiness detected this document as <b>{warningDocument.normalizedType || warningDocument.documentType || "Unknown"}</b>, which doesn't appear to satisfy <b>{changing.title}</b>.
                    </div>
                    {assignmentError ? <div className="lp-pack-assignment-error">{assignmentError}</div> : null}
                    <div className="lp-pack-change-actions">
                      <button type="button" className="lp-pack-secondary-action" disabled={busy} onClick={() => setWarningDocument(null)}>
                        Choose another document
                      </button>
                      <button type="button" className="lp-pack-confirm-action" disabled={busy} onClick={() => void assignDocument(warningDocument, "USER_OVERRIDE")}>
                        {busy ? <Loader2 size={14} className="lp-spin" /> : null}
                        Use anyway
                      </button>
                    </div>
                  </>
                )}
              </div>
              {uploadOpen ? (
                <UploadDocumentModal
                  open={uploadOpen}
                  onClose={() => setUploadOpen(false)}
                  onSaved={(document) => {
                    setUploadOpen(false);
                    handleUploaded(document);
                  }}
                />
              ) : null}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
