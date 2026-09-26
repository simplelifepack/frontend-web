import { useState } from "react";
import { Check, ChevronRight } from "lucide-react";

import Card from "@/components/Card";
import { T } from "@/constants/theme";
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
  const columns = showCategory
    ? "26px minmax(260px,2fr) minmax(120px,.85fr) minmax(110px,.72fr) minmax(100px,.72fr) 88px 88px 20px"
    : "26px minmax(280px,2fr) minmax(120px,.9fr) minmax(100px,.75fr) 88px 88px 20px";
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
      <DocumentBulkActions documents={selectedDocuments} onDeleted={() => setSelected(new Set())} />
      <Card
        className="lp-document-table"
        style={{ padding: 0, overflowX: "auto" }}
      >
        <div
          className="lp-document-head"
          style={{
            display: "grid",
            gridTemplateColumns: columns,
            minWidth: showCategory ? 1040 : 820,
          }}
        >
          <button
            type="button"
            className={`lp-document-check${allSelected ? " is-checked" : ""}`}
            aria-label={
              allSelected ? "Deselect all documents" : "Select all documents"
            }
            onClick={toggleAll}
          >
            {allSelected ? <Check size={11} strokeWidth={3} /> : null}
          </button>
          <div>Document</div>
          <div>Person</div>
          {showCategory ? <div>Category</div> : null}
          <div>Source</div>
          <div>Added</div>
          <div>Expiry</div>
          <div />
        </div>

        {documents.map((doc, index) => {
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
            <div
              key={doc.id}
              role="button"
              tabIndex={0}
              className="lp-document-row"
              onClick={() => openDetails(doc)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openDetails(doc);
                }
              }}
              style={{
                display: "grid",
                gridTemplateColumns: columns,
                minWidth: showCategory ? 1040 : 820,
                borderTop: index ? `1px solid ${T.border}` : "none",
              }}
            >
              <button
                type="button"
                className={`lp-document-check${isSelected ? " is-checked" : ""}`}
                aria-label={`${isSelected ? "Deselect" : "Select"} ${documentTitle(doc)}`}
                onClick={(event) => {
                  event.stopPropagation();
                  setSelected((current) => {
                    const next = new Set(current);
                    if (next.has(doc.id)) next.delete(doc.id);
                    else next.add(doc.id);
                    return next;
                  });
                }}
              >
                {isSelected ? <Check size={11} strokeWidth={3} /> : null}
              </button>
              <div className="lp-document-main">
                <span
                  className="lp-document-icon"
                  style={{
                    background: `${categoryMeta.accent}18`,
                    color: categoryMeta.accent,
                  }}
                >
                  <CategoryIcon size={16} strokeWidth={1.9} />
                </span>
                <span className="lp-document-copy">
                  <strong>
                    {doc.displayName ||
                      labelize(doc.documentType) ||
                      documentTitle(doc)}
                  </strong>
                  <small>{doc.originalName}</small>
                </span>
              </div>
              <div className="lp-document-person">
                <span style={{ background: categoryMeta.accent }} />
                <span>{person}</span>
              </div>
              {showCategory ? (
                <div>
                  <span
                    className="lp-document-category"
                    style={{
                      background: `${categoryMeta.accent}14`,
                      borderColor: `${categoryMeta.accent}35`,
                      color: categoryMeta.accent,
                    }}
                  >
                    {labelize(category)}
                  </span>
                </div>
              ) : null}
              <div className="lp-document-source">{sourceLabel(doc)}</div>
              <div className="lp-document-date">
                {new Date(doc.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "2-digit",
                  year: "2-digit",
                })}
              </div>
              <div className="lp-document-date">{expiryDisplay}</div>
              <ChevronRight className="lp-document-chevron" size={17} />
            </div>
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
