import { api } from "@/lib/api";
import type { AnalyzeDocumentResponse } from "@/lib/api.types";
import { initialHealthReview, reviewedHealthPayload, type HealthUploadReview as MedicalReview } from "@/lib/health-upload.types";
import HealthUploadReview from "@/components/HealthUploadReview";
import { Heading, Text, ModalBackdrop, ModalPanel, SelectMenu, Button } from "@/design-system";

import { useEffect, useRef, useState, type DragEvent } from "react";
import { FileText, Upload, X } from "lucide-react";

import { isSupportedHealthFile } from "../healthUtils";
import { healthDocumentTypes, type HealthDocumentType } from "../types/health";
import { documentTypeLabels } from "../healthUtils";

const maxHealthFileBytes = 25 * 1024 * 1024;

function AddRecordDialog({
  onClose,
  onCreate,
  aiProcessingEnabled,
}: {
  onClose: () => void;
  aiProcessingEnabled: boolean;
  onCreate: (payload: {
    file: File;
    analysis?: AnalyzeDocumentResponse;
    healthReview?: MedicalReview;
    type?: HealthDocumentType;
  }) => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const inFlight = useRef(false);
  const [analysis, setAnalysis] = useState<AnalyzeDocumentResponse | null>(null);
  const [review, setReview] = useState<MedicalReview | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [type, setType] = useState<HealthDocumentType>("lab_report");
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!file || !file.type.startsWith("image/")) {
      setPreviewUrl("");
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const pasted = Array.from(event.clipboardData?.files ?? []);
      if (!pasted.length) return;
      event.preventDefault();
      selectFile(pasted[0]!);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, []);

  const selectFile = (candidate: File | null) => {
    if (!candidate || inFlight.current) return;
    setAnalysis(null);
    setReview(null);
    const validationError = !isSupportedHealthFile(candidate)
      ? "ReadiNes keeps PDFs and images. Save this as a PDF or take a photo of it."
      : candidate.size > maxHealthFileBytes
        ? "This file is larger than 25 MB."
        : null;
    if (validationError) {
      setError(validationError);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    setError("");
    setFile(candidate);
  };

  const drop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setDragActive(false);
    selectFile(event.dataTransfer.files[0] ?? null);
  };

  const process = async () => {
    if (!file || (!aiProcessingEnabled && !type) || inFlight.current) return;
    inFlight.current = true;
    setProcessing(true);
    setError("");
    try {
      if (aiProcessingEnabled) {
        const scanned = analysis ?? await api.documents.analyze([file]);
        if (!analysis) setAnalysis(scanned);
        if (scanned.document.category !== "Medical" && scanned.warnings.length === 0) {
          setError("This file was not identified as a Health document. Upload it in Documents.");
          return;
        }
        if (scanned.document.healthExtraction) {
          await onCreate({ file, type: scanned.document.healthExtraction.documentType, analysis: scanned });
        } else if (!review) {
          setReview(initialHealthReview(undefined, undefined, "medical_report"));
        } else {
          await onCreate({ file, type: review.extraction.documentType, analysis: scanned, healthReview: reviewedHealthPayload(review) });
        }
      } else {
        await onCreate({ file, type });
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to process health record. Try again.",
      );
    } finally {
      inFlight.current = false;
      setProcessing(false);
    }
  };

  return (
    <ModalBackdrop

      style={{ zIndex: "var(--layer-drawer)" }}
      onMouseDown={(event) => {
        if (!inFlight.current && event.target === event.currentTarget) onClose();
      }}
    >
      <ModalPanel onDismiss={() => { if (!inFlight.current) onClose(); }}
        className="lp-health-add-dialog lp-health-upload-dialog"
        role="dialog"
        aria-modal="true"
      >
        <header className="lp-health-dialog-head">
          <Heading level={2} size="md">Add health record</Heading>
          <Button size="sm" iconOnly variant="tertiary" type="button" disabled={processing} onClick={onClose} aria-label="Close">
            <X aria-hidden="true" focusable="false" size="var(--icon-regular)" />
          </Button>
        </header>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,application/pdf"
          onChange={(event) => selectFile(event.target.files?.[0] ?? null)}
          style={{ display: "none" }}
        />
        {!file ? (
          <button
            type="button"
            className={
              dragActive ? "lp-health-dropzone active" : "lp-health-dropzone"
            }
            disabled={processing} onClick={() => inputRef.current?.click()}
            onDragEnter={(event) => {
              event.preventDefault();
              setDragActive(true);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={drop}
          >
            <strong>Upload health record</strong>
            <span>Drop an image or PDF here</span>
            <span>or click to choose a file</span>
            <small>Images and PDF only</small>
          </button>
        ) : (
          <div className="lp-health-file-preview">
            {file.type.startsWith("image/") && previewUrl ? (
              <img src={previewUrl} alt="" />
            ) : (
              <div className="lp-health-pdf-icon">
                <FileText aria-hidden="true" focusable="false" size={28} />
              </div>
            )}
            <span>
              <Text as="b" size="md" weight="semibold">{file.name}</Text>
              <Text as="small" size="sm">{file.type === "application/pdf" ? "PDF" : "Image"}</Text>
            </span>
            <Button size="sm" variant="tertiary" type="button" disabled={processing} onClick={() => inputRef.current?.click()}>
              Change
            </Button>
            <Button size="sm" iconOnly variant="tertiary"
              type="button"
              disabled={processing}
              aria-label="Remove selected file"
              onClick={() => {
                setFile(null);
                setAnalysis(null);
                setReview(null);
                setError("");
                if (inputRef.current) inputRef.current.value = "";
              }}
            >
              ×
            </Button>
          </div>
        )}
        {!aiProcessingEnabled ? (
          <Text as="label" size="sm" weight="medium" className="lp-health-document-type">
            <span>Document type *</span>
            <SelectMenu
              value={type}
              onValueChange={(selectedValue) =>
                setType(selectedValue as HealthDocumentType)
              }
              options={healthDocumentTypes.map((documentType) => ({
                value: documentType,
                label: documentTypeLabels[documentType] ?? documentType,
              }))}
            />
          </Text>
        ) : null}
        {review ? <HealthUploadReview value={review} onChange={setReview} /> : null}
        {error ? <Text as="div" size="sm" weight="semibold" className="lp-health-form-error" tone="danger" role="alert">{error}</Text> : null}
        <footer>
          <Button variant="secondary" type="button" disabled={processing} onClick={onClose}>
            Cancel
          </Button>
          <Button loading={processing} variant="primary"
            type="button"
            disabled={!file || (!aiProcessingEnabled && !type) || processing}
            onClick={process}
          >
            <Upload aria-hidden="true" focusable="false" size={15} /> {processing ? "Processing..." : review ? "Save health record" : "Process"}
          </Button>
        </footer>
      </ModalPanel>
    </ModalBackdrop>
  );
}

export default AddRecordDialog;
