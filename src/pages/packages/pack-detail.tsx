import { Text } from "@/design-system";
import { Lock } from "lucide-react";
import { useState } from "react";

import { T } from "@/constants/theme";
import type { DocumentRecord, PackSummary } from "@/lib/api";
import { documentMatchesRequirement, type DerivedRequirement, type PackReadiness } from "@/readiness/calculatePackageReadiness";
import { downloadDocuments } from "../documents/document-actions";
import ChangeDocumentDialog from "./pack-change-document-dialog";
import PackDetailHeader from "./pack-detail-header";
import { PackDownloadCard, RequirementSections } from "./pack-detail-panels";
import PackExtraDocuments from "./pack-extra-documents";
import PackageDocumentPreview from "./package-document-preview";

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
};

function isStale(pack: PackSummary) {
  const value = pack.source?.lastCheckedAt;
  return Boolean(value && Date.now() - Date.parse(value) > 30 * 24 * 60 * 60 * 1000);
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
}: PackDetailProps) {
  const [addFor, setAddFor] = useState<string | null>(null);
  const [changing, setChanging] = useState<DerivedRequirement | null>(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [warningDocument, setWarningDocument] = useState<DocumentRecord | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [assignmentError, setAssignmentError] = useState<string | null>(null);
  const [documentQuery, setDocumentQuery] = useState("");
  const [skipped, setSkipped] = useState<string[]>([]);
  const [extraIds, setExtraIds] = useState<Set<string>>(new Set());
  const [extraOpen, setExtraOpen] = useState(false);
  const [downloadIds, setDownloadIds] = useState<Set<string>>(new Set());
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [viewingDocument, setViewingDocument] = useState<DocumentRecord | null>(null);
  const requirements = readiness?.requirements ?? [];
  const found = requirements.filter((slot) => slot.status === "ready" && !skipped.includes(slot.id));
  const needed = requirements.filter((slot) => slot.status !== "ready" && !skipped.includes(slot.id));
  const skippedRequirements = requirements.filter((slot) => skipped.includes(slot.id));
  const currentDocument = changing?.matchedDocument
    ? documents.find((document) => document.id === changing.matchedDocument?.id)
    : undefined;
  const downloadSlots = [...found, ...documents.filter(document => extraIds.has(document.id) && !found.some(slot => slot.matchedDocument?.id === document.id)).map(document => ({ id: `extra-${document.id}`, title: document.displayName || document.title || document.originalName, matchedDocument: { ...document, normalizedType: document.normalizedType || document.documentType }, required: false, acceptedDocumentTypes: [], status: "ready", assignmentSource: "USER_SELECTED" } satisfies DerivedRequirement))];
  const selectedDownloadDocuments = [...new Map(downloadSlots.map(slot => documents.find(document => document.id === slot.matchedDocument?.id)).filter((document): document is DocumentRecord => Boolean(document)).filter(document => !downloadIds.has(document.id)).map(document => [document.id, document])).values()];
  const documentNeedle = documentQuery.trim().toLowerCase();
  const documentsForPicker = changing
    ? documents
      .filter((document) => !documentNeedle || `${document.displayName ?? ""} ${document.title ?? ""} ${document.originalName} ${document.documentType} ${document.normalizedType ?? ""}`.toLowerCase().includes(documentNeedle))
      .sort((left, right) => {
        const leftEligible = documentMatchesRequirement(changing, left);
        const rightEligible = documentMatchesRequirement(changing, right);
        return Number(right.id === currentDocument?.id) - Number(left.id === currentDocument?.id)
          || Number(rightEligible) - Number(leftEligible)
          || right.confidence - left.confidence;
      })
    : [];

  const beginChange = (slot: DerivedRequirement) => {
    setChanging(slot);
    setSelectedDocumentId(slot.matchedDocument?.id ?? "");
    setWarningDocument(null);
    setAssignmentError(null);
    setDocumentQuery("");
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

  const confirmSelectedDocument = () => {
    if (!changing || !selectedDocumentId) return;
    const document = documents.find((item) => item.id === selectedDocumentId);
    if (!document) return;
    if (documentMatchesRequirement(changing, document)) {
      void assignDocument(document, "USER_SELECTED");
      return;
    }
    setWarningDocument(document);
  };

  const downloadPack = async () => {
    if (!selectedDownloadDocuments.length || downloading) return;
    setDownloading(true);
    setDownloadError(null);
    try {
      await downloadDocuments(selectedDownloadDocuments);
    } catch (error) {
      setDownloadError(error instanceof Error ? error.message : "The package documents could not be downloaded.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div   className="lp-pack-drawer-inner">
      {!pack ? (
        <Text as="div" size="md" tone="muted" style={{ color: T.muted }}>
          No packs available yet.
        </Text>
      ) : (
        <>
          <PackDetailHeader completion={completion} isComplete={isComplete} pack={pack} readyCount={readyCount} totalCount={totalCount} onClose={onClose} />

            <div className="lp-pack-drawer-body">
            {isStale(pack) ? (
              <Text as="div" size="md" className="lp-pack-drawer-message">
                Requirements are from {pack.source?.lastCheckedAt ?? "an earlier check"}. Refresh to verify current requirements.
              </Text>
            ) : null}
            <RequirementSections
              addFor={addFor}
              documents={documents}
              expanded={expanded}
              found={found}
              needed={needed}
              skipped={skippedRequirements}
              onBeginChange={beginChange}
              onSetExpanded={setExpanded}
              onSetAddFor={setAddFor}
              onSkip={(requirementId) => setSkipped((items) => [...items, requirementId])}
              onUnskip={(requirementId) => setSkipped((items) => items.filter((id) => id !== requirementId))}
              onUpload={(slot) => { beginChange(slot); setUploadOpen(true); }}
              onViewDocument={setViewingDocument}
            />

            <PackDownloadCard
              documents={documents}
              downloadError={downloadError}
              downloadIds={downloadIds}
              downloading={downloading}
              found={downloadSlots}
              selectedCount={selectedDownloadDocuments.length}
              onDownload={() => void downloadPack()}
              onAddAnother={() => setExtraOpen(true)}
              onToggle={(documentId) => setDownloadIds((current) => {
                const next = new Set(current);
                if (next.has(documentId)) next.delete(documentId);
                else next.add(documentId);
                return next;
              })}
            />
            <Text as="p" size="sm" className="lp-pack-disclaimer">
              <Lock aria-hidden="true" focusable="false" size={13} />
              {typeof pack.searchMetadata?.disclaimer === "string" ? pack.searchMetadata.disclaimer : "Checklist based on stored requirements; completeness and eligibility are not guaranteed."}
              {typeof pack.searchMetadata?.confidence === "string" ? ` Confidence: ${pack.searchMetadata.confidence}.` : ""}
            </Text>
          </div>
          {changing ? (
            <ChangeDocumentDialog
              assignmentError={assignmentError}
              busy={busy}
              changing={changing}
              currentDocument={currentDocument}
              documentQuery={documentQuery}
              documentsForPicker={documentsForPicker}
              selectedDocumentId={selectedDocumentId}
              uploadOpen={uploadOpen}
              warningDocument={warningDocument}
              onAssignOverride={(document) => void assignDocument(document, "USER_OVERRIDE")}
              onClearAssignment={() => void clearAssignment()}
              onClose={() => setChanging(null)}
              onConfirmSelected={confirmSelectedDocument}
              onDocumentQueryChange={setDocumentQuery}
              onSelectedDocumentChange={setSelectedDocumentId}
              onUploadClose={() => setUploadOpen(false)}
              onUploadOpen={() => setUploadOpen(true)}
              onUploaded={(document) => {
                setUploadOpen(false);
                handleUploaded(document);
              }}
              onWarningClear={() => setWarningDocument(null)}
            />
          ) : null}
          {extraOpen ? <PackExtraDocuments documents={documents.filter(document => !found.some(slot => slot.matchedDocument?.id === document.id))} selected={extraIds} onUploaded={document => { setExtraIds(current => new Set(current).add(document.id)); setDownloadIds(current => { const next = new Set(current); next.delete(document.id); return next; }); setExtraOpen(false); }} onChange={id => setExtraIds(current => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; })} onClose={() => setExtraOpen(false)} /> : null}
          {viewingDocument ? (
            <PackageDocumentPreview document={viewingDocument} onClose={() => setViewingDocument(null)} />
          ) : null}
        </>
      )}
    </div>
  );
}
