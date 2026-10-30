import { Heading, Text, ModalBackdrop, ModalPanel, SelectMenu, Button } from "@/design-system";

import { useState } from "react";
import { X } from "lucide-react";
import type { HealthMember, HealthMemberResolution } from "@/lib/api.types";

function MemberResolutionDialog({
  resolution,
  members,
  onClose,
  onCreateProfile,
  onConfirm,
}: {
  resolution: HealthMemberResolution;
  members: HealthMember[];
  onClose: () => void;
  onCreateProfile: () => void;
  onConfirm: (memberId: string) => Promise<void>;
}) {
  const [memberId, setMemberId] = useState(
    resolution.memberMatch.candidates[0]?.id ?? "",
  );
  const [choosingExisting, setChoosingExisting] = useState(false);
  const [saving, setSaving] = useState(false);
  const patientName = resolution.patient?.name?.trim();
  const ambiguous = resolution.memberMatch.status === "ambiguous";
  if (
    !ambiguous &&
    resolution.memberMatch.status === "unmatched" &&
    patientName
  )
    return (
      <ModalBackdrop  style={{ zIndex: "var(--layer-nestedDialog)" }}>
        <ModalPanel onDismiss={onClose}
          className="lp-health-add-dialog"
          role="dialog"
          aria-modal="true"
        >
          <header className="lp-health-dialog-head">
            <Heading level={2} size="md">No Health profile found for {patientName}.</Heading>
            <Button size="sm" iconOnly variant="tertiary" type="button" onClick={onClose} aria-label="Close">
              <X aria-hidden="true" focusable="false" size="var(--icon-regular)" />
            </Button>
          </header>
          <Text as="p" size="md">This record appears to belong to a new person.</Text>
          <footer>
            <Button variant="primary" type="button" onClick={onCreateProfile}>
              Create profile for {patientName}
            </Button>
            <Button variant="secondary"
              type="button"
              onClick={() => setChoosingExisting(true)}
            >
              Choose existing profile
            </Button>
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
          </footer>
          {choosingExisting ? (
            <div className="lp-health-form">
              <Text as="label" size="sm" weight="medium">
                <span>Who does this record belong to?</span>
                <SelectMenu
                  value={memberId}
                  onValueChange={(selectedValue) => setMemberId(selectedValue)}
                  options={[
                    { value: "", label: "Choose a profile" },
                    ...members.map((member) => ({
                      value: member.id,
                      label: (
                        <>
                          {member.name} · {member.relation}
                        </>
                      ),
                    })),
                  ]}
                />
              </Text>
              {memberId ? (
                <Button variant="primary"
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    setSaving(true);
                    void onConfirm(memberId).finally(() => setSaving(false));
                  }}
                >
                  Confirm
                </Button>
              ) : null}
            </div>
          ) : null}
        </ModalPanel>
      </ModalBackdrop>
    );
  return (
    <ModalBackdrop  style={{ zIndex: "var(--layer-nestedDialog)" }}>
      <ModalPanel onDismiss={onClose}
        className="lp-health-add-dialog"
        role="dialog"
        aria-modal="true"
      >
        <header className="lp-health-dialog-head">
          <Heading level={2} size="md">
            {ambiguous
              ? "We found more than one matching profile."
              : "We couldn't identify who this health record belongs to."}
          </Heading>
          <Button size="sm" iconOnly variant="tertiary" type="button" onClick={onClose} aria-label="Close">
            <X aria-hidden="true" focusable="false" size="var(--icon-regular)" />
          </Button>
        </header>
        <Text as="p" size="md">
          {ambiguous
            ? "Who does this record belong to?"
            : "Choose an existing profile to continue."}
        </Text>
        <div className="lp-health-form">
          <Text as="label" size="sm" weight="medium">
            <span>Health profile</span>
            <SelectMenu
              value={memberId}
              onValueChange={(selectedValue) => setMemberId(selectedValue)}
              options={[
                { value: "", label: "Choose a profile" },
                ...(ambiguous ? resolution.memberMatch.candidates : members).map(
                  (member) => ({
                    value: member.id,
                    label: (
                      <>
                        {member.name} · {member.relation}
                      </>
                    ),
                  }),
                ),
              ]}
            />
          </Text>
        </div>
        <footer>
          <Button variant="secondary"
            type="button"
            disabled={saving}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button loading={saving} variant="primary"
            type="button"
            disabled={!memberId || saving}
            onClick={async () => {
              setSaving(true);
              await onConfirm(memberId);
              setSaving(false);
            }}
          >
            {saving ? "Assigning..." : "Confirm"}
          </Button>
        </footer>
      </ModalPanel>
    </ModalBackdrop>
  );
}

export default MemberResolutionDialog;
