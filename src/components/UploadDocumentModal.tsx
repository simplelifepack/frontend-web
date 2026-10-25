import { Heading, Text, ModalBackdrop, ModalPanel, Input, Select, Button, vars } from "@/design-system";

import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { T } from "@/constants/theme";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { analyzeDocument, clearPendingAnalysis, saveDocument } from "@/store/slices/documentsSlice";
import { categories as documentCategories } from "@/pages/documents/document-utils";
import type { DocumentRecord } from "@/lib/api";
import { preferencesApi } from "@/lib/preferences-api";
import { validateImageUploadBatch } from "@/lib/document-file-validation";

const categories = documentCategories.map((item) => item.name);
const acceptedDocumentTypes = ".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf";
const isPdf = (file: File) => file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
export default function UploadDocumentModal({ open, onClose, onSaved, scanByDefault = false, unknownAsOther = false, zIndex = vars.layers.confirmation }: { scanByDefault?: boolean; unknownAsOther?: boolean; open: boolean; onClose: () => void; onSaved?: (document: DocumentRecord) => void; zIndex?: number }) {
  const dispatch = useAppDispatch(); const inputRef = useRef<HTMLInputElement>(null);
  const { pendingAnalysis, analyzeStatus, uploadStatus, error } = useAppSelector((state) => state.documents);
  const [files, setFiles] = useState<File[]>([]);
  const [category, setCategory] = useState(""); const [documentType, setDocumentType] = useState("");
  const [uniqueNumber, setUniqueNumber] = useState(""); const [name, setName] = useState(""); const [expiryDate, setExpiryDate] = useState(""); const [title, setTitle] = useState("");
  const [inlineError, setInlineError] = useState("");
  const [aiAvailable, setAiAvailable] = useState(false);
  const [aiConsent, setAiConsent] = useState(false);
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setAiAvailable(false);
    setAiConsent(false);
    void preferencesApi.get().then(preferences => {
      if (!cancelled) { setAiAvailable(preferences.aiProcessingEnabled); setAiConsent(scanByDefault && preferences.aiProcessingEnabled); }
    }).catch(() => { /* Manual entry remains available if preferences cannot load. */ });
    return () => { cancelled = true; };
  }, [open, scanByDefault]);
  const previews = useMemo(() => files.map((file) => ({ file, url: URL.createObjectURL(file) })), [files]);
  useEffect(() => () => previews.forEach((item) => URL.revokeObjectURL(item.url)), [previews]);
  const aiDisabled = pendingAnalysis?.warnings.some((warning) => warning.code === "AI_PROCESSING_DISABLED") ?? false;
  const aiFailed = pendingAnalysis?.warnings.some((warning) => ["AI_ANALYSIS_UNAVAILABLE", "OPENAI_API_KEY_MISSING", "OPENAI_API_AUTH_FAILED", "OPENAI_QUOTA_EXCEEDED"].includes(warning.code)) ?? false;
  const manualReview = !aiConsent || !aiAvailable || aiDisabled || aiFailed;
  useEffect(() => { if (!pendingAnalysis) return; const item = pendingAnalysis.document; const undetected = unknownAsOther && !manualReview && (!item.documentType?.trim() || ["unknown", "other", "unidentified"].includes(item.documentType.trim().toLowerCase())); setCategory(manualReview ? "" : undetected ? "Other" : item.category); setDocumentType(manualReview ? "" : undetected ? "Other" : item.documentType); setUniqueNumber(manualReview ? "" : item.uniqueNumber ?? ""); setName(manualReview ? "" : item.nameOnDocument ?? ""); setExpiryDate(manualReview ? "" : item.expiryDate ?? ""); setTitle(manualReview ? "" : item.nameOnDocument || item.title); setInlineError(""); }, [pendingAnalysis, manualReview, unknownAsOther]);
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
      const saved = await dispatch(saveDocument({ tempFileIds: pendingAnalysis.files.map((file) => file.tempFileId), originalName: pendingAnalysis.files[0]!.originalName, mimeType: pendingAnalysis.files[0]!.mimeType, size: pendingAnalysis.files.reduce((sum, file) => sum + file.size, 0), title: title.trim() || (manualReview ? undefined : pendingAnalysis.document.title), category, documentType: documentType.trim(), confidence: manualReview || ["unknown", "other"].includes(documentType.toLowerCase()) ? 0 : 90, fields: { ...(manualReview ? {} : pendingAnalysis.document.fields ?? {}), uniqueNumber: uniqueNumber.trim() || undefined, nameOnDocument: name.trim() || undefined }, reviewFields: [], rawExtractedText: manualReview ? "" : pendingAnalysis.document.extractedText ?? "", warnings: pendingAnalysis.warnings, evidence: [], analysisSource: manualReview ? "manual" : "ai", expiry: expiryDate || null, userConfirmedUnknown: documentType !== "Unknown" })).unwrap();
      onSaved?.(saved.document);
      close();
    } catch { /* The documents slice exposes a user-safe error below. */ }
  };
  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    addFiles(event.dataTransfer.files);
  };
  return <ModalBackdrop  style={{ zIndex }}><ModalPanel onDismiss={close} aria-label="Upload document"  style={{ width: "min(720px, calc(100vw - 36px))", maxHeight: "86vh", overflow: "auto" }}>
    <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-s12)", justifyContent: "space-between" }}><Heading level={2} size="md" style={{ color: T.white }}>Upload document pages</Heading><Button variant="secondary" type="button" onClick={close} >Cancel</Button></div>
    {!pendingAnalysis ? <div data-testid="document-drop-zone" onDragOver={(event) => event.preventDefault()} onDrop={onDrop} style={{ border: `1px dashed ${T.border}`, borderRadius: "var(--radius-surface)", padding: "var(--space-s20)" }}>
      <input ref={inputRef} type="file" multiple accept={acceptedDocumentTypes} onChange={(event) => addFiles(event.target.files)} style={{ display: "none" }} />
      <Button variant="secondary" type="button" onClick={chooseFiles} >
        {files.length ? "Add more document pages" : "Choose images or PDFs"}
      </Button>
      <Text as="div" size="sm" tone="muted" style={{ color: T.muted, marginTop: "var(--space-s8)" }}>JPG, PNG, WebP, or PDF · up to 50 pages and 10 MB combined per upload batch</Text>
      <div   style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: "var(--space-s10)", marginTop: "var(--space-s14)" }}>{previews.map(({ file, url }, index) => <div key={`${file.name}-${file.size}-${index}`} style={{ display: "grid", gap: "var(--space-s8)" }}><Text as="div" size="sm" weight="semibold" tone="muted" style={{ color: T.muted }}>Page {index + 1}</Text>{isPdf(file) ? <Text as="div" size="md" weight="semibold" style={{ height: 100, display: "grid", placeItems: "center", padding: "var(--space-s10)", border: `1px solid ${T.border}`, borderRadius: "var(--radius-compact)", background: T.raised, color: T.white, textAlign: "center", wordBreak: "break-word" }}>PDF<br /><small style={{ color: T.muted, fontWeight: "var(--weight-semibold)" }}>{file.name}</small></Text> : <img src={url} alt={`Page ${index + 1}`} style={{ width: "100%", height: 100, objectFit: "contain", background: T.raised }} />}<div style={{ display: "flex", gap: "var(--space-s6)", flexWrap: "wrap" }}><Button variant="secondary" type="button" disabled={index === 0} onClick={() => moveFile(index, -1)}>Up</Button><Button variant="secondary" type="button" disabled={index === files.length - 1} onClick={() => moveFile(index, 1)}>Down</Button><Button tone="danger" variant="secondary" type="button" onClick={() => setFiles((items) => items.filter((_, i) => i !== index))}>Remove</Button></div></div>)}</div>
      {aiAvailable ? <Text as="label" size="sm"><input type="checkbox" checked={aiConsent} onChange={event => setAiConsent(event.target.checked)} /> Send these document pages to OpenAI to extract details. You can leave this off and enter details manually.</Text> : <Text as="div" size="sm" tone="muted">AI processing is off or unavailable. Enter document details manually.</Text>}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "var(--space-s16)" }}><Button loading={analyzeStatus === "loading"} variant="primary" type="button" disabled={!files.length || analyzeStatus === "loading"} onClick={() => void dispatch(analyzeDocument({ files, aiAnalysisConsent: aiAvailable && aiConsent }))}>{analyzeStatus === "loading" ? aiAvailable && aiConsent ? "Scanning document…" : "Preparing pages…" : files.length ? scanByDefault && aiAvailable && aiConsent ? "Scan document" : `Continue with ${files.length} page${files.length === 1 ? "" : "s"}` : "Select document images"}</Button></div>
    </div> : <div style={{ display: "grid", gap: "var(--space-s12)" }}><Text as="div" size="md" style={{ color: T.text }}>Pages: {pendingAnalysis.files.map((file) => file.originalName).join(", ")}</Text>
      {aiDisabled ? <Text as="div" size="md" tone="muted" style={{ color: T.muted }}>AI processing is off. Your file was uploaded for review; enter the details manually.</Text> : null}
      {aiFailed ? <Text as="div" size="md" tone="muted">AI could not read this document. Enter the details manually or retry analysis.</Text> : null}
      {aiAvailable && aiConsent && aiFailed && files.length > 0 ? <Button variant="secondary" type="button" disabled={analyzeStatus === "loading"} onClick={() => void dispatch(analyzeDocument({ files, aiAnalysisConsent: aiAvailable && aiConsent }))}>Retry AI analysis</Button> : null}
      <Text as="label" size="md" tone="muted" style={{ color: T.muted }}>Title<Input value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} /></Text>
      <Text as="label" size="md" tone="muted" style={{ color: T.muted }}>Category<Select value={category} onChange={(e) => { setCategory(e.target.value); setInlineError(""); }} style={inputStyle}><option value="">Select a category</option>{categories.map((item) => <option key={item}>{item}</option>)}</Select></Text>
      <Text as="label" size="md" tone="muted" style={{ color: T.muted }}>Document type<Input value={documentType} onChange={(e) => setDocumentType(e.target.value)} style={inputStyle} /></Text>
      <Text as="label" size="md" tone="muted" style={{ color: T.muted }}>Unique number<Input value={uniqueNumber} onChange={(e) => setUniqueNumber(e.target.value)} style={inputStyle} /></Text>
      <Text as="label" size="md" tone="muted" style={{ color: T.muted }}>Name on document<Input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} /></Text>
      <Text as="label" size="md" tone="muted" style={{ color: T.muted }}>Expiry date<Input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} style={inputStyle} /></Text>
      <Text as="div" size="md" tone="muted" style={{ color: T.muted }}>Ownership: {pendingAnalysis.document.ownership}</Text><Button variant="primary" type="button" disabled={uploadStatus === "loading"} onClick={() => void save()}>Confirm & Save</Button>
    </div>}{inlineError || error ? <Text as="div" size="md" tone="danger" role="alert" style={{ color: T.coral }}>{inlineError || error}</Text> : null}
  </ModalPanel></ModalBackdrop>;
}
const inputStyle = { width: "100%", marginTop: "var(--space-s6)" };
