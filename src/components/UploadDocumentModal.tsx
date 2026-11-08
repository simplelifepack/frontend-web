import { toast } from "sonner";
import HealthUploadReview from "./HealthUploadReview";
import { initialHealthReview, reviewedHealthPayload, type HealthUploadReview as MedicalReview } from "@/lib/health-upload.types";
import { Heading, Text, ModalBackdrop, ModalPanel, Input, SelectMenu, Button, Checkbox, vars } from "@/design-system";

import { useEffect, useRef, useState, type DragEvent } from "react";
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
export default function UploadDocumentModal({ open, onClose, onSaved, unknownAsOther = false, zIndex = vars.layers.confirmation }: { unknownAsOther?: boolean; open: boolean; onClose: () => void; onSaved?: (document: DocumentRecord) => void; zIndex?: number }) {
  const dispatch = useAppDispatch(); const inputRef = useRef<HTMLInputElement>(null);
  const { pendingAnalysis, pendingAnalysisQueue, analyzeStatus, uploadStatus, error } = useAppSelector((state) => state.documents);
  const [files, setFiles] = useState<File[]>([]);
  const [combinePages, setCombinePages] = useState(false);
  const separateDocuments = !onSaved && !combinePages;
  const [category, setCategory] = useState(""); const [documentType, setDocumentType] = useState("");
  const [uniqueNumber, setUniqueNumber] = useState(""); const [name, setName] = useState(""); const [expiryDate, setExpiryDate] = useState(""); const [title, setTitle] = useState("");
  const [healthReview, setHealthReview] = useState<MedicalReview | null>(null);
  useEffect(() => { setHealthReview(pendingAnalysis ? initialHealthReview(pendingAnalysis.document.healthExtraction, pendingAnalysis.healthProfileMatch) : null); }, [pendingAnalysis]);
  const [inlineError, setInlineError] = useState("");
  const [aiAvailable, setAiAvailable] = useState(false);
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setAiAvailable(false);
    void preferencesApi.get().then(preferences => {
      if (!cancelled) { setAiAvailable(preferences.aiProcessingEnabled); }
    }).catch(() => { /* Manual entry remains available if preferences cannot load. */ });
    return () => { cancelled = true; };
  }, [open]);
  const [previews, setPreviews] = useState<Array<{ file: File; url: string }>>([]);
  useEffect(() => {
    const next = files.map(file => ({ file, url: URL.createObjectURL(file) }));
    setPreviews(next);
    return () => next.forEach(item => URL.revokeObjectURL(item.url));
  }, [files]);
  const aiDisabled = pendingAnalysis?.warnings.some((warning) => warning.code === "AI_PROCESSING_DISABLED") ?? false;
  const analysisWarning = pendingAnalysis?.warnings.find(({ code }) =>
    code.startsWith("AI_ANALYSIS_") || ["OPENAI_API_KEY_MISSING", "OPENAI_API_AUTH_FAILED", "OPENAI_QUOTA_EXCEEDED"].includes(code),
  );
  const aiFailed = Boolean(analysisWarning);
  const manualReview = !aiAvailable || aiDisabled || aiFailed;
  useEffect(() => { if (!pendingAnalysis) return; const item = pendingAnalysis.document; const undetected = unknownAsOther && !manualReview && (!item.documentType?.trim() || ["unknown", "other", "unidentified"].includes(item.documentType.trim().toLowerCase())); setCategory(manualReview ? "" : undetected ? "Other" : item.category); setDocumentType(manualReview ? "" : undetected ? "Other" : item.documentType); setUniqueNumber(manualReview ? "" : item.uniqueNumber ?? ""); setName(manualReview ? "" : item.nameOnDocument ?? ""); setExpiryDate(manualReview ? "" : item.expiryDate ?? ""); setTitle(manualReview ? "" : item.nameOnDocument || item.title); setInlineError(""); }, [pendingAnalysis, manualReview, unknownAsOther]);
  if (!open) return null;
  const isMedical = category.toLowerCase() === "medical";
  const busy = analyzeStatus === "loading" || uploadStatus === "loading";
  const close = () => { dispatch(clearPendingAnalysis()); setFiles([]); setCombinePages(false); setInlineError(""); onClose(); };
  const chooseFiles = () => inputRef.current?.click();
  const addFiles = (selected: FileList | null) => {
    if (busy) return;
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
  async function finishSave(document: DocumentRecord, remaining: NonNullable<typeof pendingAnalysis>[]) {
    onSaved?.(document);
    if (!remaining.length) {
      close();
      return;
    }
    const [next, ...rest] = remaining;
    if (next?.document.healthExtraction) await save(next, rest);
  }

  const save = async (analysis = pendingAnalysis, remaining = pendingAnalysisQueue ?? []) => {
    if (!analysis) return;
    const extracted = analysis.document.healthExtraction;
    if (!extracted && !category.trim()) { setInlineError("Please select a category."); return; }
    setInlineError("");
    try {
      if (extracted) {
        const saved = await dispatch(saveDocument({
          tempFileIds: analysis.files.map(file => file.tempFileId),
          originalName: analysis.files[0]!.originalName,
          mimeType: analysis.files[0]!.mimeType,
          size: analysis.files.reduce((total, file) => total + file.size, 0),
          title: analysis.document.title,
          category: "Medical",
          documentType: extracted.documentType,
          confidence: 90,
          fields: { ...analysis.document.fields, nameOnDocument: analysis.document.nameOnDocument ?? undefined },
          rawExtractedText: analysis.document.extractedText ?? "",
          warnings: analysis.warnings,
          reviewFields: [],
          evidence: [],
          analysisSource: "ai",
          userConfirmedUnknown: true,
        })).unwrap();
        await finishSave(saved.document, remaining);
        return;
      }
      const saved = await dispatch(saveDocument({ ...(isMedical && healthReview ? { healthReview: reviewedHealthPayload(healthReview) } : {}), tempFileIds: analysis.files.map((file) => file.tempFileId), originalName: analysis.files[0]!.originalName, mimeType: analysis.files[0]!.mimeType, size: analysis.files.reduce((sum, file) => sum + file.size, 0), title: title.trim() || (manualReview ? undefined : analysis.document.title), category, documentType: (isMedical ? healthReview?.extraction.documentType ?? documentType : documentType).trim(), confidence: manualReview || ["unknown", "other"].includes(documentType.toLowerCase()) ? 0 : 90, fields: { ...(manualReview ? {} : analysis.document.fields ?? {}), uniqueNumber: uniqueNumber.trim() || undefined, nameOnDocument: name.trim() || undefined }, reviewFields: [], rawExtractedText: manualReview ? "" : analysis.document.extractedText ?? "", warnings: analysis.warnings, evidence: [], analysisSource: manualReview ? "manual" : "ai", expiry: expiryDate || null, userConfirmedUnknown: documentType !== "Unknown" })).unwrap();
      await finishSave(saved.document, remaining);
    } catch (error) { if (error instanceof Error) setInlineError(error.message); }
  };
  async function prepareUpload() {
    setInlineError("");
    const result = await dispatch(analyzeDocument({
      files,
      ...(separateDocuments && files.length > 1 ? { separate: true } : {}),
    })).unwrap().catch(() => null);
    if (!result) return;
    const [first, ...remaining] = result.analyses;
    if (result.issues.length) {
      const message = result.issues.map(issue => `${issue.fileName}: ${issue.message}`).join("\n");
      if (first) toast.warning(message);
      else setInlineError(message);
    }
    if (first?.document.healthExtraction) await save(first, remaining);
  }
  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    addFiles(event.dataTransfer.files);
  };
  return <ModalBackdrop  style={{ zIndex }}><ModalPanel onDismiss={() => { if (!busy) close(); }} aria-label="Upload document"  style={{ width: "min(720px, calc(100vw - 36px))", maxHeight: "86vh", overflow: "auto" }}>
    <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-s12)", justifyContent: "space-between" }}><Heading level={2} size="md" style={{ color: T.white }}>{onSaved || combinePages ? "Upload document pages" : "Upload documents"}</Heading><Button variant="secondary" type="button" onClick={close} disabled={busy}>Cancel</Button></div>
    {!pendingAnalysis ? <div data-testid="document-drop-zone" onDragOver={(event) => event.preventDefault()} onDrop={onDrop} style={{ border: `1px dashed ${T.border}`, borderRadius: "var(--radius-surface)", padding: "var(--space-s20)" }}>
      <input ref={inputRef} type="file" multiple accept={acceptedDocumentTypes} onChange={(event) => addFiles(event.target.files)} style={{ display: "none" }} />
      <Button variant="secondary" type="button" onClick={chooseFiles} disabled={busy}>
        {files.length ? separateDocuments ? "Add more files" : "Add more document pages" : "Choose images or PDFs"}
      </Button>
      <Text as="div" size="sm" tone="muted" style={{ color: T.muted, marginTop: "var(--space-s8)" }}>JPG, PNG, WebP, or PDF · up to 50 files and 10 MB of images per upload.</Text>
      {!onSaved && files.length > 1 ? (
        <Text as="label" size="sm">
          <Checkbox checked={combinePages} disabled={busy} onChange={event => setCombinePages(event.target.checked)} />
          {" "}Combine files into one document
        </Text>
      ) : null}
      <div   style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: "var(--space-s10)", marginTop: "var(--space-s14)" }}>{previews.map(({ file, url }, index) => <div key={`${file.name}-${file.size}-${index}`} style={{ display: "grid", gap: "var(--space-s8)" }}><Text as="div" size="sm" weight="semibold" tone="muted" style={{ color: T.muted }}>{separateDocuments && files.length > 1 ? "Document" : "Page"} {index + 1}</Text>{isPdf(file) ? <Text as="div" size="md" weight="semibold" style={{ height: 100, display: "grid", placeItems: "center", padding: "var(--space-s10)", border: `1px solid ${T.border}`, borderRadius: "var(--radius-compact)", background: T.raised, color: T.white, textAlign: "center", wordBreak: "break-word" }}>PDF<br /><small style={{ color: T.muted, fontWeight: "var(--weight-semibold)" }}>{file.name}</small></Text> : <img src={url} alt={`Page ${index + 1}`} style={{ width: "100%", height: 100, objectFit: "contain", background: T.raised }} />}<div style={{ display: "flex", gap: "var(--space-s6)", flexWrap: "wrap" }}><Button variant="secondary" type="button" disabled={index === 0} onClick={() => moveFile(index, -1)}>Up</Button><Button variant="secondary" type="button" disabled={index === files.length - 1} onClick={() => moveFile(index, 1)}>Down</Button><Button tone="danger" variant="secondary" type="button" onClick={() => setFiles((items) => items.filter((_, i) => i !== index))}>Remove</Button></div></div>)}</div>
      <Text as="div" size="sm" tone="muted">{aiAvailable ? "AI processing follows your Settings preference." : "AI processing is off or unavailable. Enter document details manually."}</Text>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "var(--space-s16)" }}><Button loading={analyzeStatus === "loading"} variant="primary" type="button" disabled={!files.length || analyzeStatus === "loading"} onClick={() => void prepareUpload()}>{analyzeStatus === "loading" ? "Preparing documents…" : files.length ? `Continue with ${files.length} ${separateDocuments && files.length > 1 ? "documents" : files.length === 1 ? "page" : "pages"}` : "Select documents"}</Button></div>
    </div> : pendingAnalysis.document.healthExtraction ? (
      <Button variant="primary" type="button" loading={uploadStatus === "loading"} disabled={uploadStatus === "loading"} onClick={() => void save()}>Save health document</Button>
    ) : <div style={{ display: "grid", gap: "var(--space-s12)" }}><Text as="div" size="md" style={{ color: T.text }}>Pages: {pendingAnalysis.files.map((file) => file.originalName).join(", ")}</Text>
      {pendingAnalysisQueue?.length > 0 ? <Text as="p" size="sm">{pendingAnalysisQueue.length} more {pendingAnalysisQueue.length === 1 ? "document" : "documents"} to review.</Text> : null}
      {aiDisabled ? <Text as="div" size="md" tone="muted" style={{ color: T.muted }}>AI processing is off. Your file was uploaded for review; enter the details manually.</Text> : null}
      {analysisWarning ? (
        <Text as="div" size="md" tone="muted">AI could not read this document. {analysisWarning.message}</Text>
      ) : null}
      <Text as="label" size="md" tone="muted" style={{ color: T.muted }}>Title<Input value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} /></Text>
      <Text as="label" size="md" tone="muted" style={{ color: T.muted }}>Category<SelectMenu
        value={category}
        onValueChange={(selectedValue) => {
          setCategory(selectedValue);
          setInlineError("");
        }}
        options={[
          { value: "", label: "Select a category" },
          ...categories.map((item) => ({ value: item, label: item })),
        ]}
      /></Text>
      {!isMedical ? <>
      <Text as="label" size="md" tone="muted" style={{ color: T.muted }}>Document type<Input value={documentType} onChange={(e) => setDocumentType(e.target.value)} style={inputStyle} /></Text>
      <Text as="label" size="md" tone="muted" style={{ color: T.muted }}>Unique number<Input value={uniqueNumber} onChange={(e) => setUniqueNumber(e.target.value)} style={inputStyle} /></Text>
      <Text as="label" size="md" tone="muted" style={{ color: T.muted }}>Name on document<Input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} /></Text>
      <Text as="label" size="md" tone="muted" style={{ color: T.muted }}>Expiry date<Input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} style={inputStyle} /></Text>
      </> : null}
      {isMedical && healthReview ? <HealthUploadReview value={healthReview} onChange={setHealthReview} /> : null}
      {!isMedical ? <Text as="div" size="md" tone="muted" style={{ color: T.muted }}>Ownership: {pendingAnalysis.document.ownership}</Text> : null}
      <Button variant="primary" type="button" disabled={busy} onClick={() => void save()}>Confirm & Save</Button>
    </div>}{inlineError || error ? <Text as="div" size="md" tone="danger" role="alert" style={{ color: T.coral }}>{inlineError || error}</Text> : null}
  </ModalPanel></ModalBackdrop>;
}
const inputStyle = { width: "100%", marginTop: "var(--space-s6)" };
