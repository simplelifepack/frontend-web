import { useEffect, useRef, useState, type DragEvent } from "react";
import { FileText, Upload, X } from "lucide-react";
import { btnGhost, btnPrimary } from "@/constants/theme";
import { isSupportedHealthFile } from "../healthUtils";
import type { HealthDocumentType } from "../types/health";

function AddRecordDialog({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (payload: {
    file: File;
    type: HealthDocumentType;
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
    if (!file || !type || processing) return;
    setProcessing(true);
    setError("");
    try {
      await onCreate({ file, type });
    } catch {
      setError("Unable to process health record. Try again.");
      setProcessing(false);
    }
  };

  return (
    <div
      className="lp-modal-backdrop"
      style={{ zIndex: 80 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="lp-modal-panel lp-health-add-dialog"
        role="dialog"
        aria-modal="true"
      >
        <header className="lp-health-dialog-head">
          <h2>Add health record</h2>
          <button type="button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
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
                <FileText size={28} />
              </div>
            )}
            <span>
              <b>{file.name}</b>
              <small>{file.type === "application/pdf" ? "PDF" : "Image"}</small>
            </span>
            <button type="button" onClick={() => inputRef.current?.click()}>
              Change
            </button>
            <button
              type="button"
              aria-label="Remove selected file"
              onClick={() => {
                setFile(null);
                setError("");
                if (inputRef.current) inputRef.current.value = "";
              }}
            >
              ×
            </button>
          </div>
        )}
        <label className="lp-health-document-type">
          <span>Document type</span>
          <select
            value={type}
            onChange={(event) =>
              setType(event.target.value as HealthDocumentType)
            }
          >
            <option value="lab_report">Lab Report</option>
            <option value="medical_report">Medical Report</option>
            <option value="prescription">Prescription</option>
          </select>
        </label>
        {error ? <div className="lp-health-form-error">{error}</div> : null}
        <footer>
          <button type="button" style={btnGhost} onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            style={btnPrimary}
            disabled={!file || !type || processing}
            onClick={process}
          >
            <Upload size={15} /> {processing ? "Processing..." : "Process"}
          </button>
        </footer>
      </div>
    </div>
  );
}

export default AddRecordDialog;
