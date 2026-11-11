import { Heading, Text, ModalPanel, ModalBackdrop, Input, Textarea, Button } from "@/design-system";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { api } from "@/lib/api";
import type { HealthMeasurement, HealthMember } from "@/lib/api.types";
import { healthTimestamp, scheduleFields } from "./healthDateTime";
import { buildReadingTests, todayInputDate, metricKeyFromName } from "./HealthDialog.ReadingTest";


export function ReadingDialog({
  member,
  measurements,
  reading,
  onClose,
  onSaved,
}: {
  member: HealthMember;
  measurements: HealthMeasurement[];
  reading?: HealthMeasurement;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const readingTests = useMemo(
    () => buildReadingTests(measurements),
    [measurements],
  );
  const [selectedKey, setSelectedKey] = useState("");
  const [custom, setCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [unit, setUnit] = useState("");
  const schedule = scheduleFields(reading?.measuredAt, reading?.timeZone);
  const [value, setValue] = useState(reading ? String(reading.value) : "0");
  const [date, setDate] = useState(schedule.date || todayInputDate());
  const [time, setTime] = useState(schedule.time);
  const [timeZone, setTimeZone] = useState(schedule.timeZone);
  const [source, setSource] = useState(reading?.source ?? "");
  const [notes, setNotes] = useState(reading?.notes ?? "");
  const [rangeLow, setRangeLow] = useState(reading?.referenceMin?.toString() ?? "");
  const [rangeHigh, setRangeHigh] = useState(reading?.referenceMax?.toString() ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!readingTests.length) {
      setCustom(true);
      setSelectedKey("");
      return;
    }
    setCustom(false);
    setSelectedKey((current) =>
      readingTests.some((test) => test.key === current)
        ? current
        : readingTests[0]!.key,
    );
  }, [readingTests]);
  const firstName = member.name.split(" ").filter(Boolean)[0] || member.name;
  const selected =
    readingTests.find((test) => test.key === selectedKey) ??
    readingTests[0] ??
    null;
  const testName = reading?.displayName ?? (custom ? customName.trim() : selected?.label ?? "");
  const testUnit = reading?.unit ?? (custom ? unit.trim() : selected?.unit ?? "");
  const saveReading = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;
    const numericValue = Number(value);
    const min = rangeLow.trim() ? Number(rangeLow) : null;
    const max = rangeHigh.trim() ? Number(rangeHigh) : null;
    if (!testName || !testUnit || !Number.isFinite(numericValue)) {
      setError("Enter the test name, value, and unit.");
      return;
    }
    if ((min != null && !Number.isFinite(min)) || (max != null && !Number.isFinite(max))) {
      setError("Reference ranges must be numbers when provided.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const timing = {
        measuredAt: healthTimestamp(date, time, timeZone),
        ...(time ? { timeZone: timeZone.trim() } : reading?.timeZone ? { timeZone: null } : {}),
      };
      const rangeChanged = !reading || min !== (reading.referenceMin ?? null) || max !== (reading.referenceMax ?? null);
      const payload = {
        value: numericValue,
        ...(rangeChanged ? {
          referenceMin: min,
          referenceMax: max,
          referenceText: min != null || max != null ? [min ?? "", max ?? ""].join(" - ").trim() : null,
        } : {}),
        ...(source.trim() || reading?.source ? { source: source.trim() || null } : {}),
        ...(notes.trim() || reading?.notes ? { notes: notes.trim() || null } : {}),
      };
      if (reading) {
        const timeChanged = date !== schedule.date || time !== schedule.time || timeZone.trim() !== schedule.timeZone;
        await api.health.updateMeasurement(reading.id, { ...payload, ...(timeChanged ? timing : {}) });
      }
      else await api.health.createMeasurement(member.id, {
        ...payload,
        ...timing,
        metricKey: custom ? metricKeyFromName(testName) : selected!.key,
        displayName: testName,
        originalName: testName,
        unit: testUnit,
        context: custom ? null : selected?.context ?? null,
        bodySite: custom ? null : selected?.bodySite ?? null,
      });
      await onSaved();
      onClose();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save reading.");
    } finally {
      setSaving(false);
    }
  };
  return (
    <ModalBackdrop className="lp-reading-backdrop">
      <ModalPanel onDismiss={onClose}
        className="lp-reading-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reading-dialog-title"
      >
        <header className="lp-health-dialog-head">
          <Heading level={2} size="sm" id="reading-dialog-title">{reading ? "Edit " + reading.displayName + " reading" : "Log a reading for " + firstName}</Heading>
          <Button size="sm" iconOnly variant="tertiary" onClick={onClose} aria-label="Close" type="button">
            <X aria-hidden="true" focusable="false" size="var(--icon-regular)" />
          </Button>
        </header>
        <form className="lp-reading-form" onSubmit={saveReading}>
          {!reading && <section>
            <Text as="b" size="sm" weight="semibold">Test</Text>
            {readingTests.length ? (
              <div   className="lp-reading-test-grid">
                {readingTests.map((test) => (
                  <button
                    key={test.key}
                    type="button"
                    className={!custom && selected?.key === test.key ? "active" : ""}
                    onClick={() => {
                      setCustom(false);
                      setSelectedKey(test.key);
                    }}
                  >
                    {test.label}
                  </button>
                ))}
              </div>
            ) : (
              <Text as="p" size="md" weight="medium" className="lp-reading-empty-tests">
                No previous tests found for this profile yet.
              </Text>
            )}
            <Button size="sm" variant="tertiary"
              type="button"
              onClick={() => setCustom(true)}
            >
              Add a test not listed
            </Button>
            {custom ? (
              <div className="lp-reading-custom">
                <Text as="label" size="sm" weight="medium">
                  Test name
                  <Input
                    value={customName}
                    onChange={(event) => setCustomName(event.target.value)}
                    maxLength={160}
                    placeholder="as printed"
                  />
                </Text>
                <Text as="label" size="sm" weight="medium">
                  Unit
                  <Input
                    value={unit}
                    onChange={(event) => setUnit(event.target.value)}
                    maxLength={40}
                    placeholder="as printed"
                  />
                </Text>
              </div>
            ) : null}
          </section>}
          <div className="lp-reading-field-grid">
            <Text as="label" size="sm" weight="medium">
              Value ({testUnit})
              <Input
                required
                inputMode="decimal"
                value={value}
                onChange={(event) => setValue(event.target.value)}
              />
            </Text>
            <Text as="label" size="sm" weight="medium">
              Date
              <Input
                required
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </Text>
            <Text as="label" size="sm" weight="medium">
              Time (optional)
              <Input type="time" value={time} onChange={event => setTime(event.target.value)} />
            </Text>
            <Text as="label" size="sm" weight="medium">
              Time zone
              <Input required={Boolean(time)} value={timeZone} onChange={event => setTimeZone(event.target.value)} placeholder="Asia/Kolkata" />
            </Text>
            <Text as="label" size="sm" weight="medium">
              Source (optional)
              <Input value={source} onChange={event => setSource(event.target.value)} placeholder="Home BP monitor" />
            </Text>
            <Text as="label" size="sm" weight="medium">
              Range low (optional)
              <Input
                inputMode="decimal"
                value={rangeLow}
                onChange={(event) => setRangeLow(event.target.value)}
                placeholder="as printed"
              />
            </Text>
            <Text as="label" size="sm" weight="medium">
              Range high (optional)
              <Input
                inputMode="decimal"
                value={rangeHigh}
                onChange={(event) => setRangeHigh(event.target.value)}
                placeholder="as printed"
              />
            </Text>
          </div>
          <Text as="label" size="sm" weight="medium">
            Notes (optional)
            <Textarea value={notes} onChange={event => setNotes(event.target.value)} />
          </Text>
          <Text as="p" size="md" weight="medium">
            Copy the test name, value, unit, and reference range from your report.
            Readines supplies none of them, so a reading with no range is recorded
            without a status.
          </Text>
          {error ? <Text as="div" size="sm" weight="semibold" className="lp-health-form-error" tone="danger" role="alert">{error}</Text> : null}
          <Button loading={saving} variant="primary" type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save reading"}
          </Button>
        </form>
      </ModalPanel>
    </ModalBackdrop>
  );
}
