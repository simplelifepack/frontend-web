import type { ReactNode } from "react";

import Card from "@/components/Card";
import { T } from "@/constants/theme";

type FilePreviewContentProps = {
  alt: string;
  header: ReactNode;
  mimeType: string;
  previewStatus: ReactNode;
  previewUrl: string | null;
  rawExtractedText: string;
};

export default function FilePreviewContent({
  alt,
  header,
  mimeType,
  previewStatus,
  previewUrl,
  rawExtractedText,
}: FilePreviewContentProps) {
  if (mimeType.startsWith("image/")) {
    return (
      <Card style={{ padding: 0, overflow: "hidden" }}>
        {header}
        <div style={{ background: T.navy, display: "grid", placeItems: "center", maxHeight: 620, overflow: "auto" }}>
          {previewStatus ?? <img src={previewUrl!} alt={alt} decoding="async" style={{ maxWidth: "100%", height: "auto", display: "block" }} />}
        </div>
      </Card>
    );
  }

  if (mimeType === "application/pdf") {
    return (
      <Card style={{ padding: 0, overflow: "hidden" }}>
        {header}
        {previewStatus ?? <iframe src={previewUrl!} title={alt} style={{ width: "100%", height: 640, border: "none", background: T.raised }} />}
      </Card>
    );
  }

  if (mimeType.startsWith("text/") || mimeType.includes("rtf")) {
    return (
      <Card>
        <div style={{ color: T.white, fontWeight: 800, marginBottom: 12 }}>File preview</div>
        <pre style={{ margin: 0, maxHeight: 460, overflow: "auto", whiteSpace: "pre-wrap", color: T.text, background: T.raised, border: `1px solid ${T.border}`, borderRadius: 10, padding: 12, fontSize: 12 }}>
          {rawExtractedText || "No text preview available."}
        </pre>
      </Card>
    );
  }

  return (
    <Card>
      <div style={{ color: T.white, fontWeight: 800, marginBottom: 8 }}>File preview</div>
      <div style={{ color: T.muted, fontSize: 13, lineHeight: 1.6 }}>
        Inline preview is not available for this file type. Use Download to open the original file.
      </div>
    </Card>
  );
}
