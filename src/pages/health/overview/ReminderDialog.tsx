import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { Button, Choice, ChoiceGroup, Heading, Input, ModalBackdrop, ModalPanel, SelectMenu, Text, Textarea } from "@/design-system";
import { api } from "@/lib/api";
import type { HealthReminder, HealthReminderFrequency, HealthReminderInput, HealthReminderType, HealthTimelineEvent, TrackedHealthMetric } from "@/lib/api.types";
import { reminderFrequencyOptions, reminderTypeOptions } from "../HealthDialog.HealthDialogKind";
import { healthTimestamp, scheduleFields } from "../healthDateTime";

export default function ReminderDialog({ memberId, timeline, tracked = [], reminder, initialMedicationId, onSaved, onClose }: {
  memberId: string;
  timeline: HealthTimelineEvent[];
  tracked?: TrackedHealthMetric[];
  reminder?: HealthReminder;
  initialMedicationId?: string;
  onSaved: () => Promise<void>;
  onClose: () => void;
}) {
  const schedule = scheduleFields(reminder?.scheduledAt ?? reminder?.dueDate, reminder?.timeZone);
  const [form, setForm] = useState({
    title: reminder?.title ?? "",
    type: reminderTypeOptions.find(option => option.value === reminder?.type)?.value ?? (initialMedicationId ? "medicine" as const : ""),
    frequency: reminderFrequencyOptions.find(option => option.value === reminder?.frequency)?.value ?? (reminder ? "once" as const : ""),
    endDate: reminder?.endDate ?? "",
    notes: reminder?.notes ?? "",
    medicationId: reminder?.medicationId ?? initialMedicationId ?? "",
    trackedMetricId: reminder?.trackedMetricId ?? "",
    ...schedule,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const update = <K extends keyof typeof form>(key: K, value: typeof form[K]) => setForm(current => ({ ...current, [key]: value }));
  const medicines = timeline.filter(event => event.eventType === "medication");
  const valid = form.title.trim() && form.type && form.date && form.frequency;
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!valid || saving) return;
    setSaving(true);
    setError("");
    try {
      const payload: HealthReminderInput = {
        title: form.title.trim(),
        type: form.type as HealthReminderType,
        frequency: form.frequency as HealthReminderFrequency,
        dueDate: healthTimestamp(form.date, form.time, form.timeZone),
        ...(form.time || reminder?.timeZone ? { timeZone: form.time ? form.timeZone.trim() : null } : {}),
        ...(form.endDate || reminder?.endDate ? { endDate: form.frequency === "once" ? null : form.endDate || null } : {}),
        ...(form.notes.trim() || reminder?.notes ? { notes: form.notes.trim() || null } : {}),
        ...(form.medicationId || reminder?.medicationId ? { medicationId: form.medicationId || null } : {}),
        ...(form.trackedMetricId || reminder?.trackedMetricId ? { trackedMetricId: form.type === "reading" ? form.trackedMetricId || null : null } : {}),
      };
      if (reminder) {
        const timeChanged = form.date !== schedule.date || form.time !== schedule.time || form.timeZone.trim() !== schedule.timeZone;
        if (timeChanged) await api.health.updateReminder(reminder.id, payload);
        else {
          const { dueDate: _dueDate, timeZone: _timeZone, ...updates } = payload;
          await api.health.updateReminder(reminder.id, updates);
        }
      } else await api.health.createReminder({ memberId, ...payload });
      await onSaved();
      onClose();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save reminder.");
    } finally {
      setSaving(false);
    }
  }

  return <ModalBackdrop>
    <ModalPanel onDismiss={onClose} className="lp-health-add-dialog" role="dialog" aria-modal="true" aria-labelledby="health-reminder-title">
      <header className="lp-health-dialog-head">
        <Heading level={2} size="md" id="health-reminder-title">{reminder ? "Edit reminder" : "Add a reminder"}</Heading>
        <Button size="sm" iconOnly variant="tertiary" type="button" onClick={onClose} aria-label="Close"><X aria-hidden="true" /></Button>
      </header>
      <form onSubmit={save} className="lp-health-form lp-health-reminder-form">
        <Text as="label" size="sm" weight="medium" className="lp-health-reminder-title">
          Title
          <Input required maxLength={180} value={form.title} onChange={event => update("title", event.target.value)} placeholder="e.g. Cardiology follow-up" />
        </Text>
        <fieldset className="lp-health-reminder-choice">
          <Text size="md">What for</Text>
          <ChoiceGroup aria-label="What for">
            {reminderTypeOptions.map(option => <Choice key={option.value} type="button" aria-pressed={form.type === option.value} onClick={() => update("type", option.value)}>{option.label}</Choice>)}
          </ChoiceGroup>
        </fieldset>
        <Text as="label" size="sm" weight="medium" className="lp-health-reminder-due">
          Due
          <Input required type="date" value={form.date} onChange={event => update("date", event.target.value)} />
        </Text>
        <Text as="label" size="sm" weight="medium">Time (optional)
          <Input type="time" value={form.time} onChange={event => update("time", event.target.value)} />
        </Text>
        <Text as="label" size="sm" weight="medium">Time zone
          <Input required={Boolean(form.time)} value={form.timeZone} onChange={event => update("timeZone", event.target.value)} placeholder="Asia/Kolkata" />
        </Text>
        <fieldset className="lp-health-reminder-choice">
          <Text size="md">How often</Text>
          <ChoiceGroup aria-label="How often">
            {reminderFrequencyOptions.map(option => <Choice key={option.value} type="button" aria-pressed={form.frequency === option.value} onClick={() => update("frequency", option.value)}>{option.label}</Choice>)}
          </ChoiceGroup>
        </fieldset>
        {form.frequency && form.frequency !== "once" && <Text as="label" size="sm" weight="medium">End date (optional)
          <Input type="date" min={form.date} value={form.endDate} onChange={event => update("endDate", event.target.value)} />
        </Text>}
        {(medicines.length > 0 || form.medicationId) && <Text as="label" size="sm" weight="medium">Linked medicine
          <SelectMenu aria-label="Linked medicine" value={form.medicationId} onValueChange={value => update("medicationId", value)} options={[
            { value: "", label: "No medicine" },
            ...medicines.map(item => ({ value: item.id, label: item.title })),
          ]} />
        </Text>}
        {form.type === "reading" && <Text as="label" size="sm" weight="medium">Tracked metric (optional)
          <SelectMenu aria-label="Tracked metric" value={form.trackedMetricId} onValueChange={value => update("trackedMetricId", value)} options={[
            { value: "", label: "No metric" },
            ...tracked.map(item => ({ value: item.id, label: [item.displayName, item.context, item.bodySite].filter(Boolean).join(" · ") })),
          ]} />
        </Text>}
        <Text as="label" size="sm" weight="medium">Notes (optional)
          <Textarea value={form.notes} onChange={event => update("notes", event.target.value)} />
        </Text>
        {error && <Text as="p" tone="danger" role="alert">{error}</Text>}
        <Button variant="primary" loading={saving} type="submit" disabled={saving || !valid}>{reminder ? "Save reminder" : "Add a reminder"}</Button>
      </form>
      <footer><Button variant="secondary" type="button" onClick={onClose}>Close</Button></footer>
    </ModalPanel>
  </ModalBackdrop>;
}
