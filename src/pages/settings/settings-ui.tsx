import type { CSSProperties, ReactNode } from "react";
import { ChevronRight, X } from "lucide-react";

import Card from "@/components/Card";
import { btnGhost, T } from "@/constants/theme";

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
    <div style={{ marginBottom: 20 }}>
      <div style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 1.2,
        textTransform: "uppercase",
        color: danger ? T.coral : T.faint,
        fontFamily: "ui-monospace, monospace",
        margin: "0 0 8px 2px",
      }}>
        {label}
      </div>
      <Card style={{ padding: 0, overflow: "hidden", borderColor: danger ? T.coralBorder : T.border }}>
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
  icon: React.ComponentType<{ size?: number; color?: string }>;
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
        gap: 12,
        padding: "13px 16px",
        border: 0,
        borderTop: first ? "none" : `1px solid ${T.border}`,
        background: "none",
        cursor: onClick ? "pointer" : "default",
        textAlign: "left",
      }}
    >
      <Icon size={16} color={danger ? T.coral : T.muted} />
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 14, fontWeight: 600, color: danger ? T.coral : T.text }}>
          {label}
        </span>
        {sub ? <span style={{ display: "block", fontSize: 12, color: T.muted, marginTop: 1 }}>{sub}</span> : null}
      </span>
      {value ? <span style={{ fontSize: 12.5, color: T.muted, fontFamily: "ui-monospace, monospace" }}>{value}</span> : null}
      {onClick ? <ChevronRight size={14} color={T.faint} /> : null}
    </button>
  );
}

export function Overlay({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <div onClick={onClose} style={{
      position: "fixed",
      inset: 0,
      zIndex: 70,
      background: "var(--lpv-scrim)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 18,
    }}>
      <div onClick={(event) => event.stopPropagation()} style={{
        background: T.panel,
        border: `1px solid ${T.border}`,
        borderRadius: 16,
        width: "min(480px,100%)",
        maxHeight: "86vh",
        overflowY: "auto",
        padding: 22,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <b style={{ color: T.white, fontSize: 17 }}>{title}</b>
          <button type="button" onClick={onClose} style={{ ...btnGhost, padding: 8 }} aria-label="Close">
            <X size={15} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export const settingsInputStyle: CSSProperties = {
  width: "100%",
  background: "transparent",
  border: "none",
  borderBottom: `1px solid ${T.border}`,
  padding: "2px 0 5px",
  color: T.white,
  fontSize: 15,
  fontWeight: 600,
  outline: "none",
};

export function TextBlock({ title, body, divided }: { title: string; body: string; divided: boolean }) {
  return (
    <div style={{ padding: "10px 0", borderTop: divided ? `1px solid ${T.border}` : "none" }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{title}</div>
      <div style={{ fontSize: 12.5, color: T.muted, marginTop: 4, lineHeight: 1.6 }}>{body}</div>
    </div>
  );
}
