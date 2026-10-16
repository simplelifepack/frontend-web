import { Text, Card } from "@/design-system";

import type { ReactNode } from "react";

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
      <Card flush style={{ overflow: "hidden" }}>
        {header}
        <Text as="div" size="md" style={{ background: T.navy, display: "grid", placeItems: "center", maxHeight: 620, overflow: "auto" }}>
          {previewStatus ?? <img src={previewUrl!} alt={alt} decoding="async" style={{ maxWidth: "100%", height: "auto", display: "block" }} />}
        </Text>
      </Card>
    );
  }

  if (mimeType === "application/pdf") {
    return (
      <Card flush style={{ overflow: "hidden" }}>
        {header}
        {previewStatus ?? <iframe src={previewUrl!} title={alt} style={{ width: "100%", height: 640, border: "none", background: T.raised }} />}
      </Card>
    );
  }

  if (mimeType.startsWith("text/") || mimeType.includes("rtf")) {
    return (
      <Card>
        <Text as="div" size="md" weight="semibold" style={{ color: T.white, marginBottom: "var(--space-s12)" }}>File preview</Text>
        <Text as="pre" size="sm" style={{ margin: 0, maxHeight: 460, overflow: "auto", whiteSpace: "pre-wrap", color: T.text, background: T.raised, border: `1px solid ${T.border}`, borderRadius: "var(--radius-s10)", padding: "var(--space-s12)" }}>
          {rawExtractedText || "No text preview available."}
        </Text>
      </Card>
    );
  }

  return (
    <Card>
      <Text as="div" size="md" weight="semibold" style={{ color: T.white, marginBottom: "var(--space-s8)" }}>File preview</Text>
      <Text as="div" size="md" tone="muted" style={{ color: T.muted }}>
        Inline preview is not available for this file type. Use Download to open the original file.
      </Text>
    </Card>
  );
}
