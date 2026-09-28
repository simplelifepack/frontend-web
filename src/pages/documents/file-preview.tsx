import { useEffect, useMemo, useRef, useState } from "react";

import Card from "@/components/Card";
import { T, btnGhost, btnPrimary } from "@/constants/theme";
import { api, type DocumentPage, type DocumentRecord } from "@/lib/api";
import { validateImageUploadBatch } from "@/lib/document-file-validation";
import { useAppDispatch } from "@/store/hooks";
import {
  addDocumentPages,
  deleteDocumentPage,
  reorderDocumentPages,
  replaceDocumentPage,
} from "@/store/slices/documentsSlice";
import FilePreviewContent from "./file-preview-content";
import FilePreviewHeader from "./file-preview-header";

type FilePreviewProps = {
  doc: DocumentRecord;
  rawExtractedText: string;
};

export default function FilePreview({
  doc,
  rawExtractedText,
}: FilePreviewProps) {
  const dispatch = useAppDispatch();
  const addInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [pendingError, setPendingError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const pendingPreviews = useMemo(() => pendingFiles.map((file) => ({
    file,
    url: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
  })), [pendingFiles]);
  const pages = useMemo<DocumentPage[]>(() => doc.pages?.length ? doc.pages : [{
    id: doc.id,
    position: 1,
    label: "Page 1",
    sourceType: "upload",
    originalName: doc.originalName,
    mimeType: doc.mimeType,
    size: doc.size,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }], [doc]);
  const page = pages[Math.min(pageIndex, pages.length - 1)] ?? pages[0]!;
  const mimeType = page.mimeType.toLowerCase();

  useEffect(() => {
    setPageIndex((current) => Math.min(current, Math.max(0, pages.length - 1)));
  }, [pages.length]);

  useEffect(() => () => pendingPreviews.forEach((item) => {
    if (item.url) URL.revokeObjectURL(item.url);
  }), [pendingPreviews]);

  useEffect(() => {
    if (doc.source === "GOOGLE_DRIVE") return;
    if (!mimeType.startsWith("image/") && mimeType !== "application/pdf") return;
    let active = true;
    let objectUrl: string | null = null;
    setPreviewUrl(null);
    setPreviewError(null);
    const load = page.id === doc.id
      ? api.documents.preview(doc.id)
      : api.documents.previewPage(doc.id, page.id);
    void load.then(({ blob }) => {
      if (!active) return;
      objectUrl = URL.createObjectURL(blob);
      setPreviewUrl(objectUrl);
    }).catch((error) => {
      if (!active) return;
      setPreviewError(error instanceof Error ? error.message : "Preview unavailable.");
    });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [doc.id, doc.source, mimeType, page.id]);

  const addPendingFiles = (selected: FileList | null) => {
    const incoming = Array.from(selected ?? []);
    setPendingFiles((current) => {
      const next = [...current, ...incoming]
        .filter((file, index, all) => all.findIndex((item) => item.name === file.name && item.size === file.size && item.lastModified === file.lastModified) === index);
      try {
        validateImageUploadBatch(next);
        setPendingError(null);
        return next;
      } catch (error) {
        setPendingError(error instanceof Error ? error.message : "The selected pages could not be added.");
        return current;
      }
    });
    if (addInputRef.current) addInputRef.current.value = "";
  };
  const removePendingFile = (index: number) => {
    setPendingFiles((current) => {
      const next = current.filter((_, itemIndex) => itemIndex !== index);
      try {
        validateImageUploadBatch(next);
        setPendingError(null);
      } catch (error) {
        setPendingError(error instanceof Error ? error.message : "The selected pages could not be added.");
      }
      return next;
    });
  };
  const movePage = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= pages.length) return;
    const next = pages.map((item) => item.id);
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item!);
    setBusy("order");
    try {
      const updated = await dispatch(reorderDocumentPages({ documentId: doc.id, pageIds: next })).unwrap();
      setPageIndex(updated.pages?.findIndex((item) => item.id === page.id) ?? target);
    } finally {
      setBusy(null);
    }
  };
  const addPages = async () => {
    if (!pendingFiles.length) return;
    setBusy("add");
    setPendingError(null);
    try {
      const updated = await dispatch(addDocumentPages({ documentId: doc.id, files: pendingFiles })).unwrap();
      setPendingFiles([]);
      setPageIndex(Math.max(0, (updated.pages?.length ?? pages.length) - 1));
    } catch (error) {
      setPendingError(error instanceof Error ? error.message : "Unable to add pages.");
    } finally {
      setBusy(null);
    }
  };
  const replacePage = async (file: File | undefined) => {
    if (!file) return;
    setBusy("replace");
    try {
      await dispatch(replaceDocumentPage({ documentId: doc.id, pageId: page.id, file })).unwrap();
    } finally {
      setBusy(null);
      if (replaceInputRef.current) replaceInputRef.current.value = "";
    }
  };
  const deletePage = async () => {
    if (pages.length <= 1) return;
    setBusy("delete");
    try {
      await dispatch(deleteDocumentPage({ documentId: doc.id, pageId: page.id })).unwrap();
      setPageIndex((current) => Math.max(0, current - 1));
    } finally {
      setBusy(null);
    }
  };

  if (doc.source === "GOOGLE_DRIVE") {
    return (
      <Card>
        <div style={{ color: T.white, fontWeight: 800, marginBottom: 8 }}>Original file</div>
        <div style={{ color: T.muted, fontSize: 13, lineHeight: 1.6 }}>
          This PDF remains in Google Drive. Open the original file to preview it.
        </div>
      </Card>
    );
  }

  const header = (
    <FilePreviewHeader
      addInputRef={addInputRef}
      busy={busy}
      canDelete={pages.length > 1}
      canMoveDown={pageIndex < pages.length - 1}
      canMoveUp={pageIndex > 0}
      canNext={pageIndex < pages.length - 1}
      canPrevious={pageIndex > 0}
      originalName={page.originalName}
      pageTitle={pages.length > 1 ? `${page.label} of ${pages.length}` : "File preview"}
      pendingError={pendingError}
      pendingPreviews={pendingPreviews}
      replaceInputRef={replaceInputRef}
      onAddPages={() => void addPages()}
      onAddSelected={addPendingFiles}
      onClearPending={() => { setPendingFiles([]); setPendingError(null); }}
      onDelete={() => void deletePage()}
      onMoveDown={() => void movePage(pageIndex, 1)}
      onMoveUp={() => void movePage(pageIndex, -1)}
      onNext={() => setPageIndex((item) => Math.min(pages.length - 1, item + 1))}
      onPrevious={() => setPageIndex((item) => Math.max(0, item - 1))}
      onRemovePending={removePendingFile}
      onReplaceSelected={(file) => void replacePage(file)}
    />
  );

  const previewStatus = previewError ? (
    <div style={{ color: T.coral, padding: 20 }}>{previewError}</div>
  ) : !previewUrl ? (
    <div style={{ color: T.muted, padding: 20 }}>Loading preview...</div>
  ) : null;

  return (
    <FilePreviewContent
      alt={doc.originalName}
      header={header}
      mimeType={mimeType}
      previewStatus={previewStatus}
      previewUrl={previewUrl}
      rawExtractedText={rawExtractedText}
    />
  );
}
