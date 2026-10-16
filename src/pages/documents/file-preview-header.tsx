import { Text, Button } from "@/design-system";

import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Plus, RefreshCcw, Trash2 } from "lucide-react";
import type { RefObject } from "react";

import { T } from "@/constants/theme";
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
    <div style={{ padding: "var(--space-s12) var(--space-s16)", borderBottom: `1px solid ${T.border}`, display: "grid", gap: "var(--space-s10)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-s10)", flexWrap: "wrap", alignItems: "center" }}>
        <Text as="div" size="md" weight="semibold" style={{ color: T.white }}>{pageTitle}</Text>
        <div style={{ display: "flex", gap: "var(--space-s6)", flexWrap: "wrap" }}>
          <Button variant="secondary" type="button" disabled={!canPrevious || Boolean(busy)} onClick={onPrevious}><ChevronLeft aria-hidden="true" focusable="false" size={15} /> Previous</Button>
          <Button variant="secondary" type="button" disabled={!canNext || Boolean(busy)} onClick={onNext}>Next <ChevronRight aria-hidden="true" focusable="false" size={15} /></Button>
          <Button variant="secondary" type="button" disabled={!canMoveUp || Boolean(busy)} onClick={onMoveUp}><ArrowUp aria-hidden="true" focusable="false" size={15} /> Move</Button>
          <Button variant="secondary" type="button" disabled={!canMoveDown || Boolean(busy)} onClick={onMoveDown}><ArrowDown aria-hidden="true" focusable="false" size={15} /> Move</Button>
          <Button variant="secondary" type="button" disabled={Boolean(busy)} onClick={() => replaceInputRef.current?.click()}><RefreshCcw aria-hidden="true" focusable="false" size={15} /> Replace</Button>
          <Button tone="danger" variant="secondary" type="button" disabled={!canDelete || Boolean(busy)} onClick={onDelete}><Trash2 aria-hidden="true" focusable="false" size={15} /> Delete page</Button>
          <Button variant="primary" type="button" disabled={Boolean(busy)} onClick={() => addInputRef.current?.click()}><Plus aria-hidden="true" focusable="false" size={15} /> Add pages</Button>
        </div>
      </div>
      <Text as="div" size="sm" tone="muted" style={{ color: T.muted }}>{originalName}</Text>
      <input ref={addInputRef} type="file" multiple accept={acceptedDocumentTypes} onChange={(event) => onAddSelected(event.target.files)} style={{ display: "none" }} />
      <input ref={replaceInputRef} type="file" accept={acceptedDocumentTypes} onChange={(event) => onReplaceSelected(event.target.files?.[0])} style={{ display: "none" }} />
      <PendingPagesSelection busy={busy} pendingError={pendingError} previews={pendingPreviews} onAdd={onAddPages} onClear={onClearPending} onRemove={onRemovePending} />
    </div>
  );
}
