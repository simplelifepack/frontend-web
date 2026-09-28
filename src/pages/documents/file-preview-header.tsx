import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Plus, RefreshCcw, Trash2 } from "lucide-react";
import type { RefObject } from "react";

import { T, btnGhost, btnPrimary } from "@/constants/theme";
import PendingPagesSelection from "./pending-pages-selection";

type PendingPreview = {
  file: File;
  url: string | null;
};

type FilePreviewHeaderProps = {
  addInputRef: RefObject<HTMLInputElement | null>;
  busy: string | null;
  canDelete: boolean;
  canMoveDown: boolean;
  canMoveUp: boolean;
  canNext: boolean;
  canPrevious: boolean;
  originalName: string;
  pageTitle: string;
  pendingError: string | null;
  pendingPreviews: PendingPreview[];
  replaceInputRef: RefObject<HTMLInputElement | null>;
  onAddPages: () => void;
  onAddSelected: (files: FileList | null) => void;
  onClearPending: () => void;
  onDelete: () => void;
  onMoveDown: () => void;
  onMoveUp: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onRemovePending: (index: number) => void;
  onReplaceSelected: (file: File | undefined) => void;
};

const acceptedDocumentTypes = ".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf";

export default function FilePreviewHeader({
  addInputRef,
  busy,
  canDelete,
  canMoveDown,
  canMoveUp,
  canNext,
  canPrevious,
  originalName,
  pageTitle,
  pendingError,
  pendingPreviews,
  replaceInputRef,
  onAddPages,
  onAddSelected,
  onClearPending,
  onDelete,
  onMoveDown,
  onMoveUp,
  onNext,
  onPrevious,
  onRemovePending,
  onReplaceSelected,
}: FilePreviewHeaderProps) {
  return (
    <div style={{ padding: "12px 16px", borderBottom: `1px solid ${T.border}`, display: "grid", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ color: T.white, fontWeight: 800 }}>{pageTitle}</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <button type="button" style={btnGhost} disabled={!canPrevious || Boolean(busy)} onClick={onPrevious}><ChevronLeft size={15} /> Previous</button>
          <button type="button" style={btnGhost} disabled={!canNext || Boolean(busy)} onClick={onNext}>Next <ChevronRight size={15} /></button>
          <button type="button" style={btnGhost} disabled={!canMoveUp || Boolean(busy)} onClick={onMoveUp}><ArrowUp size={15} /> Move</button>
          <button type="button" style={btnGhost} disabled={!canMoveDown || Boolean(busy)} onClick={onMoveDown}><ArrowDown size={15} /> Move</button>
          <button type="button" style={btnGhost} disabled={Boolean(busy)} onClick={() => replaceInputRef.current?.click()}><RefreshCcw size={15} /> Replace</button>
          <button type="button" style={btnGhost} disabled={!canDelete || Boolean(busy)} onClick={onDelete}><Trash2 size={15} /> Delete page</button>
          <button type="button" style={btnPrimary} disabled={Boolean(busy)} onClick={() => addInputRef.current?.click()}><Plus size={15} /> Add pages</button>
        </div>
      </div>
      <div style={{ color: T.muted, fontSize: 12 }}>{originalName}</div>
      <input ref={addInputRef} type="file" multiple accept={acceptedDocumentTypes} onChange={(event) => onAddSelected(event.target.files)} style={{ display: "none" }} />
      <input ref={replaceInputRef} type="file" accept={acceptedDocumentTypes} onChange={(event) => onReplaceSelected(event.target.files?.[0])} style={{ display: "none" }} />
      <PendingPagesSelection busy={busy} pendingError={pendingError} previews={pendingPreviews} onAdd={onAddPages} onClear={onClearPending} onRemove={onRemovePending} />
    </div>
  );
}
