import { Heading, Text, ModalBackdrop, ModalPanel, SelectMenu, Button, Row, Stack } from "@/design-system";

import { useState } from "react";
import { X } from "lucide-react";
import { api } from "@/lib/api";
import type { DocumentRecord, HealthMember, HealthMemberResolution } from "@/lib/api.types";
import { InsuranceDocumentPreview as ReportPreview } from "../HealthDialog.InsuranceDocumentPreview";

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
  const [memberId, setMemberId] = useState("");
  const [choosingExisting, setChoosingExisting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [report, setReport] = useState<DocumentRecord | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [reportError, setReportError] = useState("");
  const patientName = resolution.patient?.name?.trim();

  const toggleReport = async () => {
    if (report) {
      setReport(null);
      return;
    }

    setLoadingReport(true);
    setReportError("");
    try {
      setReport(await api.documents.getById(resolution.documentId));
    } catch (error) {
      setReportError(error instanceof Error ? error.message : "Could not open this report.");
    } finally {
      setLoadingReport(false);
    }
  };

  const reportDetails = (
    <Stack $gap="s8" $spaceAfter="s12">
      <Row $justify="space-between" $gap="s8">
        <Text size="sm" tone="muted">
          Report: <b>{report?.originalName || resolution.documentName || "Saved health report"}</b>
        </Text>
        <Button
          variant="secondary"
          size="sm"
          type="button"
          loading={loadingReport}
          disabled={saving}
          aria-expanded={Boolean(report)}
          onClick={() => void toggleReport()}
        >
          {report ? "Hide report" : "View report"}
        </Button>
      </Row>
      {reportError ? <Text as="p" size="sm" tone="danger" role="alert">{reportError}</Text> : null}
      {report ? <ReportPreview document={report} /> : null}
    </Stack>
  );
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
          {reportDetails}
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
              ? (resolution.memberMatch.candidates.length > 1 ? "We found more than one possible profile." : "Please confirm the patient profile.")
              : "We couldn't identify who this health record belongs to."}
          </Heading>
          <Button size="sm" iconOnly variant="tertiary" type="button" onClick={onClose} aria-label="Close">
            <X aria-hidden="true" focusable="false" size="var(--icon-regular)" />
          </Button>
        </header>
        {reportDetails}
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
