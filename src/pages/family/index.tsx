import type { CSSProperties, FormEvent } from "react";
import { useEffect, useState } from "react";
import { CalendarDays, Mail, Plus, ShieldCheck, UserRound, Users, X } from "lucide-react";

import Card from "@/components/Card";
import SectionHead from "@/components/SectionHead";
import { api, type TrustCenterResponse, type TrustMember, type TrustMemberPayload, type TrustPermission } from "@/lib/api";
import { btnGhost, btnPrimary, T } from "@/constants/theme";

const accessLabels = { FAMILY_MEMBER: "Full member", EMERGENCY_ACCESS: "Emergency access", VIEW_ONLY: "View only" };
const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"] as const;
const relationOptions = [
  ["SPOUSE", "Spouse"], ["PARENT", "Father"], ["PARENT", "Mother"], ["CHILD", "Son"], ["CHILD", "Daughter"],
  ["SIBLING", "Sibling"], ["PARENT", "Parent"], ["OTHER", "Other"],
] as const;

function permissions(accessTypeCode: TrustMemberPayload["accessTypeCode"]): TrustPermission[] {
  const full = accessTypeCode === "FAMILY_MEMBER";
  const emergency = accessTypeCode === "EMERGENCY_ACCESS";
  return [
    { module: "DOCUMENTS", canView: true, canDownload: full },
    { module: "HEALTH", canView: full, canDownload: false },
    { module: "WEALTH", canView: full || emergency, canDownload: full || emergency },
  ];
}

export default function FamilyPage() {
  const [data, setData] = useState<TrustCenterResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const load = async () => {
    setLoading(true); setError("");
    try { setData(await api.trust.get()); } catch (err) { setError(err instanceof Error ? err.message : "Unable to load family members."); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);
  const members = data?.members ?? [];
  return (
    <div className="lp-route lp-family-route">
      <SectionHead title="Manage Family Members" sub="Create family profiles and choose who can receive trusted access." />
      <Card style={{ marginBottom: 14, background: "linear-gradient(135deg,var(--lp-panel),var(--lp-raised))" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
          <span style={heroIcon}><Users size={22} color={T.mint} /></span>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ color: T.white, fontSize: 17, fontWeight: 800 }}>{members.length} family {members.length === 1 ? "member" : "members"}</div>
            <div style={{ color: T.muted, fontSize: 13, marginTop: 4 }}>Profiles are saved to your account and can be used for Wealth SOS handoff.</div>
          </div>
          <button type="button" style={btnPrimary} onClick={() => setAdding(true)}><Plus size={15} /> Add Member</button>
        </div>
      </Card>
      {error ? <Card><b style={{ color: T.coral }}>{error}</b><button type="button" style={{ ...btnGhost, marginTop: 12 }} onClick={() => void load()}>Retry</button></Card> : null}
      {loading ? <Card><p style={muted}>Loading family members...</p></Card> : null}
      {!loading && !members.length ? <EmptyState onAdd={() => setAdding(true)} /> : null}
      {!loading && members.length ? <MemberList members={members} /> : null}
      {adding ? <AddMemberForm onClose={() => setAdding(false)} onCreated={async () => { setAdding(false); await load(); }} /> : null}
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return <Card style={{ textAlign: "center", padding: 36 }}><Users size={32} color={T.action} /><h2 style={{ color: T.white, margin: "12px 0 6px", fontSize: 18 }}>No family members yet</h2><p style={{ ...muted, margin: "0 auto 18px", maxWidth: 420 }}>Add family profiles so Readiness knows who can step in for health, wealth, and emergency workflows.</p><button type="button" style={btnPrimary} onClick={onAdd}><Plus size={15} /> Add Member</button></Card>;
}

function MemberList({ members }: { members: TrustMember[] }) {
  return <Card style={{ padding: 0, overflow: "hidden" }}>{members.map((member, index) => <div key={member.id} className="lp-trust-member" style={{ borderTop: index ? `1px solid ${T.border}` : "none" }}><span>{member.name.charAt(0)}</span><div style={{ flex: 1, minWidth: 190 }}><div>{member.name} <small>· {member.relationLabel}</small></div><small><Mail size={12} /> {member.email}</small></div><Info icon={ShieldCheck} text={member.accessType.name} /><Info icon={CalendarDays} text={member.dateOfBirth} /><Info icon={UserRound} text={member.bloodGroup} /></div>)}</Card>;
}

function Info({ icon: Icon, text }: { icon: typeof ShieldCheck; text: string }) {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: T.muted, fontSize: 12 }}><Icon size={14} /> {text}</span>;
}

