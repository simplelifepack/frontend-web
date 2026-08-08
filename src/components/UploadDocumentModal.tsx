import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { T, btnGhost, btnGold } from "@/constants/theme";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  analyzeDocument,
  clearPendingAnalysis,
  saveDocument,
} from "@/store/slices/documentsSlice";
import type { AnalyzeDocumentResponse, ReviewField } from "@/lib/api";

const categories = ["Identity", "Employment", "Finance", "Insurance", "Property", "Medical", "Education", "Travel", "Vehicle", "Legal", "Photo", "Other"] as const;
const categorySlugs: Record<string, string> = {
  Identity: "identity",
  Employment: "employment",
  Finance: "finance",
  Insurance: "insurance",
  Property: "property",
  Medical: "medical",
  Education: "education",
  Travel: "travel",
  Vehicle: "vehicle",
  Legal: "legal",
  Photo: "photo",
  Other: "other",
};

const knownCategories = new Set(Object.values(categorySlugs));

function safeCategory(value: string) {
  const slug = categorySlugs[value] ?? value.toLowerCase();
  return knownCategories.has(slug) ? slug : "other";
}

function buildReviewedSaveFields(
  pendingAnalysis: AnalyzeDocumentResponse,
  uniqueNumber: string,
  nameOnDocument: string,
) {
  const trimmedUniqueNumber = uniqueNumber.trim();
  const trimmedName = nameOnDocument.trim();
  const uniqueIdentifierField = pendingAnalysis.validation?.uniqueIdentifierField;
  const baseFields = pendingAnalysis.analysisSource === "rules"
    ? { ...(pendingAnalysis.extractedFields ?? {}) }
    : {};

  if (trimmedUniqueNumber) {
    baseFields.uniqueNumber = trimmedUniqueNumber;
    baseFields.uniqueIdentifier = trimmedUniqueNumber;
    if (uniqueIdentifierField && uniqueIdentifierField !== "documentFingerprint") {
      baseFields[uniqueIdentifierField] = trimmedUniqueNumber;
    }
  }

  if (trimmedName) {
    baseFields.nameOnDocument = trimmedName;
    baseFields.name = trimmedName;
    baseFields.fullName = trimmedName;
    baseFields.holderName = trimmedName;
  }

  return baseFields;
}

function buildReviewedFields(
  pendingAnalysis: AnalyzeDocumentResponse,
  uniqueNumber: string,
  nameOnDocument: string,
) {
  const reviewedFields = new Map<string, ReviewField>();
  for (const field of pendingAnalysis.reviewFields ?? []) {
    reviewedFields.set(field.key, field);
  }

  const trimmedUniqueNumber = uniqueNumber.trim();
  const uniqueIdentifierField = pendingAnalysis.validation?.uniqueIdentifierField;
  if (trimmedUniqueNumber && uniqueIdentifierField && uniqueIdentifierField !== "documentFingerprint") {
    reviewedFields.set(uniqueIdentifierField, {
      id: `user-${uniqueIdentifierField}`,
      key: uniqueIdentifierField,
      label: pendingAnalysis.validation?.validatedFields[uniqueIdentifierField]?.label ?? "Unique number",
      value: trimmedUniqueNumber,
      confidence: 100,
      source: "user",
      editable: true,
      important: true,
    });
  }

  const trimmedName = nameOnDocument.trim();
  if (trimmedName) {
    reviewedFields.set("holderName", {
      id: "user-holderName",
      key: "holderName",
      label: pendingAnalysis.validation?.validatedFields.holderName?.label ?? "Name on document",
      value: trimmedName,
      confidence: 100,
      source: "user",
      editable: true,
      important: Boolean(pendingAnalysis.validation?.missingRequiredFields.includes("holderName")),
    });
  }

  return Array.from(reviewedFields.values());
}

type UploadDocumentModalProps = {
  open: boolean;
  stayOnSave?: boolean;
  onClose: () => void;
};

