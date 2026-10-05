import type { DocumentRecord, PackSummary } from "@/lib/api";
import type { DerivedRequirement, PackReadiness } from "@/readiness/calculatePackageReadiness";
import { X } from "lucide-react";
import PackDetail from "./pack-detail";

type PackageDetailDrawerProps = {
  completion: number;
  documents: DocumentRecord[];
  isComplete: boolean;
  open: boolean;
  pack: PackSummary | undefined;
  readiness: PackReadiness | null;
  readyCount: number;
  selectedTitle: string;
  totalCount: number;
  onAssignRequirement: (requirement: DerivedRequirement, document: DocumentRecord, assignmentSource: "USER_SELECTED" | "USER_OVERRIDE") => Promise<void>;
  onClearAssignment: (requirement: DerivedRequirement) => Promise<void>;
  onClose: () => void;
};

export default function PackageDetailDrawer({
  completion,
  documents,
  isComplete,
  open,
  pack,
  readiness,
  readyCount,
  selectedTitle,
  totalCount,
  onAssignRequirement,
  onClearAssignment,
  onClose,
}: PackageDetailDrawerProps) {
  if (!open) return null;
  return (
    <div className="lp-pack-drawer-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <aside className="lp-pack-drawer" role="dialog" aria-modal="true" aria-label={`${selectedTitle} package details`}>
        {pack ? (
          <PackDetail
            completion={completion}
            documents={documents}
            isComplete={isComplete}
            pack={pack}
            readiness={readiness}
            readyCount={readyCount}
            totalCount={totalCount}
            onAssignRequirement={onAssignRequirement}
            onClearAssignment={onClearAssignment}
            onClose={onClose}
          />
        ) : <PackageDetailSkeleton selectedTitle={selectedTitle} onClose={onClose} />}
      </aside>
    </div>
  );
}

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <span className={`lp-pack-detail-skeleton-block ${className}`} aria-hidden="true" />;
}

function PackageDetailSkeleton({ selectedTitle, onClose }: { selectedTitle: string; onClose: () => void }) {
  return (
    <div className="lp-pack-drawer-inner lp-pack-detail-skeleton" aria-busy="true" aria-label={`${selectedTitle} package details loading`}>
      <header className="lp-pack-drawer-head">
        <button type="button" className="lp-pack-drawer-close" onClick={onClose} aria-label="Close package details"><X size={18} /></button>
        <div className="lp-pack-drawer-title">
          <SkeletonBlock className="icon" />
          <div className="copy">
            <SkeletonBlock className="title" />
            <SkeletonBlock className="description" />
          </div>
        </div>
        <div className="lp-pack-drawer-source skeleton-source">
          <SkeletonBlock className="source-main" />
          <SkeletonBlock className="source-pill" />
          <SkeletonBlock className="source-pill short" />
          <SkeletonBlock className="source-action" />
        </div>
        <div className="lp-pack-drawer-score skeleton-score">
          <SkeletonBlock className="ring" />
          <div>
            <SkeletonBlock className="score-line" />
            <SkeletonBlock className="score-line short" />
          </div>
        </div>
      </header>

      <div className="lp-pack-drawer-body">
        <section className="lp-pack-check-card skeleton-card">
          <div className="skeleton-section-head">
            <SkeletonBlock className="section-icon" />
            <SkeletonBlock className="section-title" />
          </div>
          {Array.from({ length: 3 }, (_, index) => <SkeletonRequirementRow key={index} />)}
        </section>

        <section className="lp-pack-check-card needed skeleton-card">
          <div className="skeleton-section-head">
            <SkeletonBlock className="section-icon" />
            <SkeletonBlock className="section-title wide" />
          </div>
          {Array.from({ length: 4 }, (_, index) => <SkeletonRequirementRow key={index} action />)}
        </section>

        <div className="lp-pack-disclaimer skeleton-disclaimer">
          <SkeletonBlock className="tiny-icon" />
          <SkeletonBlock className="metadata-line" />
        </div>

        <section className="lp-pack-download-card skeleton-download">
          <div>
            <SkeletonBlock className="download-title" />
            <SkeletonBlock className="download-count" />
          </div>
          <SkeletonDownloadRow />
          <SkeletonDownloadRow />
          <SkeletonBlock className="bottom-action" />
        </section>
      </div>
    </div>
  );
}

function SkeletonRequirementRow({ action = false }: { action?: boolean }) {
  return (
    <div className="lp-pack-check-row-wrap">
      <div className="lp-pack-check-row skeleton-requirement-row">
        <SkeletonBlock className="status-dot" />
        <span>
          <SkeletonBlock className="requirement-title" />
          <SkeletonBlock className="requirement-note" />
        </span>
        {action ? <SkeletonBlock className="row-action" /> : <SkeletonBlock className="chevron" />}
      </div>
    </div>
  );
}

function SkeletonDownloadRow() {
  return (
    <div className="skeleton-download-row">
      <SkeletonBlock className="checkbox" />
      <span>
        <SkeletonBlock className="download-row-title" />
        <SkeletonBlock className="download-row-note" />
      </span>
    </div>
  );
}
