import { Text, Select, ModalBackdrop, ModalPanel, Input, Button, Card } from "@/design-system";

import type { CSSProperties, FormEvent } from "react";
import { useEffect, useState } from "react";
import { KeyRound, LockKeyhole, Pencil, Plus, RotateCcw, ShieldCheck, Users, X } from "lucide-react";

import SectionHead from "@/components/SectionHead";
import { api, type TrustCenterResponse, type TrustMember, type TrustMemberPayload, type TrustPermission } from "@/lib/api";
import { T } from "@/constants/theme";

const relations = ["SPOUSE", "PARENT", "CHILD", "SIBLING", "GUARDIAN", "RELATIVE", "FRIEND", "OTHER"] as const;
const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"] as const;
const modules: TrustPermission["module"][] = ["DOCUMENTS", "HEALTH", "WEALTH"];
const accessTypes: TrustMemberPayload["accessTypeCode"][] = ["VIEW_ONLY", "FAMILY_MEMBER", "EMERGENCY_ACCESS"];
const accessLabels = { VIEW_ONLY: "View only", FAMILY_MEMBER: "Full member", EMERGENCY_ACCESS: "Emergency access" };
const accessCopy = {
  VIEW_ONLY: "Can view explicitly shared content. No editing or member management.",
  FAMILY_MEMBER: "Ongoing access to owner-approved content.",
  EMERGENCY_ACCESS: "Restricted access designed for urgent situations.",
};

const emptyDraft: TrustMemberPayload = {
  name: "",
  email: "",
  relation: "PARENT",
  dateOfBirth: "",
  bloodGroup: "O+",
  accessTypeCode: "VIEW_ONLY",
  pin: "",
  permissions: [{ module: "DOCUMENTS", canView: true, canDownload: false }],
};