export default function UploadDocumentModal({ open, stayOnSave = false, onClose }: UploadDocumentModalProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { pendingAnalysis, pendingAnalysisQueue, analyzeStatus, uploadStatus, error } = useAppSelector((state) => state.documents);
  const [category, setCategory] = useState<(typeof categories)[number]>("Other");
  const [documentType, setDocumentType] = useState("Unknown");
  const [uniqueNumber, setUniqueNumber] = useState("");
  const [nameOnDocument, setNameOnDocument] = useState("");
  const [title, setTitle] = useState("");
  const [aiAnalysisConsent, setAiAnalysisConsent] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (pendingAnalysis) {
      setCategory(pendingAnalysis.analysis.category);
      setDocumentType(pendingAnalysis.analysis.documentType);
      setUniqueNumber(pendingAnalysis.analysis.uniqueNumber ?? "");
      setNameOnDocument(pendingAnalysis.analysis.nameOnDocument ?? "");
      setTitle(
        pendingAnalysis.analysis.nameOnDocument ||
          pendingAnalysis.title ||
          pendingAnalysis.file.originalName,
      );
    }
  }, [pendingAnalysis]);

  if (!open) return null;

  const handleClose = () => {
    dispatch(clearPendingAnalysis());
    setAiAnalysisConsent(false);
    setSelectedFile(null);
    if (inputRef.current) inputRef.current.value = "";
    onClose();
  };

  const handleAnalyze = () => {
    if (!selectedFile || analyzeStatus === "loading") return;
    void dispatch(analyzeDocument({ file: selectedFile, aiAnalysisConsent }));
  };

  const handleSave = async () => {
    if (!pendingAnalysis) return;
    const reviewedFields = buildReviewedFields(pendingAnalysis, uniqueNumber, nameOnDocument);

    await dispatch(
      saveDocument({
        tempFileId: pendingAnalysis.tempFileId,
        originalName: pendingAnalysis.file.originalName,
        mimeType: pendingAnalysis.file.mimeType,
        size: pendingAnalysis.file.size,
        title: title.trim() || pendingAnalysis.title || pendingAnalysis.file.originalName,
        category,
        documentType,
        confidence: pendingAnalysis.confidence ?? 90,
        fields: buildReviewedSaveFields(pendingAnalysis, uniqueNumber, nameOnDocument),
        reviewFields: reviewedFields,
        rawExtractedText: pendingAnalysis.extractedText ?? "",
        warnings: pendingAnalysis.warnings ?? [],
        extraction: pendingAnalysis.extraction,
        evidence: [],
        analysisSource: pendingAnalysis.analysisSource ?? "ai",
        userConfirmedUnknown: documentType !== "Unknown",
      }),
    ).unwrap();
    if (pendingAnalysisQueue.length > 0) return;
    if (!stayOnSave) {
      navigate(`/documents/${safeCategory(category)}`);
    }
    handleClose();
  };

  return (
    <div className="lp-modal-backdrop" style={{ zIndex: 50 }}>
      <div className="lp-modal-panel" style={{ width: "min(720px, calc(100vw - 36px))", maxHeight: "86vh", overflow: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 18 }}>
          <div>
            <h2 style={{ color: T.white, fontSize: 22, fontWeight: 800, margin: 0 }}>Upload document</h2>
            <p style={{ color: T.muted, fontSize: 13, marginTop: 6 }}>
              {pendingAnalysis?.analysisSource === "rules"
                ? "Detected locally — review before saving"
                : "Detected using the configured AI provider"}
            </p>
          </div>
          <button type="button" onClick={handleClose} style={btnGhost}>Cancel</button>
        </div>

        {!pendingAnalysis ? (
          <div style={{ border: `1px dashed ${T.border}`, borderRadius: 12, padding: 22 }}>
            <div style={{ color: T.white, fontSize: 13, fontWeight: 700, marginBottom: 10 }}>
              Choose analysis mode before selecting a file
            </div>
            <label style={{ color: T.text, display: "flex", fontSize: 13, gap: 8, marginBottom: 10 }}>
              <input
                type="checkbox"
                checked={aiAnalysisConsent}
                disabled={analyzeStatus === "loading"}
                onChange={(event) => setAiAnalysisConsent(event.target.checked)}
              />
              Use the configured AI provider for document detection
            </label>
            <div style={{ color: T.muted, fontSize: 11, lineHeight: 1.5, marginBottom: 16 }}>
              {aiAnalysisConsent
                ? "AI mode: after LifePack validates the document, its content may be sent to the configured AI provider for analysis."
                : "Private mode: LifePack uses its rule-based analyzer and does not send the document to an AI provider."}
              {" "}In both modes, your browser encrypts the file first and uploads only ciphertext to LifePack for security validation and saving.
            </div>
            <input
              ref={inputRef}
              type="file"
              disabled={analyzeStatus === "loading"}
              accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
              onChange={(event) => {
                setSelectedFile(event.target.files?.[0] ?? null);
              }}
            />
            <div style={{ color: T.muted, fontSize: 13, marginTop: 12 }}>
              {analyzeStatus === "loading"
                ? "Validating and encrypting in this browser..."
                : selectedFile
                  ? `Ready to analyze: ${selectedFile.name}`
                  : "Choose a PDF, JPEG, PNG, or WebP document (maximum 20 MB)."}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={!selectedFile || analyzeStatus === "loading"}
                style={btnGold}
              >
                {analyzeStatus === "loading" ? "Analyzing..." : "Analyze document"}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            <div style={{ color: T.text, fontSize: 14 }}>
              <b style={{ color: T.white }}>File:</b> {pendingAnalysis.file.originalName}
            </div>
            <div style={{ background: T.raised, border: `1px solid ${T.border}`, borderRadius: 10, padding: 12 }}>
              <div style={{ color: T.white, fontWeight: 800, fontSize: 14 }}>Detected result</div>
              <div style={{ color: T.muted, fontSize: 12, marginTop: 6 }}>Detected category: {category}</div>
              <div style={{ color: T.muted, fontSize: 12, marginTop: 4 }}>Document type: {documentType || "Unknown"}</div>
              <div style={{ color: T.muted, fontSize: 12, marginTop: 4 }}>Unique number: {uniqueNumber || "Not detected"}</div>
              <div style={{ color: T.muted, fontSize: 12, marginTop: 4 }}>Name on document: {nameOnDocument || "Not detected"}</div>
              {pendingAnalysis.warning ? <div style={{ color: T.coral, fontSize: 12, marginTop: 8 }}>{pendingAnalysis.warning}</div> : null}
            </div>
            <label style={{ color: T.muted, fontSize: 13 }}>
              Title
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                style={{ width: "100%", marginTop: 6, padding: 10, borderRadius: 8, background: T.raised, color: T.white, border: `1px solid ${T.border}` }}
              />
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <label style={{ color: T.muted, fontSize: 13 }}>
                Category
                <select value={category} onChange={(event) => setCategory(event.target.value as (typeof categories)[number])} style={{ width: "100%", marginTop: 6, padding: 10, borderRadius: 8, background: T.raised, color: T.white, border: `1px solid ${T.border}` }}>
                  {categories.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              <label style={{ color: T.muted, fontSize: 13 }}>
                Document type
                <input value={documentType} onChange={(event) => setDocumentType(event.target.value)} style={{ width: "100%", marginTop: 6, padding: 10, borderRadius: 8, background: T.raised, color: T.white, border: `1px solid ${T.border}` }} />
              </label>
            </div>
            <label style={{ color: T.muted, fontSize: 13 }}>
              Unique number
              <input value={uniqueNumber} onChange={(event) => setUniqueNumber(event.target.value)} style={{ width: "100%", marginTop: 6, padding: 10, borderRadius: 8, background: T.raised, color: T.white, border: `1px solid ${T.border}` }} />
            </label>
            <label style={{ color: T.muted, fontSize: 13 }}>
              Name on document
              <input value={nameOnDocument} onChange={(event) => setNameOnDocument(event.target.value)} style={{ width: "100%", marginTop: 6, padding: 10, borderRadius: 8, background: T.raised, color: T.white, border: `1px solid ${T.border}` }} />
            </label>
          </div>
        )}

        {error ? <div style={{ color: T.coral, fontSize: 13, marginTop: 14 }}>{error}</div> : null}

        {pendingAnalysis ? (
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
            <button type="button" onClick={handleClose} style={btnGhost}>Cancel</button>
            <button type="button" onClick={() => void handleSave()} disabled={uploadStatus === "loading"} style={btnGold}>
              {uploadStatus === "loading" ? "Saving..." : "Confirm & Save"}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
