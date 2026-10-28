import { Stack, IconBadge, ListRow, ControlSlot, Text, Select, Button } from "@/design-system";
import { KeyRound, Pencil, X } from "lucide-react";
import { type TrustCenterResponse, type TrustMember, type TrustMemberPayload } from "@/lib/api";
import { accessTypes, accessLabels } from "./index.relations";


export function OwnerRow({ owner }: { owner: TrustCenterResponse["owner"] }) {
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


export function MemberRow({
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
