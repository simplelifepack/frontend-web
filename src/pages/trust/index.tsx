import {
  Stack,
  Grid,
  Row,
  Heading,
  Field,
  IconBadge,
  ListRow,
  ControlSlot,
  ModalHeader,
  Text,
  Select,
  ModalBackdrop,
  ModalPanel,
  Input,
  Button,
  Card,
} from "@/design-system";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import {
  KeyRound,
  LockKeyhole,
  Pencil,
  Plus,
  RotateCcw,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";

import SectionHead from "@/components/SectionHead";
import {
  api,
  type TrustCenterResponse,
  type TrustMember,
  type TrustMemberPayload,
  type TrustPermission,
} from "@/lib/api";
import { T } from "@/constants/theme";

const relations = [
  "SPOUSE",
  "PARENT",
  "CHILD",
  "SIBLING",
  "GUARDIAN",
  "RELATIVE",
  "FRIEND",
  "OTHER",
] as const;
const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"] as const;
const modules: TrustPermission["module"][] = ["DOCUMENTS", "HEALTH", "WEALTH"];
const accessTypes: TrustMemberPayload["accessTypeCode"][] = [
  "VIEW_ONLY",
  "FAMILY_MEMBER",
  "EMERGENCY_ACCESS",
];
const accessLabels = {
  VIEW_ONLY: "View only",
  FAMILY_MEMBER: "Full member",
  EMERGENCY_ACCESS: "Emergency access",
};
const accessCopy = {
  VIEW_ONLY:
    "Can view explicitly shared content. No editing or member management.",
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
  const [editing, setEditing] = useState<TrustMember | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [leavingId, setLeavingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await api.trust.get());
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load Trust Center.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const enabledModules = modules;

  if (loading)
    return <SectionHead title="Trust center" sub="Loading trusted access..." />;
  if (error || !data)
    return (
      <TrustError
        message={error ?? "Unable to load Trust Center."}
        onRetry={() => void load()}
      />
    );

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
      setError(
        removeError instanceof Error
          ? removeError.message
          : "Unable to remove member.",
      );
    } finally {
      setRemovingId(null);
    }
  };

  const resetPin = async (member: TrustMember) => {
    const pin = window.prompt(
      `Set a new 6-digit PIN for ${member.name}. Share it separately.`,
    );
    if (pin === null) return;
    if (!/^\d{6}$/.test(pin.trim())) {
      setNotice("PIN must be exactly 6 digits.");
      return;
    }
    await refreshAfter(api.trust.resetInvitationPin(member.id, pin.trim()));
    setNotice(`PIN reset for ${member.name}. Share it separately from email.`);
  };

  const leaveConnection = async (connectionId: string, ownerName: string) => {
    if (
      !window.confirm(
        `Leave ${ownerName}'s Readines? Your access will be removed immediately.`,
      )
    )
      return;
    setLeavingId(connectionId);
    setNotice(null);
    try {
      await api.trust.leaveConnection(connectionId);
      await load();
      setNotice(`You left ${ownerName}'s Readines.`);
    } catch (leaveError) {
      setError(
        leaveError instanceof Error
          ? leaveError.message
          : "Unable to leave Readines.",
      );
    } finally {
      setLeavingId(null);
    }
  };

  return (
    <>
      <SectionHead
        title="Trust center"
        sub="In plain language: what is protected, who is in your archive, and what each person can reach."
      />
      <Stack $gap="s24">
        <Grid>
          <Card>
            <Stack>
              <IconBadge $tone="success">
                <LockKeyhole aria-hidden="true" />
              </IconBadge>
              <Heading level={3} size="sm">
                Encrypted storage
              </Heading>
              <Text as="p" tone="muted">
                Documents use encrypted storage. The current backend can decrypt
                them for processing.
              </Text>
            </Stack>
          </Card>
          <Card>
            <Stack>
              <IconBadge $tone="success">
                <Users aria-hidden="true" />
              </IconBadge>
              <Heading level={3} size="sm">
                {data.memberCount + 1} people
              </Heading>
              <Text as="p" tone="muted">
                Have some level of access, set by you.
              </Text>
            </Stack>
          </Card>
        </Grid>
        <Card flush>
          <ListRow>
            <Stack $grow>
              <Heading level={3} size="sm">
                Family &amp; access
              </Heading>
            </Stack>
            <Button variant="primary" onClick={() => setAddOpen(true)}>
              <Plus aria-hidden="true" /> Add member
            </Button>
          </ListRow>
          <OwnerRow owner={data.owner} />
          {data.members.map((member) => (
            <MemberRow
              key={member.id}
              member={member}
              onChange={(accessTypeCode) =>
                void refreshAfter(
                  api.trust.updateMember(member.id, { accessTypeCode }),
                )
              }
              onEdit={() => setEditing(member)}
              onResend={() =>
                void refreshAfter(api.trust.resendInvitation(member.id))
              }
              onResetPin={() => void resetPin(member)}
              onRemove={() => void removeMember(member)}
              removing={removingId === member.id}
            />
          ))}
          {!data.members.length && (
            <ListRow>
              <Text tone="muted">No trusted members yet.</Text>
            </ListRow>
          )}
        </Card>
        {notice && (
          <Card>
            <Stack $gap="s6">
              <Heading level={3} size="sm">
                Invitation status
              </Heading>
              <Text as="p" tone="muted">
                {notice}
              </Text>
            </Stack>
          </Card>
        )}
        {!!data.connections.length && (
          <Card flush>
            <ListRow>
              <Heading level={3} size="sm">
                Connected to
              </Heading>
            </ListRow>
            {data.connections.map((connection) => (
              <ListRow $divided key={connection.id}>
                <IconBadge>{connection.owner.name.charAt(0)}</IconBadge>
                <Stack $grow $gap="s4">
                  <Text>
                    {connection.owner.name} · {connection.relationLabel}
                  </Text>
                  <Text size="sm" tone="muted">
                    {connection.accessType.name}
                  </Text>
                </Stack>
                <Button
                  tone="danger"
                  variant="secondary"
                  disabled={leavingId === connection.id}
                  onClick={() =>
                    void leaveConnection(connection.id, connection.owner.name)
                  }
                >
                  Leave Readines
                </Button>
              </ListRow>
            ))}
          </Card>
        )}
        <Card>
          <Stack>
            <Heading level={3} size="sm">
              Reset demo data
            </Heading>
            <Text as="p" tone="muted">
              Restore the sample family and documents on this device.
            </Text>
            <Row>
              <Button
                tone="danger"
                variant="secondary"
                disabled
                title="Demo reset is not available for account data."
              >
                <RotateCcw aria-hidden="true" /> Reset everything
              </Button>
            </Row>
          </Stack>
        </Card>
      </Stack>
      {editing && (
        <MemberModal
          initial={editing}
          enabledModules={enabledModules}
          onClose={() => setEditing(null)}
          onSave={(payload) =>
            refreshAfter(api.trust.updateMember(editing.id, payload)).then(() =>
              setEditing(null),
            )
          }
        />
      )}
      {addOpen && (
        <MemberModal
          enabledModules={enabledModules}
          onClose={() => setAddOpen(false)}
          onSave={(payload) =>
            refreshAfter(api.trust.addMember(payload)).then(() =>
              setAddOpen(false),
            )
          }
        />
      )}
    </>
  );
}

