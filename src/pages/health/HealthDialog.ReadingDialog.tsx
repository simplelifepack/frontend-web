import { Heading, Text, ModalPanel, ModalBackdrop, Input, Button } from "@/design-system";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { api } from "@/lib/api";
import type { HealthMeasurement, HealthMember } from "@/lib/api.types";
import { buildReadingTests, todayInputDate, metricKeyFromName } from "./HealthDialog.ReadingTest";


export function ReadingDialog({
  member,
  measurements,
  onClose,
  onSaved,
}: {
  member: HealthMember;
  measurements: HealthMeasurement[];
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
  const [value, setValue] = useState("0");
  const [date, setDate] = useState(todayInputDate());
  const [rangeLow, setRangeLow] = useState("");
  const [rangeHigh, setRangeHigh] = useState("");
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
  const testName = custom ? customName.trim() : selected?.label ?? "";
  const testUnit = custom ? unit.trim() : selected?.unit ?? "";
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
      await api.health.createMeasurement(member.id, {
        metricKey: custom ? metricKeyFromName(testName) : selected!.key,
        displayName: testName,
        originalName: testName,
        value: numericValue,
        unit: testUnit,
        context: custom ? null : selected?.context ?? null,
        bodySite: custom ? null : selected?.bodySite ?? null,
        referenceMin: min,
        referenceMax: max,
        referenceText:
          min != null || max != null
            ? [min ?? "", max ?? ""].join(" - ").trim()
            : null,
        measuredAt: date,
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
          <Heading level={2} size="sm" id="reading-dialog-title">Log a reading for {firstName}</Heading>
          <Button size="sm" iconOnly variant="tertiary" onClick={onClose} aria-label="Close" type="button">
            <X aria-hidden="true" focusable="false" size="var(--icon-regular)" />
          </Button>
        </header>
        <form className="lp-reading-form" onSubmit={saveReading}>
          <section>
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
          </section>
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
