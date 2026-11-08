import { Heading, Text, ModalPanel, ModalBackdrop, Input, Button, Checkbox } from "@/design-system";
import { CalendarClock, Check, ChevronRight, Download, X } from "lucide-react";
import { documentLabel } from "./HealthDialog.buildVisitContexts";
import { DocumentIcon, documentDetail, humanRecordType } from "./HealthDialog.documentDetail";
import type { VisitDocument } from "./HealthDialog.HealthDialogKind";
import { useVisitPackDialogLogic } from "./HealthDialog.useVisitPackDialogLogic";


export function VisitPackDialog(props: Parameters<typeof useVisitPackDialogLogic>[0]) {
  const {
    member, onClose, onViewDocument, setSelectedContextId, selectedIds, loading,
    downloading, error, choosingVisit, setChoosingVisit, chooserQuery,
    setChooserQuery, contexts, selectedContext, matching, otherDocuments,
    selected, chooserGroups, toggle, download,
  } = useVisitPackDialogLogic(props);

  function renderDocument(item: VisitDocument, optional = false) {
    const checked = selectedIds.has(item.record.id);
    return (
      <article
        className={optional && !checked ? "lp-visit-pack-document lp-visit-pack-document-optional" : "lp-visit-pack-document"}
        key={item.record.id}
      >
        <Checkbox
          aria-label={`Select ${documentLabel(item)}`}
          checked={checked}
          onChange={() => toggle(item.record.id)}
        />
        <DocumentIcon item={item} />
        <span>
          <Text className="lp-visit-pack-record-title" weight="medium">{humanRecordType(item.record.type)}</Text>
          <Text as="small" size="sm">{documentDetail(item)}</Text>
        </span>
        <Button className="lp-visit-pack-view" size="md" variant="tertiary"
          type="button"
          onClick={() => onViewDocument(item.record.documentId)}
        >
          View
        </Button>
      </article>
    );
  }

  return (
    <ModalBackdrop className="lp-visit-pack-backdrop">
      <ModalPanel onDismiss={onClose}
        className="lp-visit-pack-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="visit-pack-title"
      >
        <header className="lp-health-dialog-head">
          <div>
            <Text as="p" size="sm" className="lp-visit-pack-eyebrow">
              Your own records, filtered for this visit
            </Text>
            <Heading level={2} size="sm" id="visit-pack-title">Prepare for a visit</Heading>
          </div>
          <Button size="sm" iconOnly variant="tertiary" type="button" onClick={onClose} aria-label="Close">
            <X aria-hidden="true" focusable="false" size="var(--icon-medium)" />
          </Button>
        </header>
        {loading ? (
          <Text as="p" size="sm" className="lp-health-muted">
            Loading this profile’s visit history…
          </Text>
        ) : contexts.length ? (
          choosingVisit ? (
            <div className="lp-visit-pack-chooser">
              <div className="lp-visit-pack-search-row">
                <Button size="sm" iconOnly variant="tertiary"
                  type="button"
                  aria-label="Back"
                  onClick={() => setChoosingVisit(false)}
                >
                  ‹
                </Button>
                <Input
                  aria-label="Search doctors, specialisations, hospitals"
                  placeholder="Search doctors, specialisations, hospitals"
                  value={chooserQuery}
                  onChange={(event) => setChooserQuery(event.target.value)}
                />
              </div>
              {chooserGroups.map((group) => (
                <section
                  className="lp-visit-pack-choice-group"
                  key={group.title}
                >
                  <Text as="h3" size="sm" weight="medium">{group.title}</Text>
                  {group.items.map((context) => (
                    <button
                      key={context.id}
                      type="button"
                      onClick={() => {
                        setSelectedContextId(context.id);
                        setChoosingVisit(false);
                      }}
                    >
                      <span>{context.label}</span>
                      <em>
                        {context.recordIds.length}{" "}
                        {context.recordIds.length === 1 ? "doc" : "docs"}
                      </em>
                      {context.id === selectedContext?.id ? (
                        <Check aria-hidden="true" focusable="false" size={14} />
                      ) : null}
                    </button>
                  ))}
                </section>
              ))}
            </div>
          ) : (
            <>
              <section className="lp-visit-pack-context">
                <Text className="lp-visit-pack-context-label" weight="medium">{selectedContext?.label}</Text>
                <Button className="lp-visit-pack-change" variant="tertiary" type="button" onClick={() => setChoosingVisit(true)}>
                  Change
                  <ChevronRight aria-hidden="true" size="var(--icon-regular)" />
                </Button>
              </section>
              <div className="lp-visit-pack-documents">
                {matching.map((item) => renderDocument(item))}
                {otherDocuments.length > 0 && (
                  <>
                    <Text as="h3" size="sm" weight="medium" className="lp-visit-pack-other-heading">
                      Anything else on file
                    </Text>
                    {otherDocuments.map((item) => renderDocument(item, true))}
                  </>
                )}
              </div>
              <footer className="lp-visit-pack-footer">
                <Button className="lp-visit-pack-preview" size="sm" variant="tertiary" type="button" disabled title="Cover-sheet preview is not connected yet.">
                  Preview cover sheet
                </Button>
                <Button className="lp-visit-pack-download" loading={downloading} variant="primary"
                  type="button"
                  disabled={!selected.length || downloading}
                  onClick={() => void download()}
                >
                  <Download aria-hidden="true" focusable="false" size="var(--icon-medium)" />
                  {downloading ? "Preparing visit pack…" : "Download"}
                </Button>
              </footer>
            </>
          )
        ) : (
          <div className="lp-visit-pack-empty">
            <CalendarClock aria-hidden="true" focusable="false" size={22} />
            <Text as="b" size="md" weight="semibold">No visit history for {member.name} yet.</Text>
            <Text as="p" size="md">
              Add a medical record with a doctor or documented follow-up to
              prepare a visit pack.
            </Text>
          </div>
        )}
        {error ? (
          <Text as="p" size="sm" weight="semibold" className="lp-health-form-error" role="alert">
            {error}
          </Text>
        ) : null}
      </ModalPanel>
    </ModalBackdrop>
  );
}
