import type { CSSProperties, FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { KeyRound, LockKeyhole, Pencil, Plus, RotateCcw, ShieldCheck, Users, X } from "lucide-react";

import Card from "@/components/Card";
import SectionHead from "@/components/SectionHead";
import { api, type TrustCenterResponse, type TrustMember, type TrustMemberPayload, type TrustPermission } from "@/lib/api";
import { btnGhost, btnGold, T } from "@/constants/theme";

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

  const enabledModules = useMemo(
    () => modules.filter((module) => data?.modules[module.toLowerCase() as "documents" | "health" | "wealth"]),
    [data],
  );

  if (loading) return <SectionHead title="Trust center" sub="Loading trusted access..." />;
  if (error || !data) return <TrustError message={error ?? "Unable to load Trust Center."} onRetry={() => void load()} />;

  const limitReached = data.remainingSlots <= 0;
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
    if (!window.confirm(`Leave ${ownerName}'s Readiness account? Your access will be removed immediately.`)) return;
    setLeavingId(connectionId);
    setNotice(null);
    try {
      await api.trust.leaveConnection(connectionId);
      await load();
      setNotice(`You left ${ownerName}'s Readiness account.`);
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
        <Card><span><LockKeyhole size={17} color={T.mint} /></span><div>Encrypted on device</div><p>Your archive is encrypted locally. Even we cannot read it.</p></Card>
        <Card><span><ShieldCheck size={17} color={T.mint} /></span><div>{data.plan.name} plan</div><p>Plan access and limits come from the backend.</p></Card>
        <Card><span><Users size={17} color={T.mint} /></span><div>{data.memberCount + 1} people</div><p>Have some level of access, set by you.</p></Card>
      </div>

      <Card style={{ padding: 0, marginBottom: 16, overflow: "hidden" }}>
        <div className="lp-trust-family-head">
          <span>Family &amp; access</span>
          <button type="button" disabled={limitReached} onClick={() => setAddOpen(true)} style={{ ...btnGold, opacity: limitReached ? 0.45 : 1 }}>
            <Plus size={15} /> Add member
          </button>
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
        {!data.members.length ? <p style={{ color: T.muted, margin: 0, padding: "0 16px 16px" }}>No trusted members yet.</p> : null}
      </Card>

      {notice ? (
        <Card style={{ marginBottom: 16, borderColor: `${T.gold}66` }}>
          <b style={{ color: T.white }}>Invitation status</b>
          <p style={{ color: T.muted, margin: "6px 0 0", fontSize: 13 }}>{notice}</p>
        </Card>
      ) : null}

      {limitReached ? (
        <Card style={{ marginBottom: 16, borderColor: `${T.gold}66` }}>
          <b style={{ color: T.white }}>Member limit reached</b>
          <p style={{ color: T.muted, margin: "6px 0 0", fontSize: 13 }}>Your current plan allows {data.memberLimit} trusted members.</p>
        </Card>
      ) : null}

      {data.connections.length ? (
        <Card style={{ padding: 0, marginBottom: 16, overflow: "hidden" }}>
          <div className="lp-trust-family-head"><span>Connected to</span></div>
          {data.connections.map((connection) => (
            <div key={connection.id} className="lp-trust-member" style={{ borderTop: `1px solid ${T.border}` }}>
              <span>{connection.owner.name.charAt(0)}</span>
              <div style={{ flex: 1, minWidth: 190 }}>
                <div>{connection.owner.name} <small>· {connection.relationLabel}</small></div>
                <small>{connection.accessType.name}</small>
              </div>
              <button
                type="button"
                disabled={leavingId === connection.id}
                onClick={() => void leaveConnection(connection.id, connection.owner.name)}
                style={{ ...btnGhost, color: T.coral, borderColor: `${T.coral}55`, opacity: leavingId === connection.id ? 0.55 : 1 }}
              >
                Leave Readiness
              </button>
            </div>
          ))}
        </Card>
      ) : null}

      <Card>
        <b style={{ color: T.white, fontSize: 15 }}>Reset demo data</b>
        <p style={{ fontSize: 13, color: T.muted, margin: "6px 0 12px" }}>Restore the sample family and documents on this device.</p>
        <button type="button" style={{ ...btnGhost, color: T.coral, borderColor: `${T.coral}55` }}>
          <RotateCcw size={15} /> Reset everything
        </button>
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
      <b style={{ color: T.white }}>Trust Center unavailable</b>
      <p style={{ color: T.muted }}>{message}</p>
      <button type="button" style={btnGold} onClick={onRetry}><RotateCcw size={15} /> Retry</button>
    </Card>
  );
}

