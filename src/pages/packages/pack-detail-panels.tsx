import type { DocumentRecord, PackSummary } from "@/lib/api";
import type { DerivedRequirement } from "@/readiness/calculatePackageReadiness";
import { AlertTriangle, Check, CheckCircle2, ChevronRight, Download, ExternalLink, Eye, FolderOpen, Loader2, ShieldCheck, Upload, X } from "lucide-react";
import { sourceHostname, sourceProviderName } from "./package-source-display";

export function documentName(document: DocumentRecord | undefined, fallback = "Selected document") {
  return document?.displayName || document?.title || document?.originalName || fallback;
}

function formatPackageDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

export function PackageSourceList({ pack }: { pack: PackSummary }) {
  if (!pack.verificationSources?.length) return null;
  return (
    <section className="lp-pack-source-list">
      <h3>Sources</h3>
      {pack.verificationSources.slice(0, 4).map((source) => {
        const provider = sourceProviderName(source);
        const host = sourceHostname(source.url);
        const checked = formatPackageDate(source.retrievedAt) ?? "recently";
        const details = [source.title, host, `checked ${checked}`].filter(Boolean).join(" · ");
        return (
          <a href={source.url} target="_blank" rel="noreferrer" key={`${source.title}-${source.url}`}>
            <span>
              <strong>{provider}</strong>
              <small>{details}</small>
            </span>
            {source.type === "government" || source.type === "official" || source.type === "authority" ? <ShieldCheck size={15} /> : <ExternalLink size={15} />}
          </a>
        );
      })}
      <p>Sources help verify the checklist, but institutions can still ask for more.</p>
    </section>
  );
}

type DownloadCardProps = {
  documents: DocumentRecord[];
  downloadError: string | null;
  downloadIds: Set<string>;
  downloading: boolean;
  found: DerivedRequirement[];
  selectedCount: number;
  onDownload: () => void;
  onToggle: (documentId: string) => void;
};

export function PackDownloadCard({
  documents,
  downloadError,
  downloadIds,
  downloading,
  found,
  selectedCount,
  onDownload,
  onToggle,
}: DownloadCardProps) {
  if (!found.length) return null;
  return (
    <section className="lp-pack-download-card">
      <div><b>In this download</b><span>{selectedCount} selected</span></div>
      {found.map((slot) => {
        const document = documents.find((item) => item.id === slot.matchedDocument?.id);
        if (!document) return null;
        const dropped = downloadIds.has(document.id);
        return (
          <label key={`${slot.id}-${document.id}`}>
            <input type="checkbox" checked={!dropped} onChange={() => onToggle(document.id)} />
            <span><strong>{slot.title}</strong><small>{documentName(document)}</small></span>
          </label>
        );
      })}
      {downloadError ? <div className="lp-pack-assignment-error">{downloadError}</div> : null}
      <button type="button" className="lp-pack-export-button" disabled={!selectedCount || downloading} onClick={onDownload}>
        {downloading ? <Loader2 size={15} className="lp-spin" /> : <Download size={15} />}
        {downloading ? "Downloading..." : selectedCount ? "Download package" : "Nothing selected"}
      </button>
    </section>
  );
}

type RequirementSectionsProps = {
  addFor: string | null;
  documents: DocumentRecord[];
  expanded: string | null;
  found: DerivedRequirement[];
  needed: DerivedRequirement[];
  skipped: DerivedRequirement[];
  onBeginChange: (requirement: DerivedRequirement) => void;
  onSetExpanded: (requirementId: string | null) => void;
  onSetAddFor: (requirementId: string | null) => void;
  onSkip: (requirementId: string) => void;
  onUnskip: (requirementId: string) => void;
  onUpload: (requirement: DerivedRequirement) => void;
  onViewDocument: (document: DocumentRecord) => void;
};

export function RequirementSections({
  addFor,
  documents,
  expanded,
  found,
  needed,
  skipped,
  onBeginChange,
  onSetExpanded,
  onSetAddFor,
  onSkip,
  onUnskip,
  onUpload,
  onViewDocument,
}: RequirementSectionsProps) {
  return (
    <>
      <section className="lp-pack-check-card">
        <h3><CheckCircle2 size={16} /> Already in your vault ({found.length})</h3>
        {found.map((slot) => {
          const isOpen = expanded === slot.id;
          const document = documents.find((item) => item.id === slot.matchedDocument?.id);
          return (
            <div className="lp-pack-check-row-wrap" key={slot.id}>
              <button type="button" className="lp-pack-check-row" onClick={() => onSetExpanded(isOpen ? null : slot.id)}>
                <span className="lp-pack-status-icon found"><Check size={12} /></span>
                <span>{slot.title}{typeof slot.metadata?.condition === "string" ? <small>{slot.metadata.condition}</small> : null}</span>
                <ChevronRight size={13} className={isOpen ? "open" : ""} />
              </button>
              {isOpen ? (
                <div className="lp-pack-check-detail">
                  <div>
                    <strong>{slot.matchedDocument?.originalName || documentName(document, slot.title)}</strong>
                    <span>{slot.assignmentSource === "AUTO" ? "Automatically matched from Documents" : "Selected for this requirement"}</span>
                    <span className="lp-pack-check-actions">
                      {document ? (
                        <button type="button" className="lp-pack-change-button" onClick={() => onViewDocument(document)}>
                          <Eye size={12} /> View
                        </button>
                      ) : null}
                      <button type="button" className="lp-pack-change-button" onClick={() => onBeginChange(slot)}>Replace</button>
                    </span>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </section>

      {skipped.length ? (
        <section className="lp-pack-check-card">
          <h3><X size={15} /> Not needed ({skipped.length})</h3>
          {skipped.map((slot) => (
            <div className="lp-pack-check-row-wrap" key={slot.id}>
              <div className="lp-pack-check-row">
                <span className="lp-pack-status-icon"><X size={13} /></span>
                <span>{slot.title}</span>
                <button type="button" className="lp-pack-add-button" onClick={() => onUnskip(slot.id)}>Need it after all</button>
              </div>
            </div>
          ))}
        </section>
      ) : null}

      {needed.length ? (
        <section className="lp-pack-check-card needed">
          <h3><AlertTriangle size={16} /> Still needed ({needed.length})</h3>
          {needed.map((slot) => {
            const menuOpen = addFor === slot.id;
            return (
              <div className="lp-pack-check-row-wrap" key={slot.id}>
                <div className="lp-pack-check-row">
                  <span className="lp-pack-status-icon needed"><X size={12} /></span>
                  <span>
                    {slot.title}
                    {typeof slot.metadata?.condition === "string" ? <small>{slot.metadata.condition}</small> : !slot.required ? <small>May be required depending on your situation</small> : null}
                  </span>
                  <button type="button" className="lp-pack-add-button" onClick={() => onSetAddFor(menuOpen ? null : slot.id)}>Add</button>
                </div>
                {menuOpen ? (
                  <div className="lp-pack-add-menu">
                    <button type="button" onClick={() => onUpload(slot)}><Upload size={14} /> Upload</button>
                    <button type="button" onClick={() => { onSetAddFor(null); onBeginChange(slot); }}><FolderOpen size={14} /> Pick from Documents</button>
                    <button type="button" onClick={() => { onSkip(slot.id); onSetAddFor(null); }}><X size={14} /> Not needed</button>
                  </div>
                ) : null}
              </div>
            );
          })}
        </section>
      ) : null}
    </>
  );
}
