import { useEffect, useState } from "react";

import Card from "@/components/Card";
import { T } from "@/constants/theme";
import { api, type DocumentRecord } from "@/lib/api";

type FilePreviewProps = {
  doc: DocumentRecord;
  rawExtractedText: string;
};

export default function FilePreview({
  doc,
  rawExtractedText,
}: FilePreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const mimeType = doc.mimeType.toLowerCase();

  useEffect(() => {
    if (doc.source === "GOOGLE_DRIVE") return;
    if (!mimeType.startsWith("image/") && mimeType !== "application/pdf") return;
    let active = true;
    let objectUrl: string | null = null;
    setPreviewUrl(null);
    setPreviewError(null);
    void api.documents.preview(doc.id).then(({ blob }) => {
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
  }, [doc.id, doc.source, mimeType]);

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

  const previewStatus = previewError ? (
    <div style={{ color: T.coral, padding: 20 }}>{previewError}</div>
  ) : !previewUrl ? (
    <div style={{ color: T.muted, padding: 20 }}>Loading preview...</div>
  ) : null;

  if (mimeType.startsWith("image/")) {
    return (
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div
          style={{
            padding: "12px 16px",
            borderBottom: `1px solid ${T.border}`,
            color: T.white,
            fontWeight: 800,
          }}
        >
          File preview
        </div>
        <div
          style={{
            background: "#07101f",
            display: "grid",
            placeItems: "center",
            maxHeight: 620,
            overflow: "auto",
          }}
        >
          {previewStatus ?? (
            <img
              src={previewUrl!}
              alt={doc.originalName}
              decoding="async"
              style={{ maxWidth: "100%", height: "auto", display: "block" }}
            />
          )}
        </div>
      </Card>
    );
  }

  if (mimeType === "application/pdf") {
    return (
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div
          style={{
            padding: "12px 16px",
            borderBottom: `1px solid ${T.border}`,
            color: T.white,
            fontWeight: 800,
          }}
        >
          File preview
        </div>
        {previewStatus ?? (
          <iframe
            src={previewUrl!}
            title={doc.originalName}
            style={{ width: "100%", height: 640, border: "none", background: T.raised }}
          />
        )}
      </Card>
    );
  }

  if (mimeType.startsWith("text/") || mimeType.includes("rtf")) {
    return (
      <Card>
        <div style={{ color: T.white, fontWeight: 800, marginBottom: 12 }}>
          File preview
        </div>
        <pre
          style={{
            margin: 0,
            maxHeight: 460,
            overflow: "auto",
            whiteSpace: "pre-wrap",
            color: T.text,
            background: T.raised,
            border: `1px solid ${T.border}`,
            borderRadius: 10,
            padding: 12,
            fontSize: 12,
          }}
        >
          {rawExtractedText || "No text preview available."}
        </pre>
      </Card>
    );
  }

  return (
    <Card>
      <div style={{ color: T.white, fontWeight: 800, marginBottom: 8 }}>
        File preview
      </div>
      <div style={{ color: T.muted, fontSize: 13, lineHeight: 1.6 }}>
        Inline preview is not available for this file type. Use Download to
        open the original file.
      </div>
    </Card>
  );
}
