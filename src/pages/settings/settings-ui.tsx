import { Text, ModalPanel, ModalBackdrop, Button, Card } from "@/design-system";

import type { CSSProperties, ReactNode } from "react";
import { ChevronRight, X, type LucideIcon } from "lucide-react";

import { T } from "@/constants/theme";

export function Section({
  label,
  children,
  danger = false,
}: {
  label: string;
  children: ReactNode;
  danger?: boolean;
}) {
  return (
    <div style={{ marginBottom: "var(--space-s20)" }}>
      <Text as="div" size="sm" weight="semibold" tone="muted" style={{ letterSpacing: 1.2, textTransform: "uppercase", color: danger ? T.coral : T.faint, margin: "0 0 var(--space-s8) 2px" }}>
        {label}
      </Text>
      <Card tone={danger ? "danger" : "default"} flush style={{ overflow: "hidden" }}>
        {children}
      </Card>
    </div>
  );
}

export function Row({
  icon: Icon,
  label,
  value,
  sub,
  onClick,
  danger = false,
  first = false,
}: {
  icon: LucideIcon;
  label: string;
  value?: string;
  sub?: string;
  onClick?: () => void;
  danger?: boolean;
  first?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: "var(--space-s12)",
        padding: "13px var(--space-s16)",
        border: 0,
        borderTop: first ? "none" : `1px solid ${T.border}`,
        background: "none",
        cursor: onClick ? "pointer" : "default",
        textAlign: "left",
      }}
    >
      <Icon aria-hidden="true" focusable="false" size="var(--icon-small)" color={danger ? T.coral : T.muted} />
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: "var(--text-md)", fontWeight: "var(--weight-semibold)", color: danger ? T.coral : T.text }}>
          {label}
        </span>
        {sub ? <span style={{ display: "block", fontSize: "var(--text-sm)", color: T.muted, marginTop: 1 }}>{sub}</span> : null}
      </span>
      {value ? <span style={{ fontSize: "var(--text-md)", color: T.muted }}>{value}</span> : null}
      {onClick ? <ChevronRight aria-hidden="true" focusable="false" size={14} color={T.faint} /> : null}
    </button>
  );
}

export function Overlay({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <ModalBackdrop onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: "var(--layer-overlay)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <ModalPanel onDismiss={onClose} aria-label="Settings confirmation" onClick={(event) => event.stopPropagation()} style={{ width: "min(480px,100%)", maxHeight: "86vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-s12)" }}>
          <Text as="b" size="lg" weight="semibold" style={{ color: T.white }}>{title}</Text>
          <Button iconOnly variant="tertiary" size="sm" type="button" onClick={onClose} aria-label="Close">
            <X aria-hidden="true" focusable="false" size={15} />
          </Button>
        </div>
        {children}
      </ModalPanel>
    </ModalBackdrop>
  );
}

export const settingsInputStyle: CSSProperties = { width: "100%" };

export function TextBlock({ title, body, divided }: { title: string; body: string; divided: boolean }) {
  return (
    <div style={{ padding: "var(--space-s10) 0", borderTop: divided ? `1px solid ${T.border}` : "none" }}>
      <Text as="div" size="md" weight="semibold" style={{ color: T.text }}>{title}</Text>
      <Text as="div" size="md" tone="muted" style={{ color: T.muted, marginTop: "var(--space-s4)" }}>{body}</Text>
    </div>
  );
}
