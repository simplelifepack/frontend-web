import { T } from "@/constants/theme";

export type LockedModuleKey = "health" | "wealth" | "trust";

const LOCKED_COPY: Record<LockedModuleKey, { title: string; requiredPlan: string; benefits: string[] }> = {
  health: { title: "Unlock Health", requiredPlan: "Paid", benefits: ["Medical records", "Prescriptions", "Lab reports", "Vaccinations", "Secure emergency sharing"] },
  wealth: { title: "Unlock Wealth", requiredPlan: "Paid", benefits: ["Financial documents", "Insurance", "Loans", "Investments", "Readiness planning"] },
  trust: { title: "Trust Center", requiredPlan: "Free", benefits: ["Trusted family members", "Data visibility controls", "Emergency access", "Secure family sharing"] },
};

export default function LockedUpgradeModal({
  module,
  currentPlan,
  onClose,
}: {
  module: LockedModuleKey;
  currentPlan: string;
  onClose: () => void;
}) {
  const detail = LOCKED_COPY[module];
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 80, display: "grid", placeItems: "center", padding: 18, background: "rgba(4,7,15,.64)" }}>
      <div onClick={(event) => event.stopPropagation()} style={{ width: "min(460px,100%)", background: T.panel, border: `1px solid ${T.border}`, borderRadius: 16, padding: 22 }}>
        <div style={{ color: T.gold, fontSize: 12, fontWeight: 800, textTransform: "uppercase" }}>{detail.requiredPlan} plan required</div>
        <h2 style={{ color: T.white, margin: "8px 0", fontSize: 24 }}>{detail.title}</h2>
        <p style={{ color: T.muted, fontSize: 13.5, lineHeight: 1.6 }}>Current tier: {currentPlan}. Upgrade to use this Readiness module.</p>
        <div style={{ display: "grid", gap: 8, margin: "16px 0" }}>
          {detail.benefits.map((benefit) => (
            <span key={benefit} style={{ color: T.text, background: T.raised, borderRadius: 8, padding: "9px 10px", fontSize: 13 }}>{benefit}</span>
          ))}
        </div>
        <button type="button" onClick={onClose} style={{ width: "100%", background: T.gold, border: 0, borderRadius: 10, padding: "11px 14px", color: "#10182A", fontWeight: 800, cursor: "pointer" }}>
          Upgrade to {detail.requiredPlan}
        </button>
      </div>
    </div>
  );
}
