import { Heading, Text, ChoiceGroup, Choice, ModalPanel, ModalBackdrop, Input, Select, Textarea, Button } from "@/design-system";
import { X } from "lucide-react";
import { reminderTypeOptions, reminderFrequencyOptions } from "./HealthDialog.HealthDialogKind";
import { ReadingDialog } from "./HealthDialog.ReadingDialog";
import { EmergencyCardDialog, InsuranceCardDialog } from "./HealthDialog.EmergencyCardDialog";
import { VisitPackDialog } from "./HealthDialog.VisitPackDialog";
import { useHealthDialogLogic } from "./HealthDialog.documentDetail";


export function HealthDialog(props: Parameters<typeof useHealthDialogLogic>[0]) {
const context = useHealthDialogLogic(props);
const { kind, member, records, measurements, onClose, onSaved, onViewDocument, title, setTitle, date, setDate, reminderType, setReminderType, reminderFrequency, setReminderFrequency, bloodGroup, setBloodGroup, conditions, setConditions, allergies, setAllergies, emergencyContactName, setEmergencyContactName, emergencyContactPhone, setEmergencyContactPhone, primaryDoctor, setPrimaryDoctor, insuranceProvider, setInsuranceProvider, insurancePolicyNumber, setInsurancePolicyNumber, error, setError, saving, setSaving, titles, save } = context;
if (kind === "visit")
    return (
      <VisitPackDialog
        member={member}
        records={records}
        onClose={onClose}
        onViewDocument={onViewDocument}
      />
    );
if (kind === "emergency")
    return (
      <EmergencyCardDialog
        member={member}
        records={records}
        onClose={onClose}
      />
    );
if (kind === "insurance")
    return (
      <InsuranceCardDialog
        records={records}
        onClose={onClose}
      />
    );
if (kind === "reading")
    return (
      <ReadingDialog
        member={member}
        measurements={measurements}
        onClose={onClose}
        onSaved={onSaved}
      />
    );
return ((
    <ModalBackdrop >
      <ModalPanel onDismiss={onClose}
        className={`lp-health-add-dialog${kind === "profile" ? " lp-health-profile-dialog" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="health-action-title"
      >
        <header className="lp-health-dialog-head">
          <Heading level={2} size="md" id="health-action-title">{titles[kind]}</Heading>
          <Button size="sm" iconOnly variant="tertiary" type="button" onClick={onClose} aria-label="Close">
            <X aria-hidden="true" focusable="false" size="var(--icon-regular)" />
          </Button>
        </header>
        {kind === "reminder" ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void save();
            }}
            className="lp-health-form lp-health-reminder-form"
          >
            <Text as="label" size="sm" weight="semibold" className="lp-health-reminder-title">
              Title
              <Input
                required
                maxLength={180}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Cardiology follow-up"
              />
            </Text>
            <fieldset className="lp-health-reminder-choice">
              <Text size="md">What for</Text>
              <ChoiceGroup  aria-label="What for">
                {reminderTypeOptions.map((option) => (
                  <Choice key={option.value} type="button" aria-pressed={reminderType === option.value} onClick={() => setReminderType(option.value)}>
                    {option.label}
                  </Choice>
                ))}
              </ChoiceGroup>
            </fieldset>
            <Text as="label" size="sm" weight="semibold" className="lp-health-reminder-due">
              Due
              <Input
                required
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="dd/mm/yyyy"
              />
            </Text>
            <fieldset className="lp-health-reminder-choice">
              <Text size="md">How often</Text>
              <ChoiceGroup  aria-label="How often">
                {reminderFrequencyOptions.map((option) => (
                  <Choice key={option.value} type="button" aria-pressed={reminderFrequency === option.value} onClick={() => setReminderFrequency(option.value)}>
                    {option.label}
                  </Choice>
                ))}
              </ChoiceGroup>
            </fieldset>
            <Button variant="primary" type="submit" disabled={saving || !title.trim() || !reminderType || !date || !reminderFrequency}>
              Add reminder
            </Button>
          </form>
        ) : null}
        {kind === "profile" ? (
          <form
            id="health-profile-form"
            onSubmit={(e) => {
              e.preventDefault();
              void save();
            }}
            className="lp-health-form lp-health-profile-form"
          >
            <Text as="label" size="sm" weight="semibold">
              Blood group
              <Select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
              >
                {[
                  "Unknown",
                  "A+",
                  "A-",
                  "B+",
                  "B-",
                  "AB+",
                  "AB-",
                  "O+",
                  "O-",
                ].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </Select>
            </Text>
            <Text as="label" size="sm" weight="semibold">
              Conditions
              <Textarea
                value={conditions}
                onChange={(e) => setConditions(e.target.value)}
                maxLength={2000}
                placeholder="e.g. asthma, diabetes"
              />
            </Text>
            <Text as="label" size="sm" weight="semibold">
              Allergies
              <Textarea
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                maxLength={2000}
                placeholder="e.g. penicillin, peanuts"
              />
            </Text>
            <Text as="label" size="sm" weight="semibold">
              Emergency contact name
              <Input
                value={emergencyContactName}
                onChange={(e) => setEmergencyContactName(e.target.value)}
                maxLength={120}
              />
            </Text>
            <Text as="label" size="sm" weight="semibold">
              Emergency contact phone
              <Input
                value={emergencyContactPhone}
                onChange={(e) => setEmergencyContactPhone(e.target.value)}
                maxLength={40}
                inputMode="tel"
              />
            </Text>
            <Text as="label" size="sm" weight="semibold">
              Primary doctor
              <Input
                value={primaryDoctor}
                onChange={(e) => setPrimaryDoctor(e.target.value)}
                maxLength={160}
              />
            </Text>
            <Text as="label" size="sm" weight="semibold">
              Insurance provider
              <Input
                value={insuranceProvider}
                onChange={(e) => setInsuranceProvider(e.target.value)}
                maxLength={160}
              />
            </Text>
            <Text as="label" size="sm" weight="semibold">
              Policy number
              <Input
                value={insurancePolicyNumber}
                onChange={(e) => setInsurancePolicyNumber(e.target.value)}
                maxLength={120}
              />
            </Text>
          </form>
        ) : null}
        {error && <Text as="p" size="md" role="alert">{error}</Text>}
        <footer>
          <Button variant="secondary" type="button" onClick={onClose}>
            Close
          </Button>
          {kind === "profile" ? (
            <Button loading={saving} variant="primary"
              type="submit"
              form="health-profile-form"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save profile"}
            </Button>
          ) : null}
        </footer>
      </ModalPanel>
    </ModalBackdrop>
  ));
}
