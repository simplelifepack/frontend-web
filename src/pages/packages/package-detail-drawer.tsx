import type { DocumentRecord, PackSummary } from "@/lib/api";
import type { DerivedRequirement, PackReadiness } from "@/readiness/calculatePackageReadiness";
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
        ) : <div className="lp-pack-drawer-message">Loading package details...</div>}
      </aside>
    </div>
  );
}
