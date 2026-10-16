import { Text, Button } from "@/design-system";

import { T } from "@/constants/theme";

type PendingPreview = {
  file: File;
  url: string | null;
};

type PendingPagesSelectionProps = {
  busy: string | null;
  pendingError: string | null;
  previews: PendingPreview[];
  onAdd: () => void;
  onClear: () => void;
  onRemove: (index: number) => void;
};

export default function PendingPagesSelection({
  busy,
  pendingError,
  previews,
  onAdd,
  onClear,
  onRemove,
}: PendingPagesSelectionProps) {
  const totalSize = previews.reduce((sum, item) => sum + item.file.size, 0);
  return (
    <div   style={{ display: "grid", gap: "var(--space-s8)" }}>
      {previews.length ? (
        <>
          <Text as="div" size="md" style={{ color: T.text }}>
            New pages: {previews.length} selected ({(totalSize / (1024 * 1024)).toFixed(2)} MB)
          </Text>
          <div   style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(128px,1fr))", gap: "var(--space-s10)" }}>
            {previews.map(({ file, url }, index) => (
              <div key={`${file.name}-${file.size}-${file.lastModified}`} style={{ display: "grid", gap: 7 }}>
                <Text as="div" size="sm" weight="semibold" tone="muted" style={{ color: T.muted }}>
                  New page {index + 1}
                </Text>
                {url ? (
                  <img
                    src={url}
                    alt={`New page ${index + 1}`}
                    style={{ width: "100%", aspectRatio: "4 / 3", objectFit: "contain", background: T.raised, border: `1px solid ${T.border}`, borderRadius: "var(--radius-compact)" }}
                  />
                ) : (
                  <Text as="div" size="sm" weight="semibold" style={{ aspectRatio: "4 / 3", display: "grid", placeItems: "center", padding: "var(--space-s8)", background: T.raised, border: `1px solid ${T.border}`, borderRadius: "var(--radius-compact)", color: T.white, textAlign: "center", wordBreak: "break-word" }}>
                    PDF<br /><span style={{ color: T.muted, fontWeight: "var(--weight-semibold)" }}>{file.name}</span>
                  </Text>
                )}
                <Button tone="danger" variant="secondary" type="button" disabled={Boolean(busy)} onClick={() => onRemove(index)}>
                  Remove
                </Button>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: "var(--space-s8)", flexWrap: "wrap" }}>
            <Button loading={Boolean(busy)} variant="primary" type="button" disabled={busy === "add"} onClick={onAdd}>
              {busy === "add" ? "Adding..." : "Add pages"}
            </Button>
            <Button variant="secondary" type="button" disabled={Boolean(busy)} onClick={onClear}>
              Clear
            </Button>
          </div>
        </>
      ) : null}
      {pendingError ? <Text as="div" size="md" tone="danger" role="alert" style={{ color: T.coral }}>{pendingError}</Text> : null}
    </div>
  );
}