function TrustError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <Card>
      <Stack>
        <Heading level={2} size="sm">
          Trust Center unavailable
        </Heading>
        <Text as="p" tone="muted" role="alert">
          {message}
        </Text>
        <Row>
          <Button variant="primary" onClick={onRetry}>
            <RotateCcw aria-hidden="true" /> Retry
          </Button>
        </Row>
      </Stack>
    </Card>
  );
}

function OwnerRow({ owner }: { owner: TrustCenterResponse["owner"] }) {
  return (
    <ListRow $divided>
      <IconBadge>{owner.name.charAt(0)}</IconBadge>
      <Stack $grow $gap="s4">
        <Text weight="semibold">{owner.name} · Owner</Text>
        <Text size="sm" tone="muted">
          Full access cannot be changed
        </Text>
      </Stack>
      <ControlSlot>
        <Select disabled value="OWNER" aria-label="Owner access">
          <option>Owner</option>
        </Select>
      </ControlSlot>
    </ListRow>
  );
}

function MemberRow({
  member,
  onChange,
  onEdit,
  onResend,
  onResetPin,
  onRemove,
  removing,
}: {
  member: TrustMember;
  onChange: (accessType: TrustMemberPayload["accessTypeCode"]) => void;
  onEdit: () => void;
  onResend: () => void;
  onResetPin: () => void;
  onRemove: () => void;
  removing: boolean;
}) {
  return (
    <ListRow $divided>
      <IconBadge>{member.name.charAt(0)}</IconBadge>
      <Stack $grow $gap="s4">
        <Text weight="semibold">
          {member.name} · {member.relationLabel}
        </Text>
        <Text size="sm" tone="muted">
          {member.status} · DOB {member.dateOfBirth} · {member.bloodGroup}
          {member.invitationStatus === "EXPIRED" ? " · Expired" : null}
          {member.invitationStatus === "PENDING" && member.inviteExpiresAt
            ? ` · Expires ${new Date(member.inviteExpiresAt).toLocaleString()}`
            : null}
        </Text>
      </Stack>
      <ControlSlot>
        <Select
          value={member.accessType.code}
          onChange={(event) =>
            onChange(event.target.value as TrustMemberPayload["accessTypeCode"])
          }
          aria-label={`${member.name} access`}
        >
          {accessTypes.map((accessType) => (
            <option key={accessType} value={accessType}>
              {accessLabels[accessType]}
            </option>
          ))}
        </Select>
      </ControlSlot>
      <Button
        size="sm"
        iconOnly
        variant="tertiary"
        aria-label={`Edit ${member.name}`}
        title={`Edit ${member.name}`}
        onClick={onEdit}
      >
        <Pencil aria-hidden="true" />
      </Button>
      {(member.status === "INVITED" ||
        member.invitationStatus === "EXPIRED") && (
        <>
          <Button size="sm" variant="tertiary" onClick={onResend}>
            Resend Invitation
          </Button>
          <Button
            size="sm"
            iconOnly
            variant="tertiary"
            aria-label={`Reset PIN for ${member.name}`}
            title={`Reset PIN for ${member.name}`}
            onClick={onResetPin}
          >
            <KeyRound aria-hidden="true" />
          </Button>
        </>
      )}
      <Button
        size="sm"
        tone="danger"
        iconOnly
        variant="tertiary"
        aria-label={`Remove ${member.name}`}
        title={`Remove ${member.name}`}
        disabled={removing}
        onClick={onRemove}
      >
        <X aria-hidden="true" />
      </Button>
    </ListRow>
  );
}

