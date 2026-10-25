import {
  Text,
  Heading,
  DrawerPortal,
  DrawerBackdrop,
  DrawerPanel,
  Button,
  SelectMenu,
  Input,
  Textarea,
  Field,
} from "@/design-system";
import { Clock, FileText, Trash2, X } from "lucide-react";
import { useState } from "react";
import { daysUntil } from "@/data/demoData";
import type { DocumentRecord } from "@/lib/api";
import { useAppSelector } from "@/store/hooks";
import {
  categories,
  expiryValue,
  fieldsObject,
  labelize,
  safeCategory,
  sourceLabel,
} from "./document-utils";
import { documentPerson } from "./document-filters";
import { useDocumentContextEditor } from "./use-document-context-editor";
import { useDocumentContext } from "./use-document-context";
import DocumentContextPackages from "./document-context-packages";
import DocumentPreviewDialog from "./document-preview-dialog";
import "./document-context-panel.css";

type Props = { doc: DocumentRecord; loading?: boolean; onClose: () => void };
export default function DocumentContextPanel({
  doc,
  loading = false,
  onClose,
}: Props) {
  const currentUserName = useAppSelector((state) => state.auth.user?.name);
  const [panel, setPanel] = useState<HTMLElement | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const category = safeCategory(doc.category);
  const categoryMeta =
    categories.find((item) => item.key === category) ??
    categories[categories.length - 1];
  const CategoryIcon = categoryMeta.icon;
  const fields = fieldsObject(doc);
  const {
    savedNotes,
    notes,
    setNotes,
    busy,
    error,
    persistDetails,
    assignPerson,
    removeDocument,
  } = useDocumentContextEditor(doc, onClose);
  const expiry = expiryValue(doc);
  const dateValue = expiry && /^\d{4}-\d{2}-\d{2}$/.test(expiry) ? expiry : "";
  const expiryDays = dateValue ? daysUntil(dateValue) : null;
  const { people, peopleError, usedIn, packagesLoading, packagesError } =
    useDocumentContext(doc);
  const person = documentPerson(doc, currentUserName);
  const assigned = fields.assignedPerson as { id?: string } | undefined;
  const assignedId =
    assigned?.id && people.some((item) => item.id === assigned.id)
      ? assigned.id
      : (people.find((item) => item.name === person)?.id ?? "");
  const disabled = loading || Boolean(busy);
  const fact = (label: string, value: string) => (
    <div className="lp-document-drawer-fact">
      <Text>{label}</Text>
      <Text as="strong" weight="regular">
        {value}
      </Text>
    </div>
  );
  return (
    <DrawerPortal>
      <DrawerBackdrop
        type="button"
        className="lp-document-drawer-backdrop document-context-backdrop"
        aria-label="Close document panel"
        onClick={onClose}
      />
      <DrawerPanel
        ref={setPanel}
        onDismiss={onClose}
        className="lp-document-drawer document-context"
        aria-label={`${doc.displayName || labelize(doc.documentType)} details`}
      >
        <header className="lp-document-drawer-header">
          <span className="lp-document-drawer-icon">
            <CategoryIcon aria-hidden="true" size={18} />
          </span>
          <div>
            <Heading level={2} size="sm">
              {doc.displayName || labelize(doc.documentType)}
            </Heading>
            <Text as="p" size="sm" title={doc.originalName}>
              {doc.originalName}
            </Text>
          </div>
          <Button
            iconOnly
            variant="secondary"
            type="button"
            aria-label="Close document panel"
            onClick={onClose}
          >
            <X aria-hidden="true" size={16} />
          </Button>
        </header>
        <div className="lp-document-drawer-body">
          {expiryDays !== null && (
            <div
              className="lp-document-drawer-expiry"
              data-state={
                expiryDays < 0 ? "expired" : expiryDays < 60 ? "soon" : "valid"
              }
            >
              <Clock aria-hidden="true" size={15} />
              <Text>
                {expiryDays < 0
                  ? `Expired ${Math.abs(expiryDays)} days ago`
                  : `Valid · expires in ${expiryDays} days`}
              </Text>
            </div>
          )}
          <section
            className="document-context-section"
            aria-labelledby="document-details-heading"
          >
            <Heading level={3} id="document-details-heading" size="sm">
              Details
            </Heading>
            {fact("Category", labelize(category))}
            {fact("Source", sourceLabel(doc))}
            {fact(
              "Added",
              new Date(doc.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
            )}
            {fact(
              "Size",
              `${Math.max(1, Math.round(doc.size / 1024)).toLocaleString()} KB`,
            )}
          </section>
          <section className="document-context-section">
            <Field
              label="Belongs to"
              error={peopleError ? "Unable to load people." : undefined}
            >
              <SelectMenu
                aria-label="Belongs to"
                value={assignedId}
                placeholder={person}
                container={panel}
                disabled={disabled || !people.length}
                onValueChange={(id) => void assignPerson(id)}
                options={people.map((item) => ({
                  value: item.id,
                  label: item.name,
                }))}
              />
            </Field>
          </section>
          <section className="document-context-section">
            <Field label="Expiry">
              <Input
                type="date"
                value={dateValue}
                disabled={disabled}
                onChange={(event) =>
                  void persistDetails(
                    { expiry: event.target.value || null },
                    "expiry",
                  )
                }
              />
            </Field>
          </section>
          <DocumentContextPackages
            usedIn={usedIn}
            packagesLoading={packagesLoading}
            packagesError={packagesError}
            onClose={onClose}
          />
          <section className="document-context-section">
            <Field label="Notes">
              <Textarea
                value={notes}
                maxLength={5000}
                disabled={disabled}
                placeholder="Anything your family should know about this document…"
                onChange={(event) => setNotes(event.target.value)}
                onBlur={() => {
                  if (notes !== savedNotes)
                    void persistDetails({ notes }, "notes");
                }}
              />
            </Field>
          </section>
          {busy && busy !== "delete" && (
            <Text as="p" size="sm" role="status">
              Saving…
            </Text>
          )}
          {error && (
            <Text as="p" tone="danger" role="alert">
              {error}
            </Text>
          )}
        </div>
        <footer className="lp-document-drawer-footer">
          <Button
            variant="primary"
            type="button"
            disabled={loading}
            onClick={() => setPreviewOpen(true)}
          >
            <FileText aria-hidden="true" size={15} />
            Preview
          </Button>
          <Button
            iconOnly
            tone="danger"
            variant="secondary"
            type="button"
            aria-label="Delete document"
            disabled={disabled}
            onClick={() => void removeDocument()}
          >
            <Trash2 aria-hidden="true" size={15} />
          </Button>
        </footer>
      </DrawerPanel>
      {previewOpen && (
        <DocumentPreviewDialog
          doc={doc}
          onClose={() => setPreviewOpen(false)}
        />
      )}
    </DrawerPortal>
  );
}
