import type { CSSProperties, FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";

import Card from "@/components/Card";
import SectionHead from "@/components/SectionHead";
import { api, type TrustCenterResponse, type TrustMember, type TrustMemberPayload, type TrustPermission } from "@/lib/api";
import { btnDanger, btnGhost, btnPrimary, T } from "@/constants/theme";

type AccessCode = TrustMemberPayload["accessTypeCode"];
type Draft = { name: string; email: string; relationKey: string; accessTypeCode: AccessCode; dateOfBirth: string; bloodGroup: TrustMemberPayload["bloodGroup"] };

const accessLabels: Record<AccessCode, string> = { FAMILY_MEMBER: "Full member", EMERGENCY_ACCESS: "Emergency access", VIEW_ONLY: "View only" };
const avatarColors = [T.purple, T.teal, T.pink, "var(--lp-gold, #D8B95C)"];
const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"] as const;
const relationOptions = [
  ["SPOUSE", "Spouse"], ["PARENT", "Father"], ["PARENT", "Mother"], ["CHILD", "Son"], ["CHILD", "Daughter"],
  ["SIBLING", "Sibling"], ["PARENT", "Parent"], ["OTHER", "Other"],
] as const;

function permissions(accessTypeCode: AccessCode): TrustPermission[] {
  const full = accessTypeCode === "FAMILY_MEMBER";
  const emergency = accessTypeCode === "EMERGENCY_ACCESS";
  return [
    { module: "DOCUMENTS", canView: true, canDownload: full },
    { module: "HEALTH", canView: full, canDownload: false },
    { module: "WEALTH", canView: full || emergency, canDownload: full || emergency },
  ];
}

function draftFromMember(member?: TrustMember): Draft {
  return {
    name: member?.name ?? "",
    email: member?.email ?? "",
    relationKey: `${member?.relation ?? "SPOUSE"}:${member?.customRelation ?? member?.relationLabel ?? "Spouse"}`,
    accessTypeCode: (member?.accessType.id ?? "FAMILY_MEMBER") as AccessCode,
    dateOfBirth: member?.dateOfBirth ?? "",
    bloodGroup: (member?.bloodGroup ?? "O+") as TrustMemberPayload["bloodGroup"],
  };
}

export default function FamilyPage() {
  const [data, setData] = useState<TrustCenterResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sheet, setSheet] = useState<"add" | TrustMember | null>(null);
  const [confirm, setConfirm] = useState<TrustMember | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true); setError("");
    try { setData(await api.trust.get()); } catch (err) { setError(err instanceof Error ? err.message : "Unable to load family members."); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  const members = useMemo(() => data?.members ?? [], [data]);
  const primary = useMemo(() => members.find((member) => member.accessType.id === "FAMILY_MEMBER"), [members]);

  async function setAccess(member: TrustMember, accessTypeCode: AccessCode) {
    setBusyId(member.id); setError("");
    try {
      await api.trust.updateMember(member.id, { accessTypeCode, permissions: permissions(accessTypeCode) });
      if (accessTypeCode === "FAMILY_MEMBER") {
        await Promise.all(members.filter((item) => item.id !== member.id && item.accessType.id === "FAMILY_MEMBER").map((item) =>
          api.trust.updateMember(item.id, { accessTypeCode: "EMERGENCY_ACCESS", permissions: permissions("EMERGENCY_ACCESS") })));
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update emergency access.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="lp-route lp-family-route">
      <SectionHead title="Emergency access" sub="Who your holdings and documents go to if you use the SOS handoff." action={null} />
      <Card style={{ padding: 0, marginBottom: 16, overflow: "hidden" }}>
        <div style={intro}>
          <p style={copy}>The people your holdings and documents go to if you use the SOS handoff.</p>
          <button type="button" onClick={() => setSheet("add")} style={{ ...btnPrimary, minHeight: 44, whiteSpace: "nowrap" }}><Plus size={15} /> Add person</button>
        </div>
        {error ? <div style={errorBox}>{error}</div> : null}
        {loading ? <div style={empty}>Loading emergency access...</div> : null}
        {!loading && members.map((member) => (
          <MemberRow
            key={member.id}
            member={member}
            primaryId={primary?.id}
            busy={busyId === member.id}
            onEdit={() => setSheet(member)}
            onPrimary={() => void setAccess(member, "FAMILY_MEMBER")}
            onToggle={(checked) => void setAccess(member, checked ? (primary ? "EMERGENCY_ACCESS" : "FAMILY_MEMBER") : "VIEW_ONLY")}
          />
        ))}
        {!loading && !members.length ? <div style={empty}>Add the people who would step in. You can change or remove them any time.</div> : null}
      </Card>
      {sheet ? <PersonSheet person={sheet === "add" ? undefined : sheet} members={members} onClose={() => setSheet(null)} onSaved={async () => { setSheet(null); await load(); }} onRemove={(member) => { setSheet(null); setConfirm(member); }} /> : null}
      {confirm ? <ConfirmRemove member={confirm} onClose={() => setConfirm(null)} onRemoved={async () => { setConfirm(null); await load(); }} /> : null}
    </div>
  );
}

function MemberRow({ member, primaryId, busy, onEdit, onPrimary, onToggle }: { member: TrustMember; primaryId?: string; busy: boolean; onEdit: () => void; onPrimary: () => void; onToggle: (checked: boolean) => void }) {
  const access = member.accessType.id as AccessCode;
  const canStepIn = access === "FAMILY_MEMBER" || access === "EMERGENCY_ACCESS";
  const primary = member.id === primaryId && access === "FAMILY_MEMBER";
  const tone = avatarColors[Math.abs([...member.id].reduce((sum, char) => sum + char.charCodeAt(0), 0)) % avatarColors.length];
  return (
    <div style={{ ...memberRow, opacity: busy ? 0.64 : 1 }}>
      <span style={{ ...avatar, background: `color-mix(in srgb, ${tone} 22%, transparent)`, color: tone }}>{member.name.charAt(0).toUpperCase()}</span>
      <div style={memberIdentity}>
        <div style={memberName}>{member.name}<span style={relationText}> · {member.relationLabel}</span></div>
        {primary ? <div style={primaryText}>Primary</div> : null}
      </div>
      {canStepIn && !primary ? <button type="button" disabled={busy} onClick={onPrimary} style={miniButton}>Make primary</button> : null}
      <button type="button" onClick={onEdit} title={`Edit ${member.name}`} aria-label={`Edit ${member.name}`} style={iconButton}><Pencil size={15} /></button>
      <label style={toggleLabel}>
        <input type="checkbox" checked={canStepIn} disabled={busy} onChange={(event) => onToggle(event.target.checked)} style={checkbox} />
      </label>
    </div>
  );
}

function PersonSheet({ person, members, onClose, onSaved, onRemove }: { person?: TrustMember; members: TrustMember[]; onClose: () => void; onSaved: () => Promise<void>; onRemove: (member: TrustMember) => void }) {
  const [draft, setDraft] = useState<Draft>(() => draftFromMember(person));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const update = (patch: Partial<Draft>) => setDraft((current) => ({ ...current, ...patch }));
  async function submit(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError("");
    const [relation, customRelation] = draft.relationKey.split(":") as [TrustMemberPayload["relation"], string];
    const payload: TrustMemberPayload = {
      name: draft.name,
      email: draft.email,
      relation,
      customRelation,
      dateOfBirth: draft.dateOfBirth,
      bloodGroup: draft.bloodGroup,
      accessTypeCode: draft.accessTypeCode,
      permissions: permissions(draft.accessTypeCode),
    };
    try {
      if (person) await api.trust.updateMember(person.id, payload);
      else {
        if (draft.accessTypeCode === "FAMILY_MEMBER") await Promise.all(members.filter((member) => member.accessType.id === "FAMILY_MEMBER").map((member) => api.trust.updateMember(member.id, { accessTypeCode: "EMERGENCY_ACCESS", permissions: permissions("EMERGENCY_ACCESS") })));
        await api.trust.addFamilyMember(payload);
      }
      await onSaved();
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to save this person."); }
    finally { setSaving(false); }
  }
  return (
    <div style={scrim} onClick={onClose}>
      <form style={modal} onClick={(event) => event.stopPropagation()} onSubmit={submit}>
        <div style={head}><b>{person ? "Edit person" : "Add person"}</b><button type="button" style={iconButton} onClick={onClose} aria-label="Close"><X size={16} /></button></div>
        <label style={label}>Name<input required style={input} value={draft.name} onChange={(event) => update({ name: event.target.value })} /></label>
        <label style={label}>Email<input required type="email" style={input} value={draft.email} onChange={(event) => update({ email: event.target.value })} /></label>
        <div style={grid}><label style={label}>Relation<select style={input} value={draft.relationKey} onChange={(event) => update({ relationKey: event.target.value })}>{relationOptions.map(([value, text]) => <option key={`${value}:${text}`} value={`${value}:${text}`}>{text}</option>)}</select></label><label style={label}>Access<select style={input} value={draft.accessTypeCode} onChange={(event) => update({ accessTypeCode: event.target.value as AccessCode })}>{Object.entries(accessLabels).map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></label></div>
        <div style={grid}><label style={label}>Date of birth<input required type="date" style={input} value={draft.dateOfBirth} onChange={(event) => update({ dateOfBirth: event.target.value })} /></label><label style={label}>Blood group<select style={input} value={draft.bloodGroup} onChange={(event) => update({ bloodGroup: event.target.value as Draft["bloodGroup"] })}>{bloodGroups.map((blood) => <option key={blood} value={blood}>{blood}</option>)}</select></label></div>
        {error ? <p style={{ color: T.coral, fontSize: 12 }}>{error}</p> : null}
        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>{person ? <button type="button" style={btnDanger} onClick={() => onRemove(person)}><Trash2 size={15} /> Remove</button> : null}<button type="submit" disabled={saving} style={{ ...btnPrimary, flex: 1, justifyContent: "center" }}>{saving ? "Saving..." : "Save person"}</button></div>
      </form>
    </div>
  );
}

function ConfirmRemove({ member, onClose, onRemoved }: { member: TrustMember; onClose: () => void; onRemoved: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  async function remove() { setBusy(true); await api.trust.revokeMember(member.id); await onRemoved(); }
  return <div style={scrim} onClick={onClose}><div style={modal} onClick={(event) => event.stopPropagation()}><div style={head}><b>Remove {member.name.split(" ")[0]}?</b><button type="button" style={iconButton} onClick={onClose} aria-label="Close"><X size={16} /></button></div><p style={copy}>{member.name} will no longer be able to step in for emergency access. Their documents stay in Documents.</p><div style={{ display: "flex", gap: 10 }}><button type="button" style={btnGhost} onClick={onClose}>Cancel</button><button type="button" style={{ ...btnDanger, flex: 1, justifyContent: "center" }} disabled={busy} onClick={() => void remove()}>{busy ? "Removing..." : "Remove"}</button></div></div></div>;
}

const intro: CSSProperties = { minHeight: 92, padding: "18px 24px", display: "flex", alignItems: "center", gap: 16 };
const copy: CSSProperties = { flex: 1, minWidth: 0, fontSize: 14, fontWeight: 600, color: T.muted, margin: 0, lineHeight: 1.55 };
const empty: CSSProperties = { padding: 16, fontSize: 14, color: T.faint, borderTop: `1px solid ${T.border}` };
const errorBox: CSSProperties = { margin: "0 16px 14px", border: `1px solid ${T.coralBorder}`, borderRadius: 10, padding: 11, color: T.coral, fontSize: 12.5 };
const memberRow: CSSProperties = { minHeight: 78, display: "flex", alignItems: "center", gap: 14, padding: "14px 24px", borderTop: `1px solid ${T.border}` };
const avatar: CSSProperties = { width: 38, height: 38, display: "grid", placeItems: "center", borderRadius: 12, fontSize: 16, fontWeight: 800, flexShrink: 0 };
const memberIdentity: CSSProperties = { flex: 1, minWidth: 0 };
const memberName: CSSProperties = { color: T.white, fontSize: 13.5, fontWeight: 700, lineHeight: 1.25 };
const relationText: CSSProperties = { color: T.muted, fontWeight: 500 };
const primaryText: CSSProperties = { color: T.action, fontSize: 13, fontWeight: 800, marginTop: 3 };
const miniButton: CSSProperties = { ...btnGhost, padding: "0 14px", fontSize: 13, fontWeight: 750, minHeight: 42, borderRadius: 12, whiteSpace: "nowrap" };
const iconButton: CSSProperties = { ...btnGhost, padding: 0, width: 44, minHeight: 44, borderRadius: 12, justifyContent: "center" };
const toggleLabel: CSSProperties = { display: "inline-flex", alignItems: "center", minHeight: 36, cursor: "pointer" };
const checkbox: CSSProperties = { accentColor: T.action, width: 21, height: 21, cursor: "pointer" };
const grid: CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 };
const input: CSSProperties = { width: "100%", marginTop: 5, marginBottom: 10, background: T.raised, border: `1px solid ${T.border}`, borderRadius: 9, padding: "9px 11px", color: T.text, fontSize: 14 };
const label: CSSProperties = { display: "block", color: T.muted, fontSize: 11, fontWeight: 800, letterSpacing: 0.5, textTransform: "uppercase" };
const head: CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, color: T.white, fontSize: 18 };
const modal: CSSProperties = { width: "min(460px,100%)", maxHeight: "92vh", overflowY: "auto", background: T.panel, border: `1px solid ${T.border}`, borderRadius: 16, padding: 18 };
const scrim: CSSProperties = { position: "fixed", inset: 0, zIndex: 70, display: "flex", alignItems: "center", justifyContent: "center", padding: 18, background: "var(--lpv-scrim)" };
