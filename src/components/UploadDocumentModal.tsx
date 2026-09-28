import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { T, btnGhost, btnPrimary } from "@/constants/theme";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { analyzeDocument, clearPendingAnalysis, saveDocument } from "@/store/slices/documentsSlice";
import { categories as documentCategories } from "@/pages/documents/document-utils";
import type { DocumentRecord } from "@/lib/api";
import { validateImageUploadBatch } from "@/lib/document-file-validation";

const categories = documentCategories.map((item) => item.name);
const acceptedDocumentTypes = ".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf";
const isPdf = (file: File) => file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
export default function UploadDocumentModal({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved?: (document: DocumentRecord) => void }) {
  const dispatch = useAppDispatch(); const inputRef = useRef<HTMLInputElement>(null);
  const { pendingAnalysis, analyzeStatus, uploadStatus, error } = useAppSelector((state) => state.documents);
  const [files, setFiles] = useState<File[]>([]);
  const [category, setCategory] = useState(""); const [documentType, setDocumentType] = useState("");
  const [uniqueNumber, setUniqueNumber] = useState(""); const [name, setName] = useState(""); const [expiryDate, setExpiryDate] = useState(""); const [title, setTitle] = useState("");
  const [inlineError, setInlineError] = useState("");
  const previews = useMemo(() => files.map((file) => ({ file, url: URL.createObjectURL(file) })), [files]);
  useEffect(() => () => previews.forEach((item) => URL.revokeObjectURL(item.url)), [previews]);
  const aiDisabled = pendingAnalysis?.warnings.some((warning) => warning.code === "AI_PROCESSING_DISABLED") ?? false;
  useEffect(() => { if (!pendingAnalysis) return; const item = pendingAnalysis.document; setCategory(aiDisabled ? "" : item.category); setDocumentType(aiDisabled ? "" : item.documentType); setUniqueNumber(aiDisabled ? "" : item.uniqueNumber ?? ""); setName(aiDisabled ? "" : item.nameOnDocument ?? ""); setExpiryDate(aiDisabled ? "" : item.expiryDate ?? ""); setTitle(aiDisabled ? "" : item.nameOnDocument || item.title); setInlineError(""); }, [pendingAnalysis, aiDisabled]);
  if (!open) return null;
  const close = () => { dispatch(clearPendingAnalysis()); setFiles([]); setInlineError(""); onClose(); };
  const chooseFiles = () => inputRef.current?.click();
  const addFiles = (selected: FileList | null) => {
    const incoming = Array.from(selected ?? []);
    setFiles((current) => {
      const next = [...current, ...incoming]
        .filter((file, index, all) => all.findIndex((item) => item.name === file.name && item.size === file.size && item.lastModified === file.lastModified) === index)
        .slice(0, 50);
      try {
        validateImageUploadBatch(next);
        setInlineError("");
        return next;
      } catch (error) {
        setInlineError(error instanceof Error ? error.message : "The selected pages could not be added.");
        return current;
      }
    });
    if (inputRef.current) inputRef.current.value = "";
  };
  const moveFile = (index: number, direction: -1 | 1) => {
    setFiles((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item!);
      return next;
    });
  };
  const save = async () => {
    if (!pendingAnalysis) return;
    if (!category.trim()) { setInlineError("Please select a category."); return; }
    setInlineError("");
    try {
      const saved = await dispatch(saveDocument({ tempFileIds: pendingAnalysis.files.map((file) => file.tempFileId), originalName: pendingAnalysis.files[0]!.originalName, mimeType: pendingAnalysis.files[0]!.mimeType, size: pendingAnalysis.files.reduce((sum, file) => sum + file.size, 0), title: title.trim() || (aiDisabled ? undefined : pendingAnalysis.document.title), category, documentType: documentType.trim(), confidence: aiDisabled ? 0 : documentType === "Unknown" ? 0 : 90, fields: { uniqueNumber: uniqueNumber.trim() || undefined, nameOnDocument: name.trim() || undefined }, reviewFields: [], rawExtractedText: "", warnings: pendingAnalysis.warnings, evidence: [], analysisSource: aiDisabled ? "manual" : "ai", expiry: expiryDate || null, userConfirmedUnknown: documentType !== "Unknown" })).unwrap();
      onSaved?.(saved.document);
      close();
    } catch { /* The documents slice exposes a user-safe error below. */ }
  };
  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    addFiles(event.dataTransfer.files);
  };
  return <div className="lp-modal-backdrop" style={{ zIndex: 50 }}><div className="lp-modal-panel" style={{ width: "min(720px, calc(100vw - 36px))", maxHeight: "86vh", overflow: "auto" }}>
    <div style={{ display: "flex", justifyContent: "space-between" }}><h2 style={{ color: T.white }}>Upload document pages</h2><button onClick={close} style={btnGhost}>Cancel</button></div>
    {!pendingAnalysis ? <div data-testid="document-drop-zone" onDragOver={(event) => event.preventDefault()} onDrop={onDrop} style={{ border: `1px dashed ${T.border}`, borderRadius: 12, padding: 20 }}>
      <input ref={inputRef} type="file" multiple accept={acceptedDocumentTypes} onChange={(event) => addFiles(event.target.files)} style={{ display: "none" }} />
      <button type="button" onClick={chooseFiles} style={{ ...btnGhost, width: "100%", minHeight: 92, justifyContent: "center", borderStyle: "dashed" }}>
        {files.length ? "Add more document pages" : "Choose images or PDFs"}
      </button>
      <div style={{ color: T.muted, fontSize: 12, marginTop: 8 }}>JPG, PNG, WebP, or PDF · image pages up to 10 MB per upload batch</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 10, marginTop: 14 }}>{previews.map(({ file, url }, index) => <div key={`${file.name}-${file.size}-${index}`} style={{ display: "grid", gap: 8 }}><div style={{ color: T.muted, fontSize: 12, fontWeight: 800 }}>Page {index + 1}</div>{isPdf(file) ? <div style={{ height: 100, display: "grid", placeItems: "center", padding: 10, border: `1px solid ${T.border}`, borderRadius: 8, background: T.raised, color: T.white, fontWeight: 800, textAlign: "center", wordBreak: "break-word" }}>PDF<br /><small style={{ color: T.muted, fontWeight: 600 }}>{file.name}</small></div> : <img src={url} alt={`Page ${index + 1}`} style={{ width: "100%", height: 100, objectFit: "contain", background: T.raised }} />}<div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}><button type="button" style={btnGhost} disabled={index === 0} onClick={() => moveFile(index, -1)}>Up</button><button type="button" style={btnGhost} disabled={index === files.length - 1} onClick={() => moveFile(index, 1)}>Down</button><button type="button" style={btnGhost} onClick={() => setFiles((items) => items.filter((_, i) => i !== index))}>Remove</button></div></div>)}</div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}><button type="button" style={btnPrimary} disabled={!files.length || analyzeStatus === "loading"} onClick={() => void dispatch(analyzeDocument({ files, aiAnalysisConsent: true }))}>{analyzeStatus === "loading" ? "Preparing pages…" : files.length ? `Continue with ${files.length} page${files.length === 1 ? "" : "s"}` : "Select document images"}</button></div>
    </div> : <div style={{ display: "grid", gap: 12 }}><div style={{ color: T.text }}>Pages: {pendingAnalysis.files.map((file) => file.originalName).join(", ")}</div>
      {aiDisabled ? <div style={{ color: T.muted, fontSize: 13 }}>AI processing is off. Your file was uploaded for review; enter the details manually.</div> : null}
      <label style={{ color: T.muted }}>Title<input value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} /></label>
      <label style={{ color: T.muted }}>Category<select value={category} onChange={(e) => { setCategory(e.target.value); setInlineError(""); }} style={inputStyle}><option value="">Select a category</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label style={{ color: T.muted }}>Document type<input value={documentType} onChange={(e) => setDocumentType(e.target.value)} style={inputStyle} /></label>
      <label style={{ color: T.muted }}>Unique number<input value={uniqueNumber} onChange={(e) => setUniqueNumber(e.target.value)} style={inputStyle} /></label>
      <label style={{ color: T.muted }}>Name on document<input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} /></label>
      <label style={{ color: T.muted }}>Expiry date<input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} style={inputStyle} /></label>
      <div style={{ color: T.muted }}>Ownership: {pendingAnalysis.document.ownership}</div><button style={btnPrimary} disabled={uploadStatus === "loading"} onClick={() => void save()}>Confirm & Save</button>
    </div>}{inlineError || error ? <div role="alert" style={{ color: T.coral }}>{inlineError || error}</div> : null}
  </div></div>;
}
const inputStyle = { width: "100%", marginTop: 6, padding: 10, borderRadius: 8, background: T.raised, color: T.white, border: `1px solid ${T.border}` };