function OwnerRow({ owner }: { owner: TrustCenterResponse["owner"] }) {
  return (
    <div className="lp-trust-member" style={{ borderTop: `1px solid ${T.border}` }}>
      <span>{owner.name.charAt(0)}</span>
      <div style={{ flex: 1, minWidth: 190 }}>
        <div>{owner.name} <small>· Owner</small></div>
        <small>Full access cannot be changed</small>
      </div>
      <select disabled value="OWNER" style={selectStyle} aria-label="Owner access">
        <option>Owner</option>
      </select>
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
      <span>{member.name.charAt(0)}</span>
      <div style={{ flex: 1, minWidth: 190 }}>
        <div>{member.name} <small>· {member.relationLabel}</small></div>
        <small>
          {member.status} · DOB {member.dateOfBirth} · {member.bloodGroup}
          {member.invitationStatus === "EXPIRED" ? " · Expired" : null}
          {member.invitationStatus === "PENDING" && member.inviteExpiresAt ? ` · Expires ${new Date(member.inviteExpiresAt).toLocaleString()}` : null}
        </small>
      </div>
      <select value={member.accessType.code} onChange={(event) => onChange(event.target.value as TrustMemberPayload["accessTypeCode"])} style={selectStyle} aria-label={`${member.name} access`}>
        {accessTypes.map((accessType) => <option key={accessType} value={accessType}>{accessLabels[accessType]}</option>)}
      </select>
      <button type="button" aria-label={`Edit ${member.name}`} title={`Edit ${member.name}`} onClick={() => onChange(member.accessType.code)} style={iconButtonStyle}>
        <Pencil size={14} />
      </button>
      {member.status === "INVITED" || member.invitationStatus === "EXPIRED" ? (
        <>
          <button type="button" onClick={onResend} style={inlineButtonStyle}>Resend Invitation</button>
          <button type="button" aria-label={`Reset PIN for ${member.name}`} title={`Reset PIN for ${member.name}`} onClick={onResetPin} style={iconButtonStyle}>
            <KeyRound size={14} />
          </button>
        </>
      ) : null}
      <button
        type="button"
        aria-label={`Remove ${member.name}`}
        title={`Remove ${member.name}`}
        disabled={removing}
        onClick={onRemove}
        style={{ ...removeButtonStyle, opacity: removing ? 0.45 : 1 }}
      >
        <X size={15} />
      </button>
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
    <div onClick={onClose} style={scrimStyle}>
      <form onSubmit={submit} onClick={(event) => event.stopPropagation()} style={modalStyle}>
        <div style={modalHeadStyle}>
          <b style={{ color: T.white, fontSize: 18 }}>Add a family member</b>
          <button type="button" onClick={onClose} style={{ ...btnGhost, padding: 8 }} aria-label="Close"><X size={16} /></button>
        </div>

        <label style={labelStyle}>Name<input required style={inputStyle} value={draft.name} onChange={(event) => update({ name: event.target.value })} placeholder="e.g. Taylor Morgan" /></label>
        <label style={labelStyle}>Email<input required type="email" style={inputStyle} value={draft.email} onChange={(event) => update({ email: event.target.value })} placeholder="name@example.com" /></label>
        <div style={grid2Style}>
          <label style={labelStyle}>Relation<select style={inputStyle} value={draft.relation} onChange={(event) => update({ relation: event.target.value as TrustMemberPayload["relation"] })}>{relations.map((relation) => <option key={relation} value={relation}>{labelize(relation)}</option>)}</select></label>
          <label style={labelStyle}>Access<select style={inputStyle} value={draft.accessTypeCode} onChange={(event) => update({ accessTypeCode: event.target.value as TrustMemberPayload["accessTypeCode"] })}>{accessTypes.map((accessType) => <option key={accessType} value={accessType}>{accessLabels[accessType]}</option>)}</select></label>
        </div>
        {draft.relation === "OTHER" ? <label style={labelStyle}>Custom relation<input required style={inputStyle} value={draft.customRelation ?? ""} onChange={(event) => update({ customRelation: event.target.value })} /></label> : null}
        <div style={grid2Style}>
          <label style={labelStyle}>Date of birth<input required type="date" style={inputStyle} value={draft.dateOfBirth} onChange={(event) => update({ dateOfBirth: event.target.value })} /></label>
          <label style={labelStyle}>Blood group<select style={inputStyle} value={draft.bloodGroup} onChange={(event) => update({ bloodGroup: event.target.value as TrustMemberPayload["bloodGroup"] })}>{bloodGroups.map((blood) => <option key={blood} value={blood}>{blood}</option>)}</select></label>
        </div>
        <label style={labelStyle}>6-digit PIN<input required inputMode="numeric" maxLength={6} style={inputStyle} value={draft.pin} onChange={(event) => update({ pin: event.target.value.replace(/\D/g, "").slice(0, 6) })} placeholder="Share separately" /></label>
        <p style={{ color: T.muted, fontSize: 12, lineHeight: 1.5, margin: "2px 0 0" }}>{accessCopy[draft.accessTypeCode]}</p>
        <button type="submit" disabled={saving || !draft.name.trim() || !draft.email.trim() || !/^\d{6}$/.test(draft.pin)} style={{ ...btnGold, width: "100%", justifyContent: "center", marginTop: 16, opacity: saving ? 0.65 : 1 }}>
          {saving ? "Sending..." : "Send invitation"}
        </button>
      </form>
    </div>
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

const grid2Style: CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 };
const inputStyle: CSSProperties = { width: "100%", marginTop: 5, marginBottom: 10, background: T.raised, border: `1px solid ${T.border}`, borderRadius: 9, padding: "9px 11px", color: T.text, fontSize: 14, outline: "none" };
const labelStyle: CSSProperties = { display: "block", color: T.muted, fontSize: 11, fontWeight: 800, letterSpacing: 0.5, textTransform: "uppercase" };
const modalHeadStyle: CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 };
const modalStyle: CSSProperties = { width: "min(430px,100%)", background: T.panel, border: `1px solid ${T.border}`, borderRadius: 16, padding: 18 };
const scrimStyle: CSSProperties = { position: "fixed", inset: 0, zIndex: 70, display: "flex", alignItems: "center", justifyContent: "center", padding: 18, background: "rgba(4,7,15,.62)" };
const selectStyle: CSSProperties = { minWidth: 160, background: T.raised, border: `1px solid ${T.border}`, borderRadius: 8, padding: "6px 10px", color: T.text, fontSize: 12.5, fontWeight: 700 };
const inlineButtonStyle: CSSProperties = { marginLeft: 8, padding: 0, border: 0, background: "transparent", color: T.gold, font: "inherit", cursor: "pointer" };
const iconButtonStyle: CSSProperties = { width: 32, height: 32, display: "grid", placeItems: "center", flex: "0 0 32px", background: T.raised, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, cursor: "pointer" };
const removeButtonStyle: CSSProperties = { width: 32, height: 32, display: "grid", placeItems: "center", flex: "0 0 32px", background: "rgba(255, 107, 107, 0.08)", border: `1px solid ${T.coral}55`, borderRadius: 8, color: T.coral, cursor: "pointer" };
