import { Stack, Grid, Heading, Field, ModalHeader, Text, SelectMenu, ModalBackdrop, ModalPanel, Input, Button } from "@/design-system";
import type { FormEvent } from "react";
import { useState } from "react";
import { X } from "lucide-react";
import { type TrustMember, type TrustMemberPayload, type TrustPermission } from "@/lib/api";
import { emptyDraft, relations, accessTypes, accessLabels, bloodGroups, accessCopy } from "./index.relations";
import { defaultPermissions, labelize } from "./index.defaultPermissions";


export function MemberModal({
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
              <SelectMenu
                value={draft.relation}
                onValueChange={(selectedValue) =>
                  update({
                    relation: selectedValue as TrustMemberPayload["relation"],
                  })
                }
                options={relations.map((relation) => ({
                  value: relation,
                  label: labelize(relation),
                }))}
              />
            </Field>
            <Field label="Access">
              <SelectMenu
                value={draft.accessTypeCode}
                onValueChange={(selectedValue) =>
                  update({
                    accessTypeCode: selectedValue as TrustMemberPayload["accessTypeCode"],
                  })
                }
                options={accessTypes.map((accessType) => ({
                  value: accessType,
                  label: accessLabels[accessType],
                }))}
              />
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
              <SelectMenu
                value={draft.bloodGroup}
                onValueChange={(selectedValue) =>
                  update({
                    bloodGroup: selectedValue as TrustMemberPayload["bloodGroup"],
                  })
                }
                options={bloodGroups.map((blood) => ({ value: blood, label: blood }))}
              />
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
