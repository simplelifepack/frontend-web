import {
  Text,
  Card,
  DataListHeader,
  DataListRow,
  Checkbox,
  Row,
  Stack,
  IconBadge,
  Pill,
} from "@/design-system";

import { useState } from "react";
import { ChevronRight } from "lucide-react";

import { daysUntil } from "@/data/demoData";
import type { DocumentRecord } from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchDocumentById } from "@/store/slices/documentsSlice";
import { documentPerson } from "./document-filters";
import {
  categories,
  documentTitle,
  expiryValue,
  labelize,
  safeCategory,
  sourceLabel,
} from "./document-utils";
import DocumentContextPanel from "./document-context-panel";
import DocumentBulkActions from "./document-bulk-actions";

type DocumentRowsProps = {
  documents: DocumentRecord[];
  showCategory?: boolean;
};

export default function DocumentRows({
  documents,
  showCategory = true,
}: DocumentRowsProps) {
  const dispatch = useAppDispatch();
  const currentUserName = useAppSelector((state) => state.auth.user?.name);
  const { selected: selectedDocument, detailStatus } = useAppSelector(
    (state) => state.documents,
  );
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openDocument, setOpenDocument] = useState<DocumentRecord | null>(null);

  const allSelected =
    documents.length > 0 && selected.size === documents.length;
  const selectedDocuments = documents.filter((doc) => selected.has(doc.id));

  const toggleAll = () => {
    setSelected(
      allSelected ? new Set() : new Set(documents.map((doc) => doc.id)),
    );
  };

  const openDetails = (doc: DocumentRecord) => {
    setOpenDocument(doc);
    void dispatch(fetchDocumentById(doc.id));
  };

  return (
    <>
      <DocumentBulkActions
        documents={selectedDocuments}
        onDeleted={() => setSelected(new Set())}
      />
      <Card flush>
        <DataListHeader $columns={showCategory ? 8 : 7}>
          <Checkbox
            aria-label={
              allSelected ? "Deselect all documents" : "Select all documents"
            }
            checked={allSelected}
            onChange={toggleAll}
          />
          <Text as="div" size="md">
            Document
          </Text>
          <Text as="div" size="md">
            Person
          </Text>
          {showCategory ? (
            <Text as="div" size="md">
              Category
            </Text>
          ) : null}
          <Text as="div" size="md">
            Source
          </Text>
          <Text as="div" size="md">
            Added
          </Text>
          <Text as="div" size="md">
            Expiry
          </Text>
          <div />
        </DataListHeader>

        {documents.map((doc) => {
          const category = safeCategory(doc.category);
          const categoryMeta =
            categories.find((item) => item.key === category) ??
            categories[categories.length - 1];
          const CategoryIcon = categoryMeta.icon;
          const expiry = expiryValue(doc);
          const person = documentPerson(doc, currentUserName);
          const isSelected = selected.has(doc.id);
          const expiryDisplay = (() => {
            if (!expiry) return "-";
            if (/^\d{4}-\d{2}-\d{2}$/.test(expiry))
              return `${daysUntil(expiry)} days`;
            const parsed = new Date(expiry);
            return Number.isNaN(parsed.getTime())
              ? "-"
              : parsed.toLocaleDateString(undefined, {
                  month: "short",
                  day: "2-digit",
                  year: "2-digit",
                });
          })();
          return (
            <DataListRow
              key={doc.id}
              role="button"
              tabIndex={0}
              $columns={showCategory ? 8 : 7}
              onClick={() => openDetails(doc)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openDetails(doc);
                }
              }}
            >
              <Checkbox
                aria-label={`${isSelected ? "Deselect" : "Select"} ${documentTitle(doc)}`}
                checked={isSelected}
                onClick={(event) => event.stopPropagation()}
                onKeyDown={(event) => event.stopPropagation()}
                onChange={() =>
                  setSelected((current) => {
                    const next = new Set(current);
                    if (next.has(doc.id)) next.delete(doc.id);
                    else next.add(doc.id);
                    return next;
                  })
                }
              />
              <Row $wrap={false} $gap="s8">
                <IconBadge>
                  <CategoryIcon
                    aria-hidden="true"
                    color={categoryMeta.accent}
                  />
                </IconBadge>
                <Stack $gap="s4">
                  <Text weight="semibold" tone="heading">
                    {doc.displayName ||
                      labelize(doc.documentType) ||
                      documentTitle(doc)}
                  </Text>
                  <Text size="sm" tone="muted">
                    {doc.originalName}
                  </Text>
                </Stack>
              </Row>
              <Text size="sm" tone="muted">
                {person}
              </Text>
              {showCategory ? (
                <Row>
                  <Pill tone="flat">{labelize(category)}</Pill>
                </Row>
              ) : null}
              <Text as="div" size="sm" tone="muted">
                {sourceLabel(doc)}
              </Text>
              <Text as="div" size="sm" tone="muted">
                {new Date(doc.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "2-digit",
                  year: "2-digit",
                })}
              </Text>
              <Text as="div" size="sm" tone="muted">
                {expiryDisplay}
              </Text>
              <ChevronRight aria-hidden="true" focusable="false" size={17} />
            </DataListRow>
          );
        })}
      </Card>
      {openDocument ? (
        <DocumentContextPanel
          doc={
            selectedDocument?.id === openDocument.id
              ? selectedDocument
              : openDocument
          }
          loading={
            selectedDocument?.id !== openDocument.id &&
            detailStatus === "loading"
          }
          onClose={() => setOpenDocument(null)}
        />
      ) : null}
    </>
  );
}
