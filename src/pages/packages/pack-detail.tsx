import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronRight,
  Download,
  FileText,
  FolderOpen,
  Lock,
  Plane,
  Upload,
  X,
} from "lucide-react";
import { useState } from "react";

import Ring from "@/components/Ring";
import Stamp from "@/components/Stamp";
import { T } from "@/constants/theme";
import type {
  PackSummary,
  ReadinessResult,
} from "@/lib/api";

type PackDetailProps = {
  completion: number;
  downloadStatus: "idle" | "loading" | "failed";
  isComplete: boolean;
  pack: PackSummary | undefined;
  readiness: ReadinessResult | null;
  readinessStatus: "idle" | "loading" | "failed";
  readyCount: number;
  totalCount: number;
  onClose: () => void;
  onDownload: () => void;
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
  const [firstSource] = pack.verificationSources ?? [];
  return {
    title: pack.sourceTitle ?? firstSource?.title ?? firstSource?.organization ?? "Official source",
    url: pack.sourceUrl ?? firstSource?.url ?? "",
    checked: formatPackageDate(pack.lastCheckedAt ?? pack.lastVerifiedAt ?? firstSource?.retrievedAt),
  };
}

export default function PackDetail({
  completion,
  downloadStatus,
  isComplete,
  pack,
  readiness,
  readinessStatus,
  readyCount,
  totalCount,
  onClose,
  onDownload,
  onUpload,
}: PackDetailProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [addFor, setAddFor] = useState<string | null>(null);
  const requirements = (readiness?.groups ?? []).flatMap(
    (group) => group.requirements,
  );
  const found = requirements.filter((slot) => slot.status === "ready");
  const needed = requirements.filter((slot) => slot.required && slot.status !== "ready");

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
                <p>{pack.subtitle || pack.description || pack.category}</p>
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
            {readinessStatus === "loading" ? (
              <div className="lp-pack-drawer-message">
              Checking document matches...
              </div>
            ) : null}

            {readinessStatus === "failed" ? (
              <div className="lp-pack-drawer-message error">
                Unable to load readiness for this pack.
              </div>
            ) : null}

            <section className="lp-pack-check-card">
              <h3><CheckCircle2 size={17} /> Found in ReadiNes ({found.length})</h3>
              {found.map((slot) => {
                const isOpen = expanded === slot.id;
                return (
                  <div className="lp-pack-check-row-wrap" key={slot.id}>
                    <button
                      type="button"
                      className="lp-pack-check-row"
                      onClick={() => setExpanded(isOpen ? null : slot.id)}
                    >
                      <span className="lp-pack-status-icon found"><Check size={13} /></span>
                      <span>{slot.label}</span>
                      <ChevronRight className={isOpen ? "open" : ""} size={15} />
                    </button>
                    {isOpen ? (
                      <div className="lp-pack-check-detail">
                        <FileText size={14} />
                        <div>
                          <strong>{slot.matchedDocument?.originalName || slot.label}</strong>
                          <span>
                            {slot.alternatives.length
                              ? `${slot.alternatives.length} alternative match${slot.alternatives.length === 1 ? "" : "es"}`
                              : "Saved in your document archive"}
                          </span>
                        </div>
                      </div>
                    ) : null}
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
                          {slot.label}
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
                            <Upload size={14} /> Upload document
                          </button>
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

            <button
              type="button"
              className="lp-pack-export-button"
              onClick={onDownload}
              disabled={downloadStatus === "loading"}
            >
              <Download size={17} />
              {downloadStatus === "loading" ? "Preparing..." : "Export pack"}
            </button>
            {downloadStatus === "failed" ? (
              <div className="lp-pack-drawer-message error">Download failed.</div>
            ) : null}
            <p className="lp-pack-disclaimer">
              <Lock size={13} />
              Checklist based on stored requirements; completeness and eligibility are not guaranteed.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