function AddMemberForm({ onClose, onCreated }: { onClose: () => void; onCreated: () => Promise<void> }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState({ name: "", email: "", relationKey: "SPOUSE:Spouse", accessTypeCode: "FAMILY_MEMBER", dateOfBirth: "", bloodGroup: "O+" });
  const update = (patch: Partial<typeof draft>) => setDraft((current) => ({ ...current, ...patch }));
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setSaving(true); setError("");
    const [relation, label] = draft.relationKey.split(":") as [TrustMemberPayload["relation"], string];
    try {
      await api.trust.addFamilyMember({ name: draft.name, email: draft.email, relation, customRelation: label, dateOfBirth: draft.dateOfBirth, bloodGroup: draft.bloodGroup as TrustMemberPayload["bloodGroup"], accessTypeCode: draft.accessTypeCode as TrustMemberPayload["accessTypeCode"], permissions: permissions(draft.accessTypeCode as TrustMemberPayload["accessTypeCode"]) });
      await onCreated();
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to create family profile."); }
    finally { setSaving(false); }
  };
  return <div style={scrim} onClick={onClose}><form style={modal} onClick={(event) => event.stopPropagation()} onSubmit={submit}><div style={head}><b style={{ color: T.white, fontSize: 18 }}>Add a family member</b><button type="button" style={{ ...btnGhost, padding: 8 }} onClick={onClose} aria-label="Close"><X size={16} /></button></div><label style={label}>Name<input required style={input} value={draft.name} onChange={(e) => update({ name: e.target.value })} /></label><label style={label}>Email<input required type="email" style={input} value={draft.email} onChange={(e) => update({ email: e.target.value })} /></label><div style={grid}><label style={label}>Relation<select style={input} value={draft.relationKey} onChange={(e) => update({ relationKey: e.target.value })}>{relationOptions.map(([value, label]) => <option key={`${value}:${label}`} value={`${value}:${label}`}>{label}</option>)}</select></label><label style={label}>Access<select style={input} value={draft.accessTypeCode} onChange={(e) => update({ accessTypeCode: e.target.value })}>{Object.entries(accessLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></div><div style={grid}><label style={label}>Date of birth<input required type="date" style={input} value={draft.dateOfBirth} onChange={(e) => update({ dateOfBirth: e.target.value })} /></label><label style={label}>Blood group<select style={input} value={draft.bloodGroup} onChange={(e) => update({ bloodGroup: e.target.value })}>{bloodGroups.map((blood) => <option key={blood} value={blood}>{blood}</option>)}</select></label></div>{error ? <p style={{ color: T.coral, fontSize: 12 }}>{error}</p> : null}<button type="submit" disabled={saving} style={{ ...btnPrimary, width: "100%", justifyContent: "center", marginTop: 12 }}>{saving ? "Creating..." : "Create profile"}</button></form></div>;
}

const muted: CSSProperties = { color: T.muted, fontSize: 13, lineHeight: 1.6 };
const heroIcon: CSSProperties = { width: 46, height: 46, borderRadius: 14, display: "grid", placeItems: "center", background: "color-mix(in srgb, var(--lp-mint) 14%, transparent)" };
const grid: CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 };
const input: CSSProperties = { width: "100%", marginTop: 5, marginBottom: 10, background: T.raised, border: `1px solid ${T.border}`, borderRadius: 9, padding: "9px 11px", color: T.text, fontSize: 14 };
const label: CSSProperties = { display: "block", color: T.muted, fontSize: 11, fontWeight: 800, letterSpacing: 0.5, textTransform: "uppercase" };
const head: CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 };
const modal: CSSProperties = { width: "min(460px,100%)", background: T.panel, border: `1px solid ${T.border}`, borderRadius: 16, padding: 18 };
const scrim: CSSProperties = { position: "fixed", inset: 0, zIndex: 70, display: "flex", alignItems: "center", justifyContent: "center", padding: 18, background: "var(--lpv-scrim)" };
