import { KeyRound, Plus, ShieldCheck, Users } from "lucide-react";

import Card from "@/components/Card";
import Pill from "@/components/Pill";
import SectionHead from "@/components/SectionHead";
import { btnGold, T, type Tone } from "@/constants/theme";

type Member = {
  name: string;
  rel: string;
  role: string;
  tone: Tone;
};

export default function FamilyPage() {
  const members: Member[] = [
    { name: "Jaya", rel: "Spouse", role: "Full member", tone: "ready" },
    { name: "Veena", rel: "Sister", role: "Emergency access", tone: "warn" },
    { name: "Aarav", rel: "Son", role: "Health and IDs", tone: "flat" },
  ];

  return (
    <div className="lp-route lp-family-route">
      <SectionHead title="Family" sub="A shared archive where each person sees only what they should." />

      <div className="lp-two-col" style={{ display: "grid", gridTemplateColumns: "1.3fr .7fr", gap: 12, marginBottom: 16 }}>
        <Card style={{ background: "linear-gradient(135deg,#131C2E,#1B2740)" }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <span style={{ width: 46, height: 46, borderRadius: 14, display: "grid", placeItems: "center", background: "rgba(79,203,149,.14)" }}>
              <Users size={22} color={T.mint} />
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ color: T.white, fontSize: 17, fontWeight: 800 }}>4 people in your Readiness account</div>
              <div style={{ color: T.muted, fontSize: 13, marginTop: 4 }}>Access stays scoped to each family member.</div>
            </div>
            <button style={btnGold}><Plus size={15} /> Add member</button>
          </div>
        </Card>
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 9, color: T.white, fontWeight: 800 }}>
            <ShieldCheck size={17} color={T.mint} /> Access posture
          </div>
          <div style={{ color: T.muted, fontSize: 13, marginTop: 9 }}>Every member has an explicit access level.</div>
        </Card>
      </div>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        {members.map((member, index) => (
          <div
            key={member.name}
            style={{
              display: "grid",
              gridTemplateColumns: "1.4fr 1.4fr 1fr",
              alignItems: "center",
              padding: "14px 16px",
              borderTop: index ? `1px solid ${T.border}` : "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 34, height: 34, borderRadius: 999, display: "grid", placeItems: "center", background: T.raised, color: T.gold, fontWeight: 800 }}>{member.name[0]}</span>
              <div>
              <div style={{ color: T.text, fontWeight: 700, fontSize: 13.5 }}>{member.name}</div>
              <div style={{ color: T.faint, fontSize: 11.5, marginTop: 2 }}>{member.rel}</div>
              </div>
            </div>
            <div style={{ color: T.muted, fontSize: 12.5, display: "flex", alignItems: "center", gap: 7 }}><KeyRound size={14} /> {member.role}</div>
            <div style={{ textAlign: "right" }}>
              <Pill tone={member.tone}>active</Pill>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
