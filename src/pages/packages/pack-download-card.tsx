import { Text, Button, Checkbox } from "@/design-system";
import type { DocumentRecord } from "@/lib/api";
import type { DerivedRequirement } from "@/readiness/calculatePackageReadiness";
import { Download, Loader2 } from "lucide-react";
import { documentPerson } from "../documents/document-filters";
type DownloadCardProps = {
  documents: DocumentRecord[];
  downloadError: string | null;
  downloadIds: Set<string>;
  downloading: boolean;
  found: DerivedRequirement[];
  selectedCount: number;
  onDownload: () => void;
  onAddAnother: () => void;
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
  onAddAnother,
  onToggle,
}: DownloadCardProps) {
  if (!found.length) return null;
  return (
    <div className="lp-pack-download-section">
      <section className="lp-pack-download-card">
        <div>
          <Text as="b" size="md" weight="semibold">
            <Download aria-hidden="true" size={15} /> In this download
          </Text>
          <Text size="md">{selectedCount}</Text>
        </div>
        {found
          .filter(
            (slot, index) =>
              found.findIndex(
                (other) =>
                  other.matchedDocument?.id === slot.matchedDocument?.id,
              ) === index,
          )
          .map((slot) => {
            const document = documents.find(
              (item) => item.id === slot.matchedDocument?.id,
            );
            if (!document) return null;
            const dropped = downloadIds.has(document.id);
            return (
              <Text as="label" size="md" key={`${slot.id}-${document.id}`}>
                <Checkbox
                  type="checkbox"
                  checked={!dropped}
                  onChange={() => onToggle(document.id)}
                />
                <span>
                  <strong>{slot.title}</strong>
                  <small>{documentPerson(document)}</small>
                </span>
              </Text>
            );
          })}
        <Button
          variant="tertiary"
          type="button"
          className="lp-pack-add-another"
          onClick={onAddAnother}
        >
          Add another document
        </Button>
      </section>
      {downloadError ? (
        <Text as="div" size="sm" className="lp-pack-assignment-error">
          {downloadError}
        </Text>
      ) : null}
      <Button
        loading={downloading}
        variant="primary"
        type="button"
        disabled={!selectedCount || downloading}
        onClick={onDownload}
      >
        {downloading ? (
          <Loader2
            aria-hidden="true"
            focusable="false"
            size={15}
            className="lp-spin"
          />
        ) : (
          <Download aria-hidden="true" focusable="false" size={15} />
        )}
        {downloading
          ? "Downloading..."
          : selectedCount
            ? "Download"
            : "Nothing selected"}
      </Button>
    </div>
  );
}
