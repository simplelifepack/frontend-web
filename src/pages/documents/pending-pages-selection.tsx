import { T, btnGhost, btnPrimary } from "@/constants/theme";

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
    <div style={{ display: "grid", gap: 8 }}>
      {previews.length ? (
        <>
          <div style={{ color: T.text, fontSize: 13 }}>
            New pages: {previews.length} selected ({(totalSize / (1024 * 1024)).toFixed(2)} MB)
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(128px,1fr))", gap: 10 }}>
            {previews.map(({ file, url }, index) => (
              <div key={`${file.name}-${file.size}-${file.lastModified}`} style={{ display: "grid", gap: 7 }}>
                <div style={{ color: T.muted, fontSize: 12, fontWeight: 800 }}>
                  New page {index + 1}
                </div>
                {url ? (
                  <img
                    src={url}
                    alt={`New page ${index + 1}`}
                    style={{ width: "100%", aspectRatio: "4 / 3", objectFit: "contain", background: T.raised, border: `1px solid ${T.border}`, borderRadius: 8 }}
                  />
                ) : (
                  <div style={{ aspectRatio: "4 / 3", display: "grid", placeItems: "center", padding: 8, background: T.raised, border: `1px solid ${T.border}`, borderRadius: 8, color: T.white, fontSize: 12, fontWeight: 800, textAlign: "center", wordBreak: "break-word" }}>
                    PDF<br /><span style={{ color: T.muted, fontWeight: 600 }}>{file.name}</span>
                  </div>
                )}
                <button type="button" style={btnGhost} disabled={Boolean(busy)} onClick={() => onRemove(index)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" style={btnPrimary} disabled={busy === "add"} onClick={onAdd}>
              {busy === "add" ? "Adding..." : "Add pages"}
            </button>
            <button type="button" style={btnGhost} disabled={Boolean(busy)} onClick={onClear}>
              Clear
            </button>
          </div>
        </>
      ) : null}
      {pendingError ? <div role="alert" style={{ color: T.coral, fontSize: 13 }}>{pendingError}</div> : null}
    </div>
  );
}