export default function TrustPage() {
  const [data, setData] = useState<TrustCenterResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [leavingId, setLeavingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await api.trust.get());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load Trust Center.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const enabledModules = modules;

  if (loading) return <SectionHead title="Trust center" sub="Loading trusted access..." />;
  if (error || !data) return <TrustError message={error ?? "Unable to load Trust Center."} onRetry={() => void load()} />;

  const refreshAfter = async (action: Promise<unknown>) => {
    const result = await action;
    if (isTrustMember(result)) setNotice(invitationNotice(result));
    await load();
  };

  const removeMember = async (member: TrustMember) => {
    if (!window.confirm(`Remove ${member.name} from your family list?`)) return;
    setRemovingId(member.id);
    setNotice(null);
    try {
      await api.trust.revokeMember(member.id);
      await load();
      setNotice(`${member.name} was removed from your family list.`);
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Unable to remove member.");
    } finally {
      setRemovingId(null);
    }
  };

  const resetPin = async (member: TrustMember) => {
    const pin = window.prompt(`Set a new 6-digit PIN for ${member.name}. Share it separately.`);
    if (pin === null) return;
    if (!/^\d{6}$/.test(pin.trim())) {
      setNotice("PIN must be exactly 6 digits.");
      return;
    }
    await refreshAfter(api.trust.resetInvitationPin(member.id, pin.trim()));
    setNotice(`PIN reset for ${member.name}. Share it separately from email.`);
  };

  const leaveConnection = async (connectionId: string, ownerName: string) => {
    if (!window.confirm(`Leave ${ownerName}'s Readiness? Your access will be removed immediately.`)) return;
    setLeavingId(connectionId);
    setNotice(null);
    try {
      await api.trust.leaveConnection(connectionId);
      await load();
      setNotice(`You left ${ownerName}'s Readiness.`);
    } catch (leaveError) {
      setError(leaveError instanceof Error ? leaveError.message : "Unable to leave Readiness.");
    } finally {
      setLeavingId(null);
    }
  };

  return (
    <div className="lp-trust-route">
      <SectionHead
        title="Trust center"
        sub="In plain language: what is protected, who is in your archive, and what each person can reach."
      />

      <div className="lp-trust-stats">
        <Card><span><LockKeyhole aria-hidden="true" focusable="false" size={17} color={T.mint} /></span><Text as="div" size="md">Encrypted storage</Text><Text as="p" size="sm">Documents use encrypted storage. The current backend can decrypt them for processing.</Text></Card>
        <Card><span><Users aria-hidden="true" focusable="false" size={17} color={T.mint} /></span><Text as="div" size="md">{data.memberCount + 1} people</Text><Text as="p" size="sm">Have some level of access, set by you.</Text></Card>
      </div>

      <Card flush style={{ marginBottom: "var(--space-s16)", overflow: "hidden" }}>
        <div className="lp-trust-family-head">
          <Text size="md">Family &amp; access</Text>
          <Button variant="primary" type="button" onClick={() => setAddOpen(true)} >
            <Plus aria-hidden="true" focusable="false" size={15} /> Add member
          </Button>
        </div>
        <OwnerRow owner={data.owner} />
        {data.members.map((member) => (
          <MemberRow
            key={member.id}
            member={member}
            onChange={(accessTypeCode) => void refreshAfter(api.trust.updateMember(member.id, { accessTypeCode }))}
            onResend={() => void refreshAfter(api.trust.resendInvitation(member.id))}
            onResetPin={() => void resetPin(member)}
            onRemove={() => void removeMember(member)}
            removing={removingId === member.id}
          />
        ))}
        {!data.members.length ? <Text as="p" size="md" tone="muted" style={{ color: T.muted, margin: 0, padding: "0 var(--space-s16) var(--space-s16)" }}>No trusted members yet.</Text> : null}
      </Card>

      {notice ? (
        <Card style={{ marginBottom: "var(--space-s16)" }}>
          <Text as="b" size="md" weight="semibold" style={{ color: T.white }}>Invitation status</Text>
          <Text as="p" size="md" tone="muted" style={{ color: T.muted, margin: "var(--space-s6) 0 0" }}>{notice}</Text>
        </Card>
      ) : null}

      {data.connections.length ? (
        <Card flush style={{ marginBottom: "var(--space-s16)", overflow: "hidden" }}>
          <div className="lp-trust-family-head"><Text size="md">Connected to</Text></div>
          {data.connections.map((connection) => (
            <div key={connection.id} className="lp-trust-member" style={{ borderTop: `1px solid ${T.border}` }}>
              <Text size="md">{connection.owner.name.charAt(0)}</Text>
              <div style={{ flex: 1, minWidth: 190 }}>
                <Text as="div" size="md">{connection.owner.name} <small>· {connection.relationLabel}</small></Text>
                <Text as="small" size="sm">{connection.accessType.name}</Text>
              </div>
              <Button tone="danger" variant="secondary"
                type="button"
                disabled={leavingId === connection.id}
                onClick={() => void leaveConnection(connection.id, connection.owner.name)}

              >
                Leave Readiness
              </Button>
            </div>
          ))}
        </Card>
      ) : null}

      <Card>
        <Text as="b" size="md" weight="semibold" style={{ color: T.white }}>Reset demo data</Text>
        <Text as="p" size="md" tone="muted" style={{ color: T.muted, margin: "var(--space-s6) 0 var(--space-s12)" }}>Restore the sample family and documents on this device.</Text>
        <Button tone="danger" variant="secondary" type="button" >
          <RotateCcw aria-hidden="true" focusable="false" size={15} /> Reset everything
        </Button>
      </Card>

      {addOpen ? (
        <MemberModal
          enabledModules={enabledModules}
          onClose={() => setAddOpen(false)}
          onSave={(payload) => refreshAfter(api.trust.addMember(payload)).then(() => setAddOpen(false))}
        />
      ) : null}
    </div>
  );
}

function TrustError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card>
      <Text as="b" size="md" weight="semibold" style={{ color: T.white }}>Trust Center unavailable</Text>
      <Text as="p" size="md" tone="muted" style={{ color: T.muted }}>{message}</Text>
      <Button variant="primary" type="button" onClick={onRetry}><RotateCcw aria-hidden="true" focusable="false" size={15} /> Retry</Button>
    </Card>
  );
}

function OwnerRow({ owner }: { owner: TrustCenterResponse["owner"] }) {
  return (
    <div className="lp-trust-member" style={{ borderTop: `1px solid ${T.border}` }}>
      <Text size="md">{owner.name.charAt(0)}</Text>
      <div style={{ flex: 1, minWidth: 190 }}>
        <Text as="div" size="md">{owner.name} <small>· Owner</small></Text>
        <Text as="small" size="sm">Full access cannot be changed</Text>
      </div>
      <Select disabled value="OWNER" style={selectStyle} aria-label="Owner access">
        <option>Owner</option>
      </Select>
    </div>
  );
}

