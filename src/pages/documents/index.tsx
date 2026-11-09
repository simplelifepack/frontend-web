import { Text, Button, Card } from "@/design-system";

import { lazy, Suspense, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { T } from "@/constants/theme";
import type { DocumentRecord } from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchDocumentById,
  fetchDocuments,
} from "@/store/slices/documentsSlice";
import { categories, safeCategory } from "./document-utils";

const CategoryDocuments = lazy(() => import("./category-documents"));
const DocumentDetail = lazy(() => import("./document-detail"));
const DocumentsOverview = lazy(() => import("./documents-overview"));
function hasDocumentDetails(document: DocumentRecord | undefined) {
  return Boolean(
    document && ("rawText" in document || "extractedKeyFields" in document),
  );
}

function DocumentsFallback() {
  return (
    <Card>
      <Text as="div" size="md" tone="muted" style={{ color: T.muted }}>Loading view...</Text>
    </Card>
  );
}

export default function DocumentsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { category: categoryParam, documentId } = useParams();
  const {
    items: documents,
    selected,
    status,
    detailStatus,
    error,
  } = useAppSelector((state) => state.documents);
  useEffect(() => {
    void dispatch(fetchDocuments());
  }, [dispatch]);
  const category = categoryParam ? safeCategory(categoryParam) : null;
  const categoryMeta = categories.find((item) => item.key === category);
  const selectedDocument = documentId
    ? selected?.id === documentId
      ? selected
      : documents.find((doc) => doc.id === documentId)
    : undefined;
  useEffect(() => {
    if (!documentId) return;
    void dispatch(fetchDocumentById(documentId));
  }, [dispatch, documentId]);
  const documentsByCategory = useMemo(() => {
    return categories.reduce<Record<string, DocumentRecord[]>>((acc, item) => {
      acc[item.key] = documents.filter(
        (doc) => safeCategory(doc.category) === item.key,
      );
      return acc;
    }, {});
  }, [documents]);
  const folderDocuments = category
    ? (documentsByCategory[category] ?? [])
    : documents;

  if (documentId) {
    if (status === "idle" || status === "loading") {
      return (
        <Card>
          <Text as="div" size="md" tone="muted" style={{ color: T.muted }}>
            Loading document...
          </Text>
        </Card>
      );
    }

    if (!hasDocumentDetails(selectedDocument) && detailStatus !== "failed") {
      return (
        <Card>
          <Text as="div" size="md" tone="muted" style={{ color: T.muted }}>
            Loading document...
          </Text>
        </Card>
      );
    }

    return selectedDocument ? (
      <Suspense fallback={<DocumentsFallback />}>
        <DocumentDetail doc={selectedDocument} />
      </Suspense>
    ) : (
      <Card>
        <Text as="div" size="md" weight="semibold" style={{ color: T.white }}>
          Document not found
        </Text>
        <Button variant="secondary"
          type="button"
          onClick={() => navigate("/documents")}
          style={{ marginTop: "var(--space-s12)" }}
        >
          Back to Documents
        </Button>
      </Card>
    );
  }

  if (category && categoryMeta) {
    return (
      <Suspense fallback={<DocumentsFallback />}>
        <CategoryDocuments
          documents={folderDocuments}
          name={categoryMeta.name}
        />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<DocumentsFallback />}>
      <DocumentsOverview documents={documents} error={error} status={status} />
    </Suspense>
  );
}
