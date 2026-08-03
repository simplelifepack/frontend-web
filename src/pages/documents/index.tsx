import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Card from "@/components/Card";
import { btnGhost, T } from "@/constants/theme";
import type { DocumentRecord } from "@/lib/api";
import { api, type DriveStatus, type GmailStatus } from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchDocuments } from "@/store/slices/documentsSlice";
import { categories, safeCategory, type Source } from "./document-utils";

const CategoryDocuments = lazy(() => import("./category-documents"));
const DocumentDetail = lazy(() => import("./document-detail"));
const DocumentsOverview = lazy(() => import("./documents-overview"));
const GmailImportDialog = lazy(() => import("./gmail-import-dialog"));
const DriveDialog = lazy(() => import("./drive-dialog"));

const emptyDriveStatus: DriveStatus = { connected: false, account: null, lastScannedAt: null, lastSuccessfulSync: null, scanning: false, phase: null, processed: 0, total: 0, indexedCount: 0, error: null };

function DocumentsFallback() {
  return (
    <Card>
      <div style={{ color: T.muted, fontSize: 13 }}>Loading view...</div>
    </Card>
  );
}

export default function DocumentsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { category: categoryParam, documentId } = useParams();
  const { items: documents, status, error } = useAppSelector(
    (state) => state.documents,
  );
  const [gmailOpen, setGmailOpen] = useState(false);
  const [driveOpen, setDriveOpen] = useState(false);
  const [gmailStatus, setGmailStatus] = useState<GmailStatus>({ connected: false, account: null, lastScannedAt: null, scanning: false });
  const [driveStatus, setDriveStatus] = useState<DriveStatus>(emptyDriveStatus);
  const sources: Source[] = [
    { id: "gmail", name: "Gmail", connected: gmailStatus.connected, detail: gmailStatus.account ?? "Not connected" },
    { id: "drive", name: "Google Drive", connected: driveStatus.connected, detail: driveStatus.connected ? `${driveStatus.indexedCount} PDFs indexed` : "Not connected" },
    { id: "digilocker", name: "DigiLocker", connected: false },
    { id: "upload", name: "Upload", connected: true },
  ];

  useEffect(() => { void api.gmail.status().then(setGmailStatus).catch(() => undefined); }, []);
  useEffect(() => { void api.drive.status().then(setDriveStatus).catch(() => undefined); }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const provider = params.has("drive") ? "drive" : "gmail";
    const oauthStatus = params.get(provider);
    if (oauthStatus !== "connected" && oauthStatus !== "error") return;
    const payload = { type: `lifepack:${provider}-oauth`, status: oauthStatus, reason: params.get("reason") ?? undefined };
    if (provider === "drive") {
      if (typeof BroadcastChannel !== "undefined") {
        const channel = new BroadcastChannel("lifepack:drive-oauth");
        channel.postMessage(payload);
        channel.close();
      }
      localStorage.setItem("lifepack:drive-oauth-result", JSON.stringify({ ...payload, timestamp: Date.now() }));
      window.opener?.postMessage(payload, window.location.origin);
      window.close();
      window.setTimeout(() => navigate("/documents", { replace: true }), 250);
      return;
    }
    if (window.opener) {
      window.opener.postMessage(payload, window.location.origin);
      window.close();
      return;
    }
    if (provider === "drive") { void api.drive.status().then(setDriveStatus).catch(() => undefined); setDriveOpen(true); }
    else { void api.gmail.status(true).then(setGmailStatus).catch(() => undefined); setGmailOpen(true); }
    navigate("/documents", { replace: true });
  }, [navigate]);

  const category = categoryParam ? safeCategory(categoryParam) : null;
  const categoryMeta = categories.find((item) => item.key === category);
  const selectedDocument = documentId
    ? documents.find((doc) => doc.id === documentId)
    : undefined;
  const documentsByCategory = useMemo(() => {
    return categories.reduce<Record<string, DocumentRecord[]>>((acc, item) => {
      acc[item.key] = documents.filter(
        (doc) => safeCategory(doc.category) === item.key,
      );
      return acc;
    }, {});
  }, [documents]);
  const folderDocuments = category ? documentsByCategory[category] ?? [] : documents;

  const selectSource = (id: string) => {
    if (id === "gmail") setGmailOpen(true);
    if (id === "drive") setDriveOpen(true);
    if (id === "upload") window.dispatchEvent(new CustomEvent("lifepack:open-upload"));
  };

  if (documentId) {
    if (status === "idle" || status === "loading") {
      return (
        <Card>
          <div style={{ color: T.muted, fontSize: 13 }}>Loading document...</div>
        </Card>
      );
    }

    return selectedDocument ? (
      <Suspense fallback={<DocumentsFallback />}>
        <DocumentDetail doc={selectedDocument} />
      </Suspense>
    ) : (
      <Card>
        <div style={{ color: T.white, fontWeight: 800 }}>Document not found</div>
        <button
          type="button"
          onClick={() => navigate("/documents")}
          style={{ ...btnGhost, marginTop: 12 }}
        >
          Back to Documents
        </button>
      </Card>
    );
  }

  if (category && categoryMeta) {
    return (
      <Suspense fallback={<DocumentsFallback />}>
        <CategoryDocuments documents={folderDocuments} name={categoryMeta.name} />
      </Suspense>
    );
  }

  return (
    <>
    <Suspense fallback={<DocumentsFallback />}>
      <DocumentsOverview
        documents={documents}
        error={error}
        sources={sources}
        status={status}
        onSelectSource={selectSource}
      />
    </Suspense>
    <Suspense fallback={null}><GmailImportDialog open={gmailOpen} onClose={() => setGmailOpen(false)} onStatusChange={setGmailStatus} /></Suspense>
    <Suspense fallback={null}><DriveDialog open={driveOpen} onClose={() => setDriveOpen(false)} onStatusChange={setDriveStatus} onDocumentsChanged={() => void dispatch(fetchDocuments())} /></Suspense>
    </>
  );
}