function MemberRow({
  member,
  onChange,
  onResend,
  onResetPin,
  onRemove,
  removing,
}: {
  member: TrustMember;
  onChange: (accessType: TrustMemberPayload["accessTypeCode"]) => void;
  onResend: () => void;
  onResetPin: () => void;
  onRemove: () => void;
  removing: boolean;
}) {
  return (
    <div className="lp-trust-member" style={{ borderTop: `1px solid ${T.border}` }}>
      <Text size="md">{member.name.charAt(0)}</Text>
      <div style={{ flex: 1, minWidth: 190 }}>
        <Text as="div" size="md">{member.name} <small>· {member.relationLabel}</small></Text>
        <Text as="small" size="sm">
          {member.status} · DOB {member.dateOfBirth} · {member.bloodGroup}
          {member.invitationStatus === "EXPIRED" ? " · Expired" : null}
          {member.invitationStatus === "PENDING" && member.inviteExpiresAt ? ` · Expires ${new Date(member.inviteExpiresAt).toLocaleString()}` : null}
        </Text>
      </div>
      <Select value={member.accessType.code} onChange={(event) => onChange(event.target.value as TrustMemberPayload["accessTypeCode"])} style={selectStyle} aria-label={`${member.name} access`}>
        {accessTypes.map((accessType) => <option key={accessType} value={accessType}>{accessLabels[accessType]}</option>)}
      </Select>
      <Button size="sm" iconOnly variant="tertiary" type="button" aria-label={`Edit ${member.name}`} title={`Edit ${member.name}`} onClick={() => { if (member.accessType.code !== "OWNER") onChange(member.accessType.code); }} >
        <Pencil aria-hidden="true" focusable="false" size={14} />
      </Button>
      {member.status === "INVITED" || member.invitationStatus === "EXPIRED" ? (
        <>
          <Button size="sm" variant="tertiary" type="button" onClick={onResend} style={{ marginLeft: "var(--space-s8)" }}>Resend Invitation</Button>
          <Button size="sm" iconOnly variant="tertiary" type="button" aria-label={`Reset PIN for ${member.name}`} title={`Reset PIN for ${member.name}`} onClick={onResetPin} >
            <KeyRound aria-hidden="true" focusable="false" size={14} />
          </Button>
        </>
      ) : null}
      <Button size="sm" tone="danger" iconOnly variant="tertiary"
        type="button"
        aria-label={`Remove ${member.name}`}
        title={`Remove ${member.name}`}
        disabled={removing}
        onClick={onRemove}

      >
        <X aria-hidden="true" focusable="false" size={15} />
      </Button>
    </div>
  );
}

