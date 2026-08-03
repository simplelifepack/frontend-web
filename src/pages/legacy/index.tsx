import { useState } from "react";
import { Clock, KeyRound, ShieldCheck } from "lucide-react";

import Card from "@/components/Card";
import Pill from "@/components/Pill";
import SectionHead from "@/components/SectionHead";
import { btnDanger, btnGhost, T } from "@/constants/theme";

export default function LegacyPage() {
  const [armed, setArmed] = useState(false);

  return (
    <div className="lp-route lp-legacy-route">
      <SectionHead title="Legacy handoff" sub="Make sure nothing is lost if you are gone, without giving it away early." />

      <Card style={{ marginBottom: 16, background: "linear-gradient(135deg,#131C2E,#1B2740)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ width: 46, height: 46, borderRadius: 14, display: "grid", placeItems: "center", background: "rgba(217,184,106,.14)" }}>
            <ShieldCheck size={22} color={T.gold} />
          </span>
          <div>
            <div style={{ color: T.white, fontSize: 17, fontWeight: 800 }}>A controlled family handoff</div>
            <div style={{ color: T.muted, fontSize: 13, marginTop: 4 }}>Nothing is released without the trigger, reminders, and grace period you define.</div>
          </div>
        </div>
      </Card>

      {armed ? (
        <div
          style={{
            background: "rgba(232,115,106,0.12)",
            border: "1px solid rgba(232,115,106,0.4)",
            color: T.coral,
            borderRadius: 12,
            padding: "12px 16px",
            marginBottom: 16,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          SOS armed. Emergency contacts notified and the grace period has started.
        </div>
      ) : null}

      <div className="lp-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Clock size={16} color={T.mint} />
            <span style={{ fontWeight: 700, color: T.white, fontSize: 14 }}>Inactivity trigger</span>
            <span style={{ marginLeft: "auto" }}>
              <Pill tone="ready">active</Pill>
            </span>
          </div>
          <div style={{ color: T.muted, fontSize: 13, lineHeight: 1.7 }}>
            Check in every 30 days, then a 14 day grace period with reminders before anything is shared.
          </div>
        </Card>

        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <KeyRound size={16} color={T.gold} />
            <span style={{ fontWeight: 700, color: T.white, fontSize: 14 }}>Emergency SOS</span>
          </div>
          <div style={{ color: T.muted, fontSize: 13, lineHeight: 1.7, marginBottom: 12 }}>Trigger the handoff yourself, right now.</div>
          <button onClick={() => setArmed((current) => !current)} style={armed ? btnGhost : btnDanger}>
            {armed ? "Cancel SOS" : "Arm SOS"}
          </button>
        </Card>
      </div>

      <div style={{ color: T.faint, fontSize: 12, lineHeight: 1.6 }}>
        This handoff shares documents. It is not a will and does not override succession law.
      </div>
    </div>
  );
}
