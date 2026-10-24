import {
  Text,
  Heading,
  Card,
  Stack,
  MediaViewport,
  EmbeddedPreview,
  Preformatted,
  ScrollRegion,
} from "@/design-system";
import type { ReactNode } from "react";
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
  if (mimeType.startsWith("image/"))
    return (
      <Card flush>
        {header}
        <MediaViewport>
          {previewStatus ?? (
            <img src={previewUrl!} alt={alt} decoding="async" />
          )}
        </MediaViewport>
      </Card>
    );
  if (mimeType === "application/pdf")
    return (
      <Card flush>
        {header}
        {previewStatus ?? <EmbeddedPreview src={previewUrl!} title={alt} />}
      </Card>
    );
  return (
    <Card>
      <Stack $gap="s12">
        <Heading level={2} size="sm">
          File preview
        </Heading>
        {mimeType.startsWith("text/") || mimeType.includes("rtf") ? (
          <ScrollRegion $vertical>
            <Preformatted>
              {rawExtractedText || "No text preview available."}
            </Preformatted>
          </ScrollRegion>
        ) : (
          <Text tone="muted">
            Inline preview is not available for this file type. Use Download to
            open the original file.
          </Text>
        )}
      </Stack>
    </Card>
  );
}
