import { Heading, Text, ModalPanel, ModalBackdrop, Input, Button } from "@/design-system";
import { CalendarClock, Check, Download, FileText, X } from "lucide-react";
import { formatVisitDate, visitSummary, documentLabel } from "./HealthDialog.buildVisitContexts";
import { DocumentIcon, documentDetail } from "./HealthDialog.documentDetail";
import { useVisitPackDialogLogic } from "./HealthDialog.useVisitPackDialogLogic";


 export function VisitPackDialog(props: Parameters<typeof useVisitPackDialogLogic>[0]) {
const context = useVisitPackDialogLogic(props);
const { member, records, onClose, onViewDocument, documents, setDocuments, selectedContextId, setSelectedContextId, selectedIds, setSelectedIds, loading, setLoading, downloading, setDownloading, error, setError, choosingVisit, setChoosingVisit, chooserQuery, setChooserQuery, contexts, selectedContext, matching, selected, appointmentDate, chooserGroups, toggle, download } = context;

return ((
    <ModalBackdrop className="lp-visit-pack-backdrop">
      <ModalPanel onDismiss={onClose}
        className="lp-visit-pack-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="visit-pack-title"
      >
        <header className="lp-health-dialog-head">
          <div>
            <Text as="p" size="sm" weight="semibold" className="lp-visit-pack-eyebrow">
              Your own records, filtered for this visit
            </Text>
            <Heading level={2} size="md" id="visit-pack-title">Prepare for a visit</Heading>
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
                  <Heading level={3} size="sm">{group.title}</Heading>
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
              <Text as="p" size="md" weight="medium" className="lp-visit-pack-next">
                Next appointment: {selectedContext?.label}
                {appointmentDate
                  ? ` on ${formatVisitDate(appointmentDate)}`
                  : ""}
                .
              </Text>
              <section className="lp-visit-pack-context">
                <span>
                  <Text as="small" size="sm">Doctors</Text>
                  <Text as="b" size="md" weight="semibold">{selectedContext?.label}</Text>
                  <Text as="em" size="md">
                    {matching.length}{" "}
                    {matching.length === 1 ? "document" : "documents"} · tap to
                    choose another doctor, hospital, or specialisation
                  </Text>
                </span>
                <Button size="sm" variant="tertiary" type="button" onClick={() => setChoosingVisit(true)}>
                  Change
                </Button>
              </section>
              {matching.length ? (
                <Text as="p" size="sm" weight="medium" className="lp-visit-pack-summary">
                  {visitSummary(matching)}
                </Text>
              ) : (
                <Text as="p" size="sm" className="lp-health-muted">
                  No documents are available for this selection.
                </Text>
              )}
              <div   className="lp-visit-pack-documents">
                {matching.map((item) => (
                  <article
                    className="lp-visit-pack-document"
                    key={item.record.id}
                  >
                    <button
                      className={
                        selectedIds.has(item.record.id) ? "checked" : ""
                      }
                      type="button"
                      aria-label={`Select ${documentLabel(item)}`}
                      aria-pressed={selectedIds.has(item.record.id)}
                      onClick={() => toggle(item.record.id)}
                    >
                      {selectedIds.has(item.record.id) ? (
                        <Check aria-hidden="true" focusable="false" size={13} />
                      ) : null}
                    </button>
                    <DocumentIcon item={item} />
                    <span>
                      <Text as="b" size="md" weight="semibold">{documentLabel(item)}</Text>
                      <Text as="small" size="sm">{documentDetail(item)}</Text>
                    </span>
                    <Button size="sm" variant="tertiary"
                      type="button"
                      onClick={() => onViewDocument(item.record.documentId)}
                    >
                      View
                    </Button>
                  </article>
                ))}
              </div>
              <div className="lp-visit-pack-note">
                <FileText aria-hidden="true" focusable="false" size="var(--icon-regular)" />
                <Text size="md">
                  Cover sheet included: allergies, conditions, medicines, and
                  latest readings.
                </Text>
                <Button size="sm" variant="tertiary" type="button" disabled title="Cover-sheet preview is not connected yet.">Preview</Button>
              </div>
              <Button loading={downloading} variant="primary"
                type="button"
                disabled={!selected.length || downloading}
                onClick={() => void download()}
              >
                <Download aria-hidden="true" focusable="false" size="var(--icon-regular)" />{" "}
                {downloading
                  ? "Preparing visit pack…"
                  : `Download visit pack (cover + ${selected.length})`}
              </Button>
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
  ));
}
