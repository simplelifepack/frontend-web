import { Text, Button, Card } from "@/design-system";

import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { T } from "@/constants/theme";
import type { DocumentRecord } from "@/lib/api";
// Gmail/Drive integrations are paused for now because their buttons are not exposed.
// Restore this import when those entry points come back:
// import { api, type DriveStatus, type GmailStatus } from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchDocumentById,
  fetchDocuments,
} from "@/store/slices/documentsSlice";
import { categories, safeCategory } from "./document-utils";

const CategoryDocuments = lazy(() => import("./category-documents"));
const DocumentDetail = lazy(() => import("./document-detail"));
const DocumentsOverview = lazy(() => import("./documents-overview"));
// const GmailImportDialog = lazy(() => import("./gmail-import-dialog"));
// const DriveDialog = lazy(() => import("./drive-dialog"));

// const emptyDriveStatus: DriveStatus = {
//   connected: false,
//   account: null,
//   scanStatus: "idle",
//   lastScannedAt: null,
//   lastSuccessfulSync: null,
//   scanning: false,
//   phase: null,
//   processed: 0,
//   total: 0,
//   indexedCount: 0,
//   error: null,
// };

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
  // const [gmailOpen, setGmailOpen] = useState(false);
  // const [driveOpen, setDriveOpen] = useState(false);
  // const [, setGmailStatus] = useState<GmailStatus>({
  //   connected: false,
  //   account: null,
  //   lastScannedAt: null,
  //   scanning: false,
  // });
  // const [, setDriveStatus] = useState<DriveStatus>(emptyDriveStatus);

  // Gmail/Drive status calls are paused with the dormant UI.
  // useEffect(() => {
  //   void api.gmail
  //     .status()
  //     .then(setGmailStatus)
  //     .catch(() => undefined);
  // }, []);
  // useEffect(() => {
  //   void api.drive
  //     .status()
  //     .then(setDriveStatus)
  //     .catch(() => undefined);
  // }, []);
  useEffect(() => {
    if (status === "idle") void dispatch(fetchDocuments());
  }, [dispatch, status]);
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
    <>
      <Suspense fallback={<DocumentsFallback />}>
        <DocumentsOverview
          documents={documents}
          error={error}
          status={status}
        />
      </Suspense>
      {/* Gmail/Drive dialogs are paused with the dormant UI. */}
      {/*
      <Suspense fallback={null}>
        <GmailImportDialog
          open={gmailOpen}
          onClose={() => setGmailOpen(false)}
          onStatusChange={setGmailStatus}
        />
      </Suspense>
      <Suspense fallback={null}>
        <DriveDialog
          open={driveOpen}
          onClose={() => setDriveOpen(false)}
          onStatusChange={setDriveStatus}
          onDocumentsChanged={() => void dispatch(fetchDocuments())}
        />
      </Suspense>
      */}
    </>
  );
}