function MemberModal({ enabledModules, onClose, onSave }: { enabledModules: TrustPermission["module"][]; onClose: () => void; onSave: (payload: TrustMemberPayload) => Promise<void> }) {
  const [draft, setDraft] = useState<TrustMemberPayload>(emptyDraft);
  const [saving, setSaving] = useState(false);
  const update = (patch: Partial<TrustMemberPayload>) => setDraft((current) => ({ ...current, ...patch }));
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    await onSave({ ...draft, permissions: defaultPermissions(enabledModules, draft.permissions) }).finally(() => setSaving(false));
  };

  return (
    <ModalBackdrop onClick={onClose} style={scrimStyle}>
      <ModalPanel onDismiss={onClose} aria-label="Trusted access" as="form" onSubmit={submit} onClick={(event) => event.stopPropagation()} style={modalStyle}>
        <div style={modalHeadStyle}>
          <Text as="b" size="lg" weight="semibold" style={{ color: T.white }}>Add a family member</Text>
          <Button iconOnly variant="tertiary" size="sm" type="button" onClick={onClose} aria-label="Close"><X aria-hidden="true" focusable="false" size="var(--icon-small)" /></Button>
        </div>

        <Text as="label" size="md" style={labelStyle}>Name<Input required style={inputStyle} value={draft.name} onChange={(event) => update({ name: event.target.value })} placeholder="e.g. Taylor Morgan" /></Text>
        <Text as="label" size="md" style={labelStyle}>Email<Input required type="email" style={inputStyle} value={draft.email} onChange={(event) => update({ email: event.target.value })} placeholder="name@example.com" /></Text>
        <div style={grid2Style}>
          <Text as="label" size="md" style={labelStyle}>Relation<Select style={inputStyle} value={draft.relation} onChange={(event) => update({ relation: event.target.value as TrustMemberPayload["relation"] })}>{relations.map((relation) => <option key={relation} value={relation}>{labelize(relation)}</option>)}</Select></Text>
          <Text as="label" size="md" style={labelStyle}>Access<Select style={inputStyle} value={draft.accessTypeCode} onChange={(event) => update({ accessTypeCode: event.target.value as TrustMemberPayload["accessTypeCode"] })}>{accessTypes.map((accessType) => <option key={accessType} value={accessType}>{accessLabels[accessType]}</option>)}</Select></Text>
        </div>
        {draft.relation === "OTHER" ? <Text as="label" size="md" style={labelStyle}>Custom relation<Input required style={inputStyle} value={draft.customRelation ?? ""} onChange={(event) => update({ customRelation: event.target.value })} /></Text> : null}
        <div style={grid2Style}>
          <Text as="label" size="md" style={labelStyle}>Date of birth<Input required type="date" style={inputStyle} value={draft.dateOfBirth} onChange={(event) => update({ dateOfBirth: event.target.value })} /></Text>
          <Text as="label" size="md" style={labelStyle}>Blood group<Select style={inputStyle} value={draft.bloodGroup} onChange={(event) => update({ bloodGroup: event.target.value as TrustMemberPayload["bloodGroup"] })}>{bloodGroups.map((blood) => <option key={blood} value={blood}>{blood}</option>)}</Select></Text>
        </div>
        <Text as="label" size="md" style={labelStyle}>6-digit PIN<Input required inputMode="numeric" maxLength={6} style={inputStyle} value={draft.pin} onChange={(event) => update({ pin: event.target.value.replace(/\D/g, "").slice(0, 6) })} placeholder="Share separately" /></Text>
        <Text as="p" size="sm" tone="muted" style={{ color: T.muted, margin: "2px 0 0" }}>{accessCopy[draft.accessTypeCode]}</Text>
        <Button loading={saving} variant="primary" type="submit" disabled={saving || !draft.name.trim() || !draft.email.trim() || !/^\d{6}$/.test(draft.pin ?? "")} style={{ width: "100%", marginTop: "var(--space-s16)" }}>
          {saving ? "Sending..." : "Send invitation"}
        </Button>
      </ModalPanel>
    </ModalBackdrop>
  );
}

function defaultPermissions(enabledModules: TrustPermission["module"][], permissions: TrustPermission[]) {
  return enabledModules.map((module) => permissions.find((permission) => permission.module === module) ?? { module, canView: module === "DOCUMENTS", canDownload: false });
}

function isTrustMember(value: unknown): value is TrustMember {
  return Boolean(value && typeof value === "object" && "id" in value && "accessType" in value);
}

function invitationNotice(member: TrustMember) {
  const delivery = member.invitationDelivery;
  if (!delivery) return null;
  if (delivery.sent) return `Invitation email sent to ${member.email}.`;
  if (delivery.reason === "email_disabled") return "Invitation saved, but email is disabled because SMTP configuration is incomplete.";
  if (delivery.reason === "invalid_recipient") return "Invitation saved, but the email address is not valid.";
  return `Invitation saved, but email delivery failed${delivery.errorCode ? ` (${delivery.errorCode})` : ""}.`;
}

function labelize(value: string) {
  return value.toLowerCase().replace(/(^|_)([a-z])/g, (_match, prefix: string, letter: string) => `${prefix ? " " : ""}${letter.toUpperCase()}`);
}

const grid2Style: CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-s10)" };
const inputStyle: CSSProperties = { width: "100%", marginTop: 5, marginBottom: "var(--space-s10)" };
const labelStyle: CSSProperties = { display: "block", color: T.muted, letterSpacing: 0.5, textTransform: "uppercase" };
const modalHeadStyle: CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-s16)" };
const modalStyle: CSSProperties = { width: "min(430px,100%)" };
const scrimStyle: CSSProperties = { position: "fixed", inset: 0, zIndex: "var(--layer-overlay)", display: "flex", alignItems: "center", justifyContent: "center" };
const selectStyle: CSSProperties = { minWidth: 160 };
