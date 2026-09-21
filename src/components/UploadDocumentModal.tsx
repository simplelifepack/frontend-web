import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { T, btnGhost, btnGold } from "@/constants/theme";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { analyzeDocument, clearPendingAnalysis, saveDocument } from "@/store/slices/documentsSlice";
import { categories as documentCategories } from "@/pages/documents/document-utils";

const categories = documentCategories.map((item) => item.name);
export default function UploadDocumentModal({ open, stayOnSave = false, onClose }: { open: boolean; stayOnSave?: boolean; onClose: () => void }) {
  const dispatch = useAppDispatch(); const navigate = useNavigate(); const inputRef = useRef<HTMLInputElement>(null);
  const { pendingAnalysis, analyzeStatus, uploadStatus, error } = useAppSelector((state) => state.documents);
  const [files, setFiles] = useState<File[]>([]); const [aiAnalysisConsent, setConsent] = useState(true);
  const [category, setCategory] = useState(""); const [documentType, setDocumentType] = useState("");
  const [uniqueNumber, setUniqueNumber] = useState(""); const [name, setName] = useState(""); const [expiryDate, setExpiryDate] = useState(""); const [title, setTitle] = useState("");
  const [inlineError, setInlineError] = useState("");
  const previews = useMemo(() => files.map((file) => ({ file, url: URL.createObjectURL(file) })), [files]);
  useEffect(() => () => previews.forEach((item) => URL.revokeObjectURL(item.url)), [previews]);
  useEffect(() => { if (!pendingAnalysis) return; const item = pendingAnalysis.document; setCategory(aiAnalysisConsent ? item.category : ""); setDocumentType(aiAnalysisConsent ? item.documentType : ""); setUniqueNumber(aiAnalysisConsent ? item.uniqueNumber ?? "" : ""); setName(aiAnalysisConsent ? item.nameOnDocument ?? "" : ""); setExpiryDate(aiAnalysisConsent ? item.expiryDate ?? "" : ""); setTitle(aiAnalysisConsent ? item.nameOnDocument || item.title : ""); setInlineError(""); }, [pendingAnalysis, aiAnalysisConsent]);
  if (!open) return null;
  const close = () => { dispatch(clearPendingAnalysis()); setFiles([]); setConsent(true); setInlineError(""); onClose(); };
  const chooseFiles = () => inputRef.current?.click();
  const addFiles = (selected: FileList | null) => {
    const incoming = Array.from(selected ?? []);
    setFiles((current) => [...current, ...incoming]
      .filter((file, index, all) => all.findIndex((item) => item.name === file.name && item.size === file.size && item.lastModified === file.lastModified) === index)
      .slice(0, 10));
    if (inputRef.current) inputRef.current.value = "";
  };
  const save = async () => {
    if (!pendingAnalysis) return;
    if (!category.trim()) { setInlineError("Please select a category."); return; }
    setInlineError("");
    try {
      await dispatch(saveDocument({ tempFileIds: pendingAnalysis.files.map((file) => file.tempFileId), originalName: pendingAnalysis.files[0]!.originalName, mimeType: pendingAnalysis.files[0]!.mimeType, size: pendingAnalysis.files.reduce((sum, file) => sum + file.size, 0), title: title.trim() || (aiAnalysisConsent ? pendingAnalysis.document.title : undefined), category, documentType: documentType.trim(), confidence: aiAnalysisConsent ? documentType === "Unknown" ? 0 : 90 : 0, fields: { uniqueNumber: uniqueNumber.trim() || undefined, nameOnDocument: name.trim() || undefined }, reviewFields: [], rawExtractedText: "", warnings: pendingAnalysis.warnings, evidence: [], analysisSource: aiAnalysisConsent ? "ai" : "manual", expiry: expiryDate || null, userConfirmedUnknown: documentType !== "Unknown" })).unwrap();
      if (!stayOnSave) navigate(`/documents/${category.toLowerCase()}`);
      close();
    } catch { /* The documents slice exposes a user-safe error below. */ }
  };
  return <div className="lp-modal-backdrop" style={{ zIndex: 50 }}><div className="lp-modal-panel" style={{ width: "min(720px, calc(100vw - 36px))", maxHeight: "86vh", overflow: "auto" }}>
    <div style={{ display: "flex", justifyContent: "space-between" }}><h2 style={{ color: T.white }}>Upload document pages</h2><button onClick={close} style={btnGhost}>Cancel</button></div>
    {!pendingAnalysis ? <div style={{ border: `1px dashed ${T.border}`, borderRadius: 12, padding: 20 }}>
      <label style={{ color: T.text, display: "flex", alignItems: "center", gap: 8 }}><input type="checkbox" checked={aiAnalysisConsent} onChange={(event) => setConsent(event.target.checked)} style={{ width: 16, minHeight: 16 }} /> Analyze document (sends this document to OpenAI)</label>
      <input ref={inputRef} type="file" multiple accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" onChange={(event) => addFiles(event.target.files)} style={{ display: "none" }} />
      <button type="button" onClick={chooseFiles} style={{ ...btnGhost, width: "100%", minHeight: 92, justifyContent: "center", marginTop: 14, borderStyle: "dashed" }}>
        {files.length ? "Add more document pages" : "Choose document images"}
      </button>
      <div style={{ color: T.muted, fontSize: 12, marginTop: 8 }}>JPG, PNG, or WebP · up to 10 pages</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))", gap: 10, marginTop: 14 }}>{previews.map(({ file, url }, index) => <div key={`${file.name}-${file.size}`}><img src={url} alt={`Page ${index + 1}`} style={{ width: "100%", height: 100, objectFit: "contain", background: T.raised }} /><button style={btnGhost} onClick={() => setFiles((items) => items.filter((_, i) => i !== index))}>Remove</button></div>)}</div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}><button type="button" style={btnGold} disabled={!files.length || analyzeStatus === "loading"} onClick={() => void dispatch(analyzeDocument({ files, aiAnalysisConsent }))}>{analyzeStatus === "loading" ? (aiAnalysisConsent ? "Analyzing pages…" : "Preparing pages…") : files.length ? (aiAnalysisConsent ? `Analyze ${files.length} page${files.length === 1 ? "" : "s"}` : "Continue with manual details") : "Select document images"}</button></div>
    </div> : <div style={{ display: "grid", gap: 12 }}><div style={{ color: T.text }}>Pages: {pendingAnalysis.files.map((file) => file.originalName).join(", ")}</div>
      <label style={{ color: T.muted }}>Title<input value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} /></label>
      <label style={{ color: T.muted }}>Category<select value={category} onChange={(e) => { setCategory(e.target.value); setInlineError(""); }} style={inputStyle}><option value="">Select a category</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label style={{ color: T.muted }}>Document type<input value={documentType} onChange={(e) => setDocumentType(e.target.value)} style={inputStyle} /></label>
      <label style={{ color: T.muted }}>Unique number<input value={uniqueNumber} onChange={(e) => setUniqueNumber(e.target.value)} style={inputStyle} /></label>
      <label style={{ color: T.muted }}>Name on document<input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} /></label>
      <label style={{ color: T.muted }}>Expiry date<input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} style={inputStyle} /></label>
      <div style={{ color: T.muted }}>Ownership: {pendingAnalysis.document.ownership}</div><button style={btnGold} disabled={uploadStatus === "loading"} onClick={() => void save()}>Confirm & Save</button>
    </div>}{inlineError || error ? <div role="alert" style={{ color: T.coral }}>{inlineError || error}</div> : null}
  </div></div>;
}
const inputStyle = { width: "100%", marginTop: 6, padding: 10, borderRadius: 8, background: T.raised, color: T.white, border: `1px solid ${T.border}` };
