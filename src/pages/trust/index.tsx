import { Check, Circle, Download, Eye, LockKeyhole, Plus, ShieldCheck, Trash2, Users } from "lucide-react";

import Card from "@/components/Card";
import Pill from "@/components/Pill";
import SectionHead from "@/components/SectionHead";
import { btnDanger, btnGhost, T } from "@/constants/theme";

export default function TrustPage() {
  const members = [
    { name: "Alex Morgan", relation: "Self", access: "Owner" },
    { name: "Jaya", relation: "Spouse", access: "Full member" },
    { name: "Veena", relation: "Sister", access: "Emergency access" },
    { name: "Aarav", relation: "Son", access: "View only" },
  ];
  const posture: { label: string; on: boolean }[] = [
    { label: "Zero knowledge encryption", on: true },
    { label: "Recovery key set", on: true },
    { label: "India data residency", on: true },
    { label: "Two factor on sensitive actions", on: false },
  ];

  return (
    <div className="lp-route lp-trust-route">
      <SectionHead
        title="Trust center"
        sub="In plain language: what is protected, who is in your archive, and what each person can reach."
        action={null}
      />

      <div className="lp-stat-grid lp-trust-stats">
        {[
          { value: "Encrypted on device", label: "Your archive is encrypted locally. Even we cannot read it.", icon: LockKeyhole, color: T.mint },
          { value: "11 documents", label: "All stored in one private, searchable graph.", icon: ShieldCheck, color: T.mint },
          { value: `${members.length} people`, label: "Have some level of access, set by you.", icon: Users, color: T.mint },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <span><Icon size={18} color={color} /></span>
            <div>{value}</div>
            <p>{label}</p>
          </Card>
        ))}
      </div>

      <Card style={{ marginBottom: 16, padding: 0, overflow: "hidden" }}>
        <div className="lp-trust-family-head">
          <span>Family & access</span>
          <button type="button" style={btnGhost}><Plus size={15} /> Add member</button>
        </div>
        {members.map((member, index) => (
          <div key={member.name} className="lp-trust-member" style={{ borderTop: index || true ? `1px solid ${T.border}` : "none" }}>
            <span>{member.name[0]}</span>
            <div style={{ flex: 1 }}>
              <div>{member.name} <small>· {member.relation}</small></div>
            </div>
            <select aria-label={`${member.name} access`} defaultValue={member.access}>
              {["Owner", "Full member", "Emergency access", "View only"].map((access) => <option key={access}>{access}</option>)}
            </select>
          </div>
        ))}
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <ShieldCheck size={16} color={T.gold} />
          <span style={{ fontWeight: 700, color: T.white, fontSize: 14 }}>Security posture</span>
        </div>
        {posture.map((item, index) => (
          <div
            key={item.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 0",
              borderTop: index ? `1px solid ${T.border}` : "none",
            }}
          >
            {item.on ? <Check size={16} color={T.mint} /> : <Circle size={16} color={T.gold} />}
            <span style={{ flex: 1, color: T.text, fontSize: 13.5, fontWeight: 600 }}>{item.label}</span>
            {item.on ? <Pill tone="ready">on</Pill> : <Pill tone="warn">off</Pill>}
          </div>
        ))}
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <Eye size={16} color={T.gold} />
          <span style={{ fontWeight: 700, color: T.white, fontSize: 14 }}>Recent access</span>
        </div>
        <div style={{ color: T.muted, fontSize: 13 }}>
          <b style={{ color: T.text }}>Jaya</b> viewed HDFC term policy, 2h ago
        </div>
      </Card>

      <div style={{ display: "flex", gap: 10 }}>
        <button style={btnGhost}>
          <Download size={16} /> Export everything
        </button>
        <button style={btnDanger}>
          <Trash2 size={16} /> Delete account and data
        </button>
      </div>
    </div>
  );
}
