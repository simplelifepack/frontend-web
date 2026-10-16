import { Heading, Text, ModalBackdrop, ModalPanel, Select, Button } from "@/design-system";

import { useEffect, useRef, useState, type DragEvent } from "react";
import { FileText, Upload, X } from "lucide-react";

import { isSupportedHealthFile } from "../healthUtils";
import { healthDocumentTypes, type HealthDocumentType } from "../types/health";
import { documentTypeLabels } from "../healthUtils";

function AddRecordDialog({
  onClose,
  onCreate,
  aiProcessingEnabled,
}: {
  onClose: () => void;
  aiProcessingEnabled: boolean;
  onCreate: (payload: {
    file: File;
    type?: HealthDocumentType;
  }) => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
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
    if (!candidate) return;
    if (!isSupportedHealthFile(candidate)) {
      setError("Only images and PDF files are supported.");
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
    if (!file || (!aiProcessingEnabled && !type) || processing) return;
    setProcessing(true);
    setError("");
    try {
      await onCreate({ file, type: aiProcessingEnabled ? undefined : type });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to process health record. Try again.",
      );
      setProcessing(false);
    }
  };

  return (
    <ModalBackdrop

      style={{ zIndex: "var(--layer-drawer)" }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <ModalPanel onDismiss={onClose}
        className="lp-health-add-dialog"
        role="dialog"
        aria-modal="true"
      >
        <header className="lp-health-dialog-head">
          <Heading level={2} size="md">Add health record</Heading>
          <Button size="sm" iconOnly variant="tertiary" type="button" onClick={onClose} aria-label="Close">
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
            onClick={() => inputRef.current?.click()}
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
            <Button size="sm" variant="tertiary" type="button" onClick={() => inputRef.current?.click()}>
              Change
            </Button>
            <Button size="sm" iconOnly variant="tertiary"
              type="button"
              aria-label="Remove selected file"
              onClick={() => {
                setFile(null);
                setError("");
                if (inputRef.current) inputRef.current.value = "";
              }}
            >
              ×
            </Button>
          </div>
        )}
        {!aiProcessingEnabled ? (
          <Text as="label" size="sm" weight="semibold" className="lp-health-document-type">
            <span>Document type *</span>
            <Select
              value={type}
              onChange={(event) =>
                setType(event.target.value as HealthDocumentType)
              }
            >
              {healthDocumentTypes.map((documentType) => (
                <option key={documentType} value={documentType}>
                  {documentTypeLabels[documentType] ?? documentType}
                </option>
              ))}
            </Select>
          </Text>
        ) : null}
        {error ? <Text as="div" size="sm" weight="semibold" className="lp-health-form-error" tone="danger" role="alert">{error}</Text> : null}
        <footer>
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={processing} variant="primary"
            type="button"
            disabled={!file || (!aiProcessingEnabled && !type) || processing}
            onClick={process}
          >
            <Upload aria-hidden="true" focusable="false" size={15} /> {processing ? "Processing..." : "Process"}
          </Button>
        </footer>
      </ModalPanel>
    </ModalBackdrop>
  );
}

export default AddRecordDialog;
