import { Heading, Text, Button, Checkbox } from "@/design-system";

import type { DocumentRecord, PackSummary } from "@/lib/api";
import type { DerivedRequirement } from "@/readiness/calculatePackageReadiness";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronRight,
  Eye,
  FolderOpen,
  Upload,
  X,
} from "lucide-react";

export function documentName(
  document: DocumentRecord | undefined,
  fallback = "Selected document",
) {
  return (
    document?.displayName ||
    document?.title ||
    document?.originalName ||
    fallback
  );
}

export { PackageSourceList } from "./package-source-list";
export { PackDownloadCard } from "./pack-download-card";

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
        <Heading level={3} size="sm">
          <CheckCircle2
            aria-hidden="true"
            focusable="false"
            size="var(--icon-small)"
          />{" "}
          Already in your vault ({found.length})
        </Heading>
        {found.map((slot) => {
          const isOpen = expanded === slot.id;
          const document = documents.find(
            (item) => item.id === slot.matchedDocument?.id,
          );
          return (
            <div className="lp-pack-check-row-wrap" key={slot.id}>
              <button
                type="button"
                className="lp-pack-check-row"
                onClick={() => onSetExpanded(isOpen ? null : slot.id)}
              >
                <span className="lp-pack-status-icon found">
                  <Check aria-hidden="true" focusable="false" size={12} />
                </span>
                <span>
                  {slot.title}
                  <small>{documentName(document, slot.matchedDocument?.displayName || slot.matchedDocument?.originalName)}</small>
                  {typeof slot.metadata?.condition === "string" ? (
                    <small>{slot.metadata.condition}</small>
                  ) : null}
                </span>
                <ChevronRight
                  aria-hidden="true"
                  focusable="false"
                  size={13}
                  className={isOpen ? "open" : ""}
                />
              </button>
              {isOpen ? (
                <div className="lp-pack-check-detail">
                  <div>
                    <Text as="strong" size="sm" weight="semibold">
                      {slot.matchedDocument?.originalName ||
                        documentName(document, slot.title)}
                    </Text>
                    <Text size="sm">
                      {slot.assignmentSource === "AUTO"
                        ? "Automatically matched from Documents"
                        : "Selected for this requirement"}
                    </Text>
                    <span className="lp-pack-check-actions">
                      {document ? (
                        <Button
                          size="sm"
                          variant="tertiary"
                          type="button"
                          onClick={() => onViewDocument(document)}
                        >
                          <Eye aria-hidden="true" focusable="false" size={12} />{" "}
                          View
                        </Button>
                      ) : null}
                      <Button
                        size="sm"
                        variant="tertiary"
                        type="button"
                        onClick={() => onBeginChange(slot)}
                      >
                        Replace
                      </Button>
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
          <Heading level={3} size="sm">
            <X aria-hidden="true" focusable="false" size={15} /> Not needed (
            {skipped.length})
          </Heading>
          {skipped.map((slot) => (
            <div className="lp-pack-check-row-wrap" key={slot.id}>
              <div className="lp-pack-check-row">
                <span className="lp-pack-status-icon">
                  <X aria-hidden="true" focusable="false" size={13} />
                </span>
                <Text size="md">{slot.title}</Text>
                <Button
                  size="sm"
                  variant="secondary"
                  type="button"
                  onClick={() => onUnskip(slot.id)}
                >
                  Need it after all
                </Button>
              </div>
            </div>
          ))}
        </section>
      ) : null}

      {needed.length ? (
        <section className="lp-pack-check-card needed">
          <Heading level={3} size="sm">
            <AlertTriangle
              aria-hidden="true"
              focusable="false"
              size="var(--icon-small)"
            />{" "}
            Still needed ({needed.length})
          </Heading>
          {needed.map((slot) => {
            const menuOpen = addFor === slot.id;
            return (
              <div className="lp-pack-check-row-wrap" key={slot.id}>
                <div className="lp-pack-check-row">
                  <span className="lp-pack-status-icon needed">
                    <X aria-hidden="true" focusable="false" size={12} />
                  </span>
                  <Text size="md">
                    {slot.title}
                    {typeof slot.metadata?.condition === "string" ? (
                      <small>{slot.metadata.condition}</small>
                    ) : !slot.required ? (
                      <small>May be required depending on your situation</small>
                    ) : null}
                  </Text>
                  <Button
                    size="sm"
                    variant="secondary"
                    type="button"
                    onClick={() => onSetAddFor(menuOpen ? null : slot.id)}
                  >
                    Add
                  </Button>
                </div>
                {menuOpen ? (
                  <div className="lp-pack-add-menu">
                    <Button
                      size="sm"
                      variant="secondary"
                      type="button"
                      onClick={() => onUpload(slot)}
                    >
                      <Upload aria-hidden="true" focusable="false" size={14} />{" "}
                      Upload
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      type="button"
                      onClick={() => {
                        onSetAddFor(null);
                        onBeginChange(slot);
                      }}
                    >
                      <FolderOpen
                        aria-hidden="true"
                        focusable="false"
                        size={14}
                      />{" "}
                      Pick from Documents
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      type="button"
                      onClick={() => {
                        onSkip(slot.id);
                        onSetAddFor(null);
                      }}
                    >
                      <X aria-hidden="true" focusable="false" size={14} /> Not
                      needed
                    </Button>
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
