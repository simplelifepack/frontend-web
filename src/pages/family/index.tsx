import { Text, Checkbox, ModalBackdrop, ModalPanel, Input, Select, Button, Card } from "@/design-system";

import type { CSSProperties, FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";

import SectionHead from "@/components/SectionHead";
import { api, type TrustCenterResponse, type TrustMember, type TrustMemberPayload, type TrustPermission } from "@/lib/api";
import { T } from "@/constants/theme";

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
      <Card flush style={{ marginBottom: "var(--space-s16)", overflow: "hidden" }}>
        <div style={intro}>
          <Text as="p" size="md" style={copy}>The people your holdings and documents go to if you use the SOS handoff.</Text>
          <Button variant="primary" size="lg" type="button" onClick={() => setSheet("add")} ><Plus aria-hidden="true" focusable="false" size={15} /> Add person</Button>
        </div>
        {error ? <Text as="div" size="md" style={errorBox}>{error}</Text> : null}
        {loading ? <Text as="div" size="md" style={empty}>Loading emergency access...</Text> : null}
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
        {!loading && !members.length ? <Text as="div" size="md" style={empty}>Add the people who would step in. You can change or remove them any time.</Text> : null}
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
      <Text size="md" style={{ ...avatar, background: `color-mix(in srgb, ${tone} 22%, transparent)`, color: tone }}>{member.name.charAt(0).toUpperCase()}</Text>
      <div style={memberIdentity}>
        <Text as="div" size="md" style={memberName}>{member.name}<span style={relationText}> · {member.relationLabel}</span></Text>
        {primary ? <Text as="div" size="md" style={primaryText}>Primary</Text> : null}
      </div>
      {canStepIn && !primary ? <Button variant="secondary" type="button" disabled={busy} onClick={onPrimary} >Make primary</Button> : null}
      <Button size="sm" iconOnly variant="tertiary" type="button" onClick={onEdit} title={`Edit ${member.name}`} aria-label={`Edit ${member.name}`} ><Pencil aria-hidden="true" focusable="false" size={15} /></Button>
      <Text as="label" size="md" style={toggleLabel}>
        <Checkbox type="checkbox" checked={canStepIn} disabled={busy} onChange={(event) => onToggle(event.target.checked)} style={checkbox} />
      </Text>
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
    <ModalBackdrop style={scrim} onClick={onClose}>
      <ModalPanel onDismiss={onClose} aria-label="Family access" as="form" style={modal} onClick={(event) => event.stopPropagation()} onSubmit={submit}>
        <div style={head}><Text as="b" size="md" weight="semibold">{person ? "Edit person" : "Add person"}</Text><Button size="sm" iconOnly variant="tertiary" type="button" onClick={onClose} aria-label="Close"><X aria-hidden="true" focusable="false" size="var(--icon-small)" /></Button></div>
        <Text as="label" size="md" style={label}>Name<Input required style={input} value={draft.name} onChange={(event) => update({ name: event.target.value })} /></Text>
        <Text as="label" size="md" style={label}>Email<Input required type="email" style={input} value={draft.email} onChange={(event) => update({ email: event.target.value })} /></Text>
        <div style={grid}><Text as="label" size="md" style={label}>Relation<Select style={input} value={draft.relationKey} onChange={(event) => update({ relationKey: event.target.value })}>{relationOptions.map(([value, text]) => <option key={`${value}:${text}`} value={`${value}:${text}`}>{text}</option>)}</Select></Text><Text as="label" size="md" style={label}>Access<Select style={input} value={draft.accessTypeCode} onChange={(event) => update({ accessTypeCode: event.target.value as AccessCode })}>{Object.entries(accessLabels).map(([value, text]) => <option key={value} value={value}>{text}</option>)}</Select></Text></div>
        <div style={grid}><Text as="label" size="md" style={label}>Date of birth<Input required type="date" style={input} value={draft.dateOfBirth} onChange={(event) => update({ dateOfBirth: event.target.value })} /></Text><Text as="label" size="md" style={label}>Blood group<Select style={input} value={draft.bloodGroup} onChange={(event) => update({ bloodGroup: event.target.value as Draft["bloodGroup"] })}>{bloodGroups.map((blood) => <option key={blood} value={blood}>{blood}</option>)}</Select></Text></div>
        {error ? <Text as="p" size="sm" tone="danger" style={{ color: T.coral }}>{error}</Text> : null}
        <div style={{ display: "flex", gap: "var(--space-s10)", marginTop: "var(--space-s12)" }}>{person ? <Button tone="danger" variant="secondary" type="button" onClick={() => onRemove(person)}><Trash2 aria-hidden="true" focusable="false" size={15} /> Remove</Button> : null}<Button loading={saving} variant="primary" type="submit" disabled={saving} style={{ flex: 1 }}>{saving ? "Saving..." : "Save person"}</Button></div>
      </ModalPanel>
    </ModalBackdrop>
  );
}

