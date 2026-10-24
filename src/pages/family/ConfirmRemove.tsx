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
import { X } from "lucide-react";
import { useState } from "react";
import { api, type TrustMember } from "@/lib/api";
export default function ConfirmRemove({
  member,
  onClose,
  onRemoved,
}: {
  member: TrustMember;
  onClose: () => void;
  onRemoved: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  async function remove() {
    setBusy(true);
    await api.trust.revokeMember(member.id);
    await onRemoved();
  }
  return (
    <ModalBackdrop onClick={onClose}>
      <ModalPanel
        size="compact"
        onDismiss={onClose}
        aria-label="Family access"
        onClick={(event) => event.stopPropagation()}
      >
        <ModalHeader>
          <Heading level={2} size="sm">
            Remove {member.name.split(" ")[0]}?
          </Heading>
          <Button
            size="sm"
            iconOnly
            variant="tertiary"
            onClick={onClose}
            aria-label="Close"
          >
            <X aria-hidden="true" />
          </Button>
        </ModalHeader>
        <Stack $gap="s16">
          <Text as="p" tone="muted">
            {member.name} will no longer be able to step in for emergency
            access. Their documents stay in Documents.
          </Text>
          <Row>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              tone="danger"
              loading={busy}
              variant="primary"
              disabled={busy}
              onClick={() => void remove()}
            >
              {busy ? "Removing..." : "Remove"}
            </Button>
          </Row>
        </Stack>
      </ModalPanel>
    </ModalBackdrop>
  );
}