function MemberModal({
  initial,
  enabledModules,
  onClose,
  onSave,
}: {
  initial?: TrustMember;
  enabledModules: TrustPermission["module"][];
  onClose: () => void;
  onSave: (payload: TrustMemberPayload) => Promise<void>;
}) {
  const [draft, setDraft] = useState<TrustMemberPayload>(() =>
    initial
      ? {
          name: initial.name,
          email: initial.email,
          relation: initial.relation as TrustMemberPayload["relation"],
          customRelation: initial.customRelation ?? undefined,
          dateOfBirth: initial.dateOfBirth,
          bloodGroup: initial.bloodGroup as TrustMemberPayload["bloodGroup"],
          accessTypeCode: initial.accessType
            .code as TrustMemberPayload["accessTypeCode"],
          permissions: initial.permissions,
        }
      : emptyDraft,
  );
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const update = (patch: Partial<TrustMemberPayload>) =>
    setDraft((current) => ({ ...current, ...patch }));
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      await onSave({
        ...draft,
        permissions: defaultPermissions(enabledModules, draft.permissions),
      });
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Unable to save member.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalBackdrop onClick={onClose}>
      <ModalPanel
        onDismiss={onClose}
        aria-label="Trusted access"
        size="compact"
        as="form"
        onSubmit={submit}
        onClick={(event) => event.stopPropagation()}
      >
        <ModalHeader>
          <Heading level={2} size="sm">
            {initial ? "Edit family member" : "Add a family member"}
          </Heading>
          <Button
            iconOnly
            variant="tertiary"
            size="sm"
            onClick={onClose}
            aria-label="Close"
          >
            <X aria-hidden="true" />
          </Button>
        </ModalHeader>
        <Stack $gap="s16">
          <Field label="Name">
            <Input
              required
              value={draft.name}
              onChange={(event) => update({ name: event.target.value })}
              placeholder="e.g. Taylor Morgan"
            />
          </Field>
          <Field label="Email">
            <Input
              required
              type="email"
              value={draft.email}
              onChange={(event) => update({ email: event.target.value })}
              placeholder="name@example.com"
            />
          </Field>
          <Grid>
            <Field label="Relation">
              <Select
                value={draft.relation}
                onChange={(event) =>
                  update({
                    relation: event.target
                      .value as TrustMemberPayload["relation"],
                  })
                }
              >
                {relations.map((relation) => (
                  <option key={relation} value={relation}>
                    {labelize(relation)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Access">
              <Select
                value={draft.accessTypeCode}
                onChange={(event) =>
                  update({
                    accessTypeCode: event.target
                      .value as TrustMemberPayload["accessTypeCode"],
                  })
                }
              >
                {accessTypes.map((accessType) => (
                  <option key={accessType} value={accessType}>
                    {accessLabels[accessType]}
                  </option>
                ))}
              </Select>
            </Field>
          </Grid>
          {draft.relation === "OTHER" && (
            <Field label="Custom relation">
              <Input
                required
                value={draft.customRelation ?? ""}
                onChange={(event) =>
                  update({ customRelation: event.target.value })
                }
              />
            </Field>
          )}
          <Grid>
            <Field label="Date of birth">
              <Input
                required
                type="date"
                value={draft.dateOfBirth}
                onChange={(event) =>
                  update({ dateOfBirth: event.target.value })
                }
              />
            </Field>
            <Field label="Blood group">
              <Select
                value={draft.bloodGroup}
                onChange={(event) =>
                  update({
                    bloodGroup: event.target
                      .value as TrustMemberPayload["bloodGroup"],
                  })
                }
              >
                {bloodGroups.map((blood) => (
                  <option key={blood} value={blood}>
                    {blood}
                  </option>
                ))}
              </Select>
            </Field>
          </Grid>
          {!initial && (
            <>
              <Field label="6-digit PIN">
                <Input
                  required
                  inputMode="numeric"
                  maxLength={6}
                  value={draft.pin}
                  onChange={(event) =>
                    update({
                      pin: event.target.value.replace(/\D/g, "").slice(0, 6),
                    })
                  }
                  placeholder="Share separately"
                />
              </Field>
            </>
          )}
          <Text as="p" size="sm" tone="muted">
            {accessCopy[draft.accessTypeCode]}
          </Text>
          {formError && (
            <Text tone="danger" role="alert">
              {formError}
            </Text>
          )}
          <Button
            fullWidth
            loading={saving}
            variant="primary"
            type="submit"
            disabled={
              saving ||
              !draft.name.trim() ||
              !draft.email.trim() ||
              (!initial && !/^\d{6}$/.test(draft.pin ?? ""))
            }
          >
            {saving
              ? "Saving..."
              : initial
                ? "Save changes"
                : "Send invitation"}
          </Button>
        </Stack>
      </ModalPanel>
    </ModalBackdrop>
  );
}

function defaultPermissions(
  enabledModules: TrustPermission["module"][],
  permissions: TrustPermission[],
) {
  return enabledModules.map(
    (module) =>
      permissions.find((permission) => permission.module === module) ?? {
        module,
        canView: module === "DOCUMENTS",
        canDownload: false,
      },
  );
}

function isTrustMember(value: unknown): value is TrustMember {
  return Boolean(
    value &&
    typeof value === "object" &&
    "id" in value &&
    "accessType" in value,
  );
}

function invitationNotice(member: TrustMember) {
  const delivery = member.invitationDelivery;
  if (!delivery) return null;
  if (delivery.sent) return `Invitation email sent to ${member.email}.`;
  if (delivery.reason === "email_disabled")
    return "Invitation saved, but email is disabled because SMTP configuration is incomplete.";
  if (delivery.reason === "invalid_recipient")
    return "Invitation saved, but the email address is not valid.";
  return `Invitation saved, but email delivery failed${delivery.errorCode ? ` (${delivery.errorCode})` : ""}.`;
}

function labelize(value: string) {
  return value
    .toLowerCase()
    .replace(
      /(^|_)([a-z])/g,
      (_match, prefix: string, letter: string) =>
        `${prefix ? " " : ""}${letter.toUpperCase()}`,
    );
}
