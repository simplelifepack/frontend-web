import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronRight,
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
import type { PackSummary } from "@/lib/api";
import type { PackReadiness } from "@/readiness/calculatePackageReadiness";

type PackDetailProps = {
  completion: number;
  isComplete: boolean;
  pack: PackSummary | undefined;
  readiness: PackReadiness | null;
  readyCount: number;
  totalCount: number;
  onClose: () => void;
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

export default function PackDetail({
  completion,
  isComplete,
  pack,
  readiness,
  readyCount,
  totalCount,
  onClose,
  onUpload,
}: PackDetailProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [addFor, setAddFor] = useState<string | null>(null);
  const requirements = readiness?.requirements ?? [];
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
                const isOpen = expanded === slot.id;
                return (
                  <div className="lp-pack-check-row-wrap" key={slot.id}>
                    <button
                      type="button"
                      className="lp-pack-check-row"
                      onClick={() => setExpanded(isOpen ? null : slot.id)}
                    >
                      <span className="lp-pack-status-icon found"><Check size={13} /></span>
                      <span>{slot.title}</span>
                      <ChevronRight className={isOpen ? "open" : ""} size={15} />
                    </button>
                    {isOpen ? (
                      <div className="lp-pack-check-detail">
                        <FileText size={14} />
                        <div>
                          <strong>{slot.matchedDocument?.originalName || slot.title}</strong>
                          <span>Saved in your document archive</span>
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