function ConfirmRemove({ member, onClose, onRemoved }: { member: TrustMember; onClose: () => void; onRemoved: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  async function remove() { setBusy(true); await api.trust.revokeMember(member.id); await onRemoved(); }
  return <ModalBackdrop style={scrim} onClick={onClose}><ModalPanel onDismiss={onClose} aria-label="Family access" style={modal} onClick={(event) => event.stopPropagation()}><div style={head}><Text as="b" size="md" weight="semibold">Remove {member.name.split(" ")[0]}?</Text><Button size="sm" iconOnly variant="tertiary" type="button" onClick={onClose} aria-label="Close"><X aria-hidden="true" focusable="false" size="var(--icon-small)" /></Button></div><Text as="p" size="md" style={copy}>{member.name} will no longer be able to step in for emergency access. Their documents stay in Documents.</Text><div style={{ display: "flex", gap: "var(--space-s10)" }}><Button variant="secondary" type="button" onClick={onClose}>Cancel</Button><Button tone="danger" loading={Boolean(busy)} variant="primary" type="button" style={{ flex: 1 }} disabled={busy} onClick={() => void remove()}>{busy ? "Removing..." : "Remove"}</Button></div></ModalPanel></ModalBackdrop>;
}

const intro: CSSProperties = { minHeight: 92, padding: "var(--space-s18) var(--space-s24)", display: "flex", alignItems: "center", gap: "var(--space-s16)" };
const copy: CSSProperties = { flex: 1, minWidth: 0, color: T.muted, margin: 0 };
const empty: CSSProperties = { padding: "var(--space-s16)", color: T.faint, borderTop: `1px solid ${T.border}` };
const errorBox: CSSProperties = { margin: "0 var(--space-s16) var(--space-s14)", border: `1px solid ${T.coralBorder}`, borderRadius: "var(--radius-s10)", padding: 11, color: T.coral };
const memberRow: CSSProperties = { minHeight: 78, display: "flex", alignItems: "center", gap: "var(--space-s14)", padding: "var(--space-s14) var(--space-s24)", borderTop: `1px solid ${T.border}` };
const avatar: CSSProperties = { width: 38, height: 38, display: "grid", placeItems: "center", borderRadius: "var(--radius-surface)", fontSize: "var(--text-lg)", fontWeight: "var(--weight-bold)", flexShrink: 0 };
const memberIdentity: CSSProperties = { flex: 1, minWidth: 0 };
const memberName: CSSProperties = { color: T.white };
const relationText: CSSProperties = { color: T.muted, fontWeight: "var(--weight-medium)" };
const primaryText: CSSProperties = { color: T.action, marginTop: 3 };

const toggleLabel: CSSProperties = { display: "inline-flex", alignItems: "center", minHeight: 36, cursor: "pointer" };
const checkbox: CSSProperties = { width: 21, height: 21, cursor: "pointer" };
const grid: CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-s10)" };
const input: CSSProperties = { width: "100%", marginTop: 5, marginBottom: "var(--space-s10)" };
const label: CSSProperties = { display: "block", color: T.muted, letterSpacing: 0.5, textTransform: "uppercase" };
const head: CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-s16)", color: T.white, fontSize: "var(--text-lg)" };
const modal: CSSProperties = { width: "min(460px,100%)", maxHeight: "92vh", overflowY: "auto" };
const scrim: CSSProperties = { position: "fixed", inset: 0, zIndex: "var(--layer-overlay)", display: "flex", alignItems: "center", justifyContent: "center" };
