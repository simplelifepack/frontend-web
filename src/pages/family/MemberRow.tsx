import {
  Heading,
  Field,
  Grid,
  Stack,
  Row,
  IconBadge,
  ListRow,
  ModalHeader,
  Text,
  Checkbox,
  ModalBackdrop,
  ModalPanel,
  Input,
  Select,
  Button,
} from "@/design-system";
import { Pencil } from "lucide-react";
import type { TrustMember } from "@/lib/api";
import { type AccessCode, avatarColors } from "./family-model";
export default function MemberRow({
  member,
  primaryId,
  busy,
  onEdit,
  onPrimary,
  onToggle,
}: {
  member: TrustMember;
  primaryId?: string;
  busy: boolean;
  onEdit: () => void;
  onPrimary: () => void;
  onToggle: (checked: boolean) => void;
}) {
  const access = member.accessType.id as AccessCode;
  const canStepIn = access === "FAMILY_MEMBER" || access === "EMERGENCY_ACCESS";
  const primary = member.id === primaryId && access === "FAMILY_MEMBER";
  const tone =
    avatarColors[
      Math.abs(
        [...member.id].reduce((sum, char) => sum + char.charCodeAt(0), 0),
      ) % avatarColors.length
    ];
  return (
    <ListRow $divided aria-busy={busy}>
      <IconBadge $tone={tone}>{member.name.charAt(0).toUpperCase()}</IconBadge>
      <Stack $grow $gap="s4">
        <Text weight="semibold" tone="heading">
          {member.name}
          <Text tone="muted" weight="medium">
            {" "}
            · {member.relationLabel}
          </Text>
        </Text>
        {primary && (
          <Text size="sm" tone="success">
            Primary
          </Text>
        )}
      </Stack>
      {canStepIn && !primary && (
        <Button variant="secondary" disabled={busy} onClick={onPrimary}>
          Make primary
        </Button>
      )}
      <Button
        size="sm"
        iconOnly
        variant="tertiary"
        onClick={onEdit}
        title={`Edit ${member.name}`}
        aria-label={`Edit ${member.name}`}
      >
        <Pencil aria-hidden="true" />
      </Button>
      <Row as="label">
        <Checkbox
          aria-label={`${member.name} emergency access`}
          checked={canStepIn}
          disabled={busy}
          onChange={(event) => onToggle(event.target.checked)}
        />
      </Row>
    </ListRow>
  );
}
