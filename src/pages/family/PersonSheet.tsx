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
  SelectMenu,
  Button,
} from "@/design-system";
import { Trash2, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { api, type TrustMember, type TrustMemberPayload } from "@/lib/api";
import {
  type Draft,
  type AccessCode,
  permissions,
  draftFromMember,
  relationOptions,
  accessLabels,
  bloodGroups,
} from "./family-model";
export default function PersonSheet({
  person,
  members,
  onClose,
  onSaved,
  onRemove,
}: {
  person?: TrustMember;
  members: TrustMember[];
  onClose: () => void;
  onSaved: () => Promise<void>;
  onRemove: (member: TrustMember) => void;
}) {
  const [draft, setDraft] = useState<Draft>(() => draftFromMember(person));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const update = (patch: Partial<Draft>) =>
    setDraft((current) => ({ ...current, ...patch }));
  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const [relation, customRelation] = draft.relationKey.split(":") as [
      TrustMemberPayload["relation"],
      string,
    ];
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
        if (draft.accessTypeCode === "FAMILY_MEMBER")
          await Promise.all(
            members
              .filter((member) => member.accessType.id === "FAMILY_MEMBER")
              .map((member) =>
                api.trust.updateMember(member.id, {
                  accessTypeCode: "EMERGENCY_ACCESS",
                  permissions: permissions("EMERGENCY_ACCESS"),
                }),
              ),
          );
        await api.trust.addFamilyMember(payload);
      }
      await onSaved();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save this person.",
      );
    } finally {
      setSaving(false);
    }
  }
  return (
    <ModalBackdrop onClick={onClose}>
      <ModalPanel
        size="compact"
        onDismiss={onClose}
        aria-label="Family access"
        as="form"
        onClick={(event) => event.stopPropagation()}
        onSubmit={submit}
      >
        <ModalHeader>
          <Heading level={2} size="sm">
            {person ? "Edit person" : "Add person"}
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
          <Field label="Name">
            <Input
              required
              value={draft.name}
              onChange={(event) => update({ name: event.target.value })}
            />
          </Field>
          <Field label="Email">
            <Input
              required
              type="email"
              value={draft.email}
              onChange={(event) => update({ email: event.target.value })}
            />
          </Field>
          <Grid>
            <Field label="Relation">
              <SelectMenu
                value={draft.relationKey}
                onValueChange={(selectedValue) => update({ relationKey: selectedValue })}
                options={relationOptions.map(([value, text]) => ({
                  value: `${value}:${text}`,
                  label: text,
                }))}
              />
            </Field>
            <Field label="Access">
              <SelectMenu
                value={draft.accessTypeCode}
                onValueChange={(selectedValue) =>
                  update({ accessTypeCode: selectedValue as AccessCode })
                }
                options={Object.entries(accessLabels).map(([value, text]) => ({
                  value: value,
                  label: text,
                }))}
              />
            </Field>
          </Grid>
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
              <SelectMenu
                value={draft.bloodGroup}
                onValueChange={(selectedValue) =>
                  update({
                    bloodGroup: selectedValue as Draft["bloodGroup"],
                  })
                }
                options={bloodGroups.map((blood) => ({ value: blood, label: blood }))}
              />
            </Field>
          </Grid>
          {error && (
            <Text role="alert" size="sm" tone="danger">
              {error}
            </Text>
          )}
          <Row>
            {person && (
              <Button
                tone="danger"
                variant="secondary"
                onClick={() => onRemove(person)}
              >
                <Trash2 aria-hidden="true" /> Remove
              </Button>
            )}
            <Button
              fullWidth
              loading={saving}
              variant="primary"
              type="submit"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save person"}
            </Button>
          </Row>
        </Stack>
      </ModalPanel>
    </ModalBackdrop>
  );
}
