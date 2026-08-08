import type { ReactNode } from "react";

import Card from "@/components/Card";
import { btnGold, T } from "@/constants/theme";
import { useAppSelector } from "@/store/hooks";

type ModuleKey = "health" | "wealth" | "trustCenter";

const copy: Record<ModuleKey, { title: string; requiredPlan: string; benefits: string[] }> = {
  health: {
    title: "Unlock Health",
    requiredPlan: "Family",
    benefits: ["Medical records", "Prescriptions", "Lab reports", "Vaccinations", "Secure family and emergency sharing"],
  },
  wealth: {
    title: "Unlock Wealth",
    requiredPlan: "Plus",
    benefits: ["Financial documents", "Insurance", "Loans", "Investments", "Future readiness features"],
  },
  trustCenter: {
    title: "Unlock Trust Center",
    requiredPlan: "Family",
    benefits: ["Trusted family members", "Data visibility controls", "Emergency access", "Secure family sharing"],
  },
};

export default function PlanGate({ module, children }: { module: ModuleKey; children: ReactNode }) {
  const entitlements = useAppSelector((state) => state.auth.entitlements);
  if (entitlements?.rules.modules[module]) return children;

  const detail = copy[module];
  return (
    <Card style={{ maxWidth: 560, margin: "72px auto", textAlign: "center" }}>
      <div style={{ color: T.gold, fontSize: 12, fontWeight: 800, letterSpacing: 0.5, textTransform: "uppercase" }}>
        {detail.requiredPlan} plan required
      </div>
      <h1 style={{ color: T.white, margin: "10px 0 8px", fontSize: 28 }}>{detail.title}</h1>
      <p style={{ color: T.muted, fontSize: 14, lineHeight: 1.6, margin: "0 auto 18px", maxWidth: 440 }}>
        Current plan: {entitlements?.plan.name ?? "Freemium"}. Upgrade to organize this area of your LifePack.
      </p>
      <div style={{ display: "grid", gap: 8, marginBottom: 20, textAlign: "left" }}>
        {detail.benefits.map((benefit) => (
          <span key={benefit} style={{ color: T.text, fontSize: 13.5, padding: "9px 11px", background: T.raised, borderRadius: 8 }}>
            {benefit}
          </span>
        ))}
      </div>
      <button type="button" style={{ ...btnGold, justifyContent: "center" }}>
        Upgrade to {detail.requiredPlan}
      </button>
    </Card>
  );
}
