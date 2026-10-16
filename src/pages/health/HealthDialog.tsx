import { Heading, Text, ChoiceGroup, Choice, ModalPanel, ModalBackdrop, Input, Select, Textarea, Button } from "@/design-system";
import { typography, poppinsFontFaces, typographyVariables } from "@/design-system/variables/typography";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import JSZip from "jszip";
import {
  CalendarClock,
  Check,
  Download,
  FileText,
  FlaskConical,
  Link2,
  Pill,
  ShieldCheck,
  X,
} from "lucide-react";

import UploadDocumentModal from "@/components/UploadDocumentModal";
import { api } from "@/lib/api";
import type {
  DocumentRecord,
  HealthMeasurement,
  HealthMember,
  HealthRecord,
} from "@/lib/api.types";

export type HealthDialogKind =
  | "reminder"
  | "profile"
  | "emergency"
  | "insurance"
  | "visit"
  | "reading";
type VisitContext = {
  id: string;
  label: string;
  kind: "doctor" | "provider" | "recent";
  recordIds: string[];
};
type VisitDocument = { record: HealthRecord; document?: DocumentRecord };
type ReminderType = "appointment" | "medicine" | "refill" | "other";
type ReminderFrequency = "once" | "daily" | "weekly" | "monthly";

const reminderTypeOptions: Array<{ value: ReminderType; label: string }> = [
  { value: "appointment", label: "Appointment" },
  { value: "medicine", label: "Take a medicine" },
  { value: "refill", label: "Refill" },
  { value: "other", label: "Something else" },
];
const reminderFrequencyOptions: Array<{ value: ReminderFrequency; label: string }> = [
  { value: "once", label: "Once" },
  { value: "daily", label: "Every day" },
  { value: "weekly", label: "Every week" },
  { value: "monthly", label: "Every month" },
];

export default function HealthDialog({
  kind,
  member,
  records,
  measurements,
  onClose,
  onSaved,
  onViewDocument,
}: {
  kind: HealthDialogKind;
  member: HealthMember;
  records: HealthRecord[];
  measurements: HealthMeasurement[];
  onClose: () => void;
  onSaved: () => Promise<void>;
  onViewDocument: (documentId: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [reminderType, setReminderType] = useState<ReminderType | "">("");
  const [reminderFrequency, setReminderFrequency] = useState<ReminderFrequency | "">("");
  const [bloodGroup, setBloodGroup] = useState(member.bloodGroup || "Unknown");
  const [conditions, setConditions] = useState(member.conditions || "");
  const [allergies, setAllergies] = useState(member.allergies || "");
  const [emergencyContactName, setEmergencyContactName] = useState(
    member.emergencyContactName || "",
  );
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(
    member.emergencyContactPhone || "",
  );
  const [primaryDoctor, setPrimaryDoctor] = useState(
    member.primaryDoctor || "",
  );
  const [insuranceProvider, setInsuranceProvider] = useState(
    member.insuranceProvider || "",
  );
  const [insurancePolicyNumber, setInsurancePolicyNumber] = useState(
    member.insurancePolicyNumber || "",
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const titles = {
    reminder: "Add reminder",
    profile: "Edit medical profile",
    emergency: "Emergency card",
    reading: "Log reading",
  };
  const save = async () => {
    if (kind === "reminder" && (!title.trim() || !reminderType || !date || !reminderFrequency)) {
      setError("Title, what for, due date, and how often are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (kind === "reminder")
        await api.health.createReminder({
          memberId: member.id,
          title: title.trim(),
          type: reminderType || "other",
          dueDate: date,
          frequency: reminderFrequency || "once",
        });
      else
        await api.health.updateMember(member.id, {
          bloodGroup,
          conditions,
          allergies,
          emergencyContactName,
          emergencyContactPhone,
          primaryDoctor,
          insuranceProvider,
          insurancePolicyNumber,
        });
      await onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save.");
    } finally {
      setSaving(false);
    }
  };

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
  return (
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
  );
}

type ReadingTest = {
  key: string;
  label: string;
  unit: string;
  context?: string | null;
  bodySite?: string | null;
};

function todayInputDate() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
}

function metricKeyFromName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function readingTestKey(measurement: HealthMeasurement) {
  return [
    measurement.metricKey,
    measurement.context ?? "",
    measurement.bodySite ?? "",
  ].join("|");
}

function buildReadingTests(measurements: HealthMeasurement[]) {
  const byKey = new Map<string, ReadingTest>();
  measurements
    .slice()
    .sort((a, b) => (a.measuredAt ?? "").localeCompare(b.measuredAt ?? ""))
    .forEach((measurement) => {
      const key = readingTestKey(measurement);
      byKey.set(key, {
        key,
        label: measurement.displayName,
        unit: measurement.unit,
        context: measurement.context,
        bodySite: measurement.bodySite,
      });
    });
  return [...byKey.values()].sort((a, b) => a.label.localeCompare(b.label));
}

function ReadingDialog({
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
                <Text as="label" size="sm" weight="semibold">
                  Test name
                  <Input
                    value={customName}
                    onChange={(event) => setCustomName(event.target.value)}
                    maxLength={160}
                    placeholder="as printed"
                  />
                </Text>
                <Text as="label" size="sm" weight="semibold">
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
            <Text as="label" size="sm" weight="semibold">
              Value ({testUnit})
              <Input
                required
                inputMode="decimal"
                value={value}
                onChange={(event) => setValue(event.target.value)}
              />
            </Text>
            <Text as="label" size="sm" weight="semibold">
              Date
              <Input
                required
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </Text>
            <Text as="label" size="sm" weight="semibold">
              Range low (optional)
              <Input
                inputMode="decimal"
                value={rangeLow}
                onChange={(event) => setRangeLow(event.target.value)}
                placeholder="as printed"
              />
            </Text>
            <Text as="label" size="sm" weight="semibold">
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
            ReadiNes supplies none of them, so a reading with no range is recorded
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

function EmergencyCardDialog({
  member,
  records,
  onClose,
}: {
  member: HealthMember;
  records: HealthRecord[];
  onClose: () => void;
}) {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  useEffect(() => {
    let active = true;
    void api.documents.list().then((items) => {
      if (active) setDocuments(items);
    });
    return () => {
      active = false;
    };
  }, []);
  const insuranceDoc = findInsuranceDocument(records, documents);
  const generatedDate = new Date().toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const rows = [
    ["Name", member.name],
    ["Blood group", known(member.bloodGroup)],
    ["Critical allergies", member.allergies || "NOT ANSWERED"],
    ["Conditions", member.conditions || "NOT ANSWERED"],
    ["Current meds", medicineSummary(records)],
    ["Primary physician", member.primaryDoctor || "NOT ANSWERED"],
    ["Preferred hospital", preferredHospital(records) || "NOT ANSWERED"],
    ["Emergency contact", contactSummary(member) || "-"],
    [
      "Insurance",
      insuranceDoc
        ? insuranceDoc.title || insuranceDoc.originalName
        : member.insuranceProvider || "NOT ANSWERED",
    ],
    ["Medical documents", `${records.length} on file in ReadiNes`],
  ];
  return (
    <ModalBackdrop className="lp-card-preview-backdrop">
      <ModalPanel onDismiss={onClose}
        className="lp-card-preview-dialog lp-emergency-card-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="emergency-card-title"
      >
        <header className="lp-card-preview-head">
          <div>
            <Text as="p" size="sm" weight="semibold">One tap · assembled from your archive</Text>
            <Heading level={2} size="md" id="emergency-card-title">Emergency card</Heading>
          </div>
          <Button size="sm" iconOnly variant="tertiary" type="button" onClick={onClose} aria-label="Close">
            <X aria-hidden="true" focusable="false" size="var(--icon-medium)" />
          </Button>
        </header>
        <section className="lp-emergency-card-paper">
          <div className="lp-emergency-card-band">
            <Text as="b" size="md" weight="semibold">Emergency info</Text>
            <Text size="sm" weight="semibold">ReadiNes</Text>
          </div>
          <dl>
            {rows.map(([label, value]) => (
              <div key={label}>
                <Text as="dt" size="sm">{label}</Text>
                <Text as="dd" size="md" weight="semibold">{value}</Text>
              </div>
            ))}
          </dl>
          <footer>
            <Text size="md">Assembled facts only · no diagnosis.</Text>
            <Text size="md">
              Generated{" "}
              {new Date().toLocaleDateString(undefined, {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </Text>
          </footer>
        </section>
        <div className="lp-card-preview-actions">
          <Button variant="secondary"
            type="button"
            onClick={() =>
              exportEmergencyCardPdf(buildEmergencyCardHtml(rows, generatedDate))
            }
          >
            <Download aria-hidden="true" focusable="false" size="var(--icon-small)" /> Export as PDF
          </Button>
        </div>
      </ModalPanel>
    </ModalBackdrop>
  );
}

function InsuranceCardDialog({
  records,
  onClose,
}: {
  records: HealthRecord[];
  onClose: () => void;
}) {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [uploading, setUploading] = useState(false);
  useEffect(() => {
    let active = true;
    void api.documents.list().then((items) => {
      if (active) setDocuments(items);
    });
    return () => {
      active = false;
    };
  }, []);
  const insuranceDoc = findInsuranceDocument(records, documents);
  return (
    <ModalBackdrop className="lp-card-preview-backdrop">
      <ModalPanel onDismiss={onClose}
        className="lp-card-preview-dialog lp-insurance-card-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="insurance-card-title"
      >
        <header className="lp-insurance-card-head">
          <span>
            <FileText aria-hidden="true" focusable="false" size={22} />
          </span>
          <div>
            <Heading level={2} size="sm" id="insurance-card-title">Insurance Card</Heading>
            <Text as="p" size="md">{insuranceDoc ? insuranceDoc.title || insuranceDoc.originalName : "No insurance document added"}</Text>
          </div>
          <Button size="sm" iconOnly variant="tertiary" type="button" onClick={onClose} aria-label="Close">
            <X aria-hidden="true" focusable="false" size={22} />
          </Button>
        </header>
        {insuranceDoc ? (
          <InsuranceDocumentPreview document={insuranceDoc} />
        ) : (
          <section className="lp-insurance-empty">
            <div>
              <Text as="b" size="lg" weight="semibold">No insurance document added</Text>
              <Text as="p" size="md">Add your insurance document so it is available in an emergency.</Text>
            </div>
            <Button variant="primary" type="button" onClick={() => setUploading(true)}>
              Add insurance document
            </Button>
          </section>
        )}
        {uploading ? (
          <UploadDocumentModal
            open
            onClose={() => setUploading(false)}
            onSaved={(document) => {
              setDocuments((items) => [
                document,
                ...items.filter((item) => item.id !== document.id),
              ]);
            }}
          />
        ) : null}
      </ModalPanel>
    </ModalBackdrop>
  );
}

function InsuranceDocumentPreview({ document }: { document: DocumentRecord }) {
  const pages = document.pages?.length
    ? document.pages
    : [{
      id: document.id,
      position: 1,
      label: "Page 1",
      sourceType: "upload",
      originalName: document.originalName,
      mimeType: document.mimeType,
      size: document.size,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    }];
  const [pageIndex, setPageIndex] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState("");
  const page = pages[Math.min(pageIndex, pages.length - 1)] ?? pages[0]!;
  const mimeType = page.mimeType.toLowerCase();

  useEffect(() => {
    setPageIndex((current) => Math.min(current, Math.max(0, pages.length - 1)));
  }, [pages.length]);

  useEffect(() => {
    if (document.source === "GOOGLE_DRIVE") return;
    if (!mimeType.startsWith("image/") && mimeType !== "application/pdf") return;
    let active = true;
    let objectUrl: string | null = null;
    setPreviewUrl(null);
    setPreviewError("");
    const load = page.id === document.id
      ? api.documents.preview(document.id)
      : api.documents.previewPage(document.id, page.id);
    void load.then(({ blob }) => {
      if (!active) return;
      objectUrl = URL.createObjectURL(blob);
      setPreviewUrl(objectUrl);
    }).catch((error) => {
      if (!active) return;
      setPreviewError(error instanceof Error ? error.message : "Preview unavailable.");
    });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [document.id, document.source, mimeType, page.id]);

  const canPreview = mimeType.startsWith("image/") || mimeType === "application/pdf";
  return (
    <section className="lp-insurance-document-stage">
      <div    className="lp-insurance-document-toolbar">
        <Text size="md">{pages.length > 1 ? `${page.label} of ${pages.length}` : "Document preview"}</Text>
        {pages.length > 1 ? (
          <div>
            <Button size="sm" variant="tertiary" type="button" disabled={pageIndex === 0} onClick={() => setPageIndex((index) => Math.max(0, index - 1))}>
              Previous
            </Button>
            <Button size="sm" variant="tertiary" type="button" disabled={pageIndex >= pages.length - 1} onClick={() => setPageIndex((index) => Math.min(pages.length - 1, index + 1))}>
              Next
            </Button>
          </div>
        ) : null}
      </div>
      <div   className="lp-insurance-document-preview">
        {document.source === "GOOGLE_DRIVE" ? (
          <Text as="p" size="md">This document remains in Google Drive. Open it from Documents to preview the original file.</Text>
        ) : previewError ? (
          <Text as="p" size="md">{previewError}</Text>
        ) : !canPreview ? (
          <Text as="p" size="md">Inline preview is not available for this file type. Open it from Documents to view the original file.</Text>
        ) : !previewUrl ? (
          <Text as="p" size="md">Loading preview...</Text>
        ) : mimeType.startsWith("image/") ? (
          <img src={previewUrl} alt={page.originalName} />
        ) : (
          <iframe src={previewUrl} title={page.originalName} />
        )}
      </div>
    </section>
  );
}

function VisitPackDialog({
  member,
  records,
  onClose,
  onViewDocument,
}: {
  member: HealthMember;
  records: HealthRecord[];
  onClose: () => void;
  onViewDocument: (documentId: string) => void;
}) {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [selectedContextId, setSelectedContextId] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const [choosingVisit, setChoosingVisit] = useState(false);
  const [chooserQuery, setChooserQuery] = useState("");

  useEffect(() => {
    let active = true;
    void api.documents
      .list()
      .then((nextDocuments) => {
        if (active) setDocuments(nextDocuments);
      })
      .catch((reason: unknown) => {
        if (active)
          setError(
            reason instanceof Error
              ? reason.message
              : "Visit details could not be loaded.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [records]);

  const contexts = useMemo(() => buildVisitContexts(records), [records]);
  const selectedContext =
    contexts.find((context) => context.id === selectedContextId) ??
    contexts[0] ??
    null;
  const matching = useMemo<VisitDocument[]>(() => {
    if (!selectedContext) return [];
    const allowed = new Set(selectedContext.recordIds);
    const documentById = new Map(
      documents.map((document) => [document.id, document]),
    );
    return records
      .filter((record) => allowed.has(record.id))
      .map((record) => ({
        record,
        document: documentById.get(record.documentId),
      }));
  }, [documents, records, selectedContext]);

  useEffect(() => {
    if (!contexts.length) {
      setSelectedContextId("");
      return;
    }
    if (!contexts.some((context) => context.id === selectedContextId))
      setSelectedContextId(contexts[0]!.id);
  }, [contexts, selectedContextId]);
  useEffect(() => {
    setSelectedIds(new Set(matching.map((item) => item.record.id)));
  }, [selectedContextId, matching]);
  const selected = matching.filter((item) => selectedIds.has(item.record.id));
  const appointmentDate = visitAppointmentDate(matching);
  const chooserGroups = useMemo(
    () => visitChooserGroups(contexts, selectedContext?.id ?? "", chooserQuery),
    [chooserQuery, contexts, selectedContext?.id],
  );
  const toggle = (recordId: string) =>
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(recordId)) next.delete(recordId);
      else next.add(recordId);
      return next;
    });
  const download = async () => {
    if (!selected.length || !selectedContext || downloading) return;
    setDownloading(true);
    setError("");
    try {
      const zip = new JSZip();
      const names = new Map<string, number>();
      for (const item of selected
        .slice()
        .sort((a, b) => visitDate(b).localeCompare(visitDate(a)))) {
        const { blob } = await api.documents.download(item.record.documentId);
        const date = visitDate(item);
        const folder = date === "Undated" ? "undated" : date;
        const original = safeFileName(
          item.document?.originalName ||
            item.document?.title ||
            humanRecordType(item.record.type),
        );
        const base = `${folder}/${date === "Undated" ? "" : `${date}_`}${original}`;
        const count = names.get(base) ?? 0;
        names.set(base, count + 1);
        zip.file(count ? appendSuffix(base, count + 1) : base, blob);
      }
      const archive = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(archive);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${safeFileStem(member.name)}_${safeFileStem(selectedContext.label)}_Visit-Pack.zip`;
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "The visit pack could not be downloaded.",
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <ModalBackdrop className="lp-visit-pack-backdrop">
      <ModalPanel onDismiss={onClose}
        className="lp-visit-pack-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="visit-pack-title"
      >
        <header className="lp-health-dialog-head">
          <div>
            <Text as="p" size="sm" weight="semibold" className="lp-visit-pack-eyebrow">
              Your own records, filtered for this visit
            </Text>
            <Heading level={2} size="md" id="visit-pack-title">Prepare for a visit</Heading>
          </div>
          <Button size="sm" iconOnly variant="tertiary" type="button" onClick={onClose} aria-label="Close">
            <X aria-hidden="true" focusable="false" size="var(--icon-medium)" />
          </Button>
        </header>
        {loading ? (
          <Text as="p" size="sm" className="lp-health-muted">
            Loading this profile’s visit history…
          </Text>
        ) : contexts.length ? (
          choosingVisit ? (
            <div className="lp-visit-pack-chooser">
              <div className="lp-visit-pack-search-row">
                <Button size="sm" iconOnly variant="tertiary"
                  type="button"
                  aria-label="Back"
                  onClick={() => setChoosingVisit(false)}
                >
                  ‹
                </Button>
                <Input
                  aria-label="Search doctors, specialisations, hospitals"
                  placeholder="Search doctors, specialisations, hospitals"
                  value={chooserQuery}
                  onChange={(event) => setChooserQuery(event.target.value)}
                />
              </div>
              {chooserGroups.map((group) => (
                <section
                  className="lp-visit-pack-choice-group"
                  key={group.title}
                >
                  <Heading level={3} size="sm">{group.title}</Heading>
                  {group.items.map((context) => (
                    <button
                      key={context.id}
                      type="button"
                      onClick={() => {
                        setSelectedContextId(context.id);
                        setChoosingVisit(false);
                      }}
                    >
                      <span>{context.label}</span>
                      <em>
                        {context.recordIds.length}{" "}
                        {context.recordIds.length === 1 ? "doc" : "docs"}
                      </em>
                      {context.id === selectedContext?.id ? (
                        <Check aria-hidden="true" focusable="false" size={14} />
                      ) : null}
                    </button>
                  ))}
                </section>
              ))}
            </div>
          ) : (
            <>
              <Text as="p" size="md" weight="medium" className="lp-visit-pack-next">
                Next appointment: {selectedContext?.label}
                {appointmentDate
                  ? ` on ${formatVisitDate(appointmentDate)}`
                  : ""}
                .
              </Text>
              <section className="lp-visit-pack-context">
                <span>
                  <Text as="small" size="sm">Doctors</Text>
                  <Text as="b" size="md" weight="semibold">{selectedContext?.label}</Text>
                  <Text as="em" size="md">
                    {matching.length}{" "}
                    {matching.length === 1 ? "document" : "documents"} · tap to
                    choose another doctor, hospital, or specialisation
                  </Text>
                </span>
                <Button size="sm" variant="tertiary" type="button" onClick={() => setChoosingVisit(true)}>
                  Change
                </Button>
              </section>
              {matching.length ? (
                <Text as="p" size="sm" weight="medium" className="lp-visit-pack-summary">
                  {visitSummary(matching)}
                </Text>
              ) : (
                <Text as="p" size="sm" className="lp-health-muted">
                  No documents are available for this selection.
                </Text>
              )}
              <div   className="lp-visit-pack-documents">
                {matching.map((item) => (
                  <article
                    className="lp-visit-pack-document"
                    key={item.record.id}
                  >
                    <button
                      className={
                        selectedIds.has(item.record.id) ? "checked" : ""
                      }
                      type="button"
                      aria-label={`Select ${documentLabel(item)}`}
                      aria-pressed={selectedIds.has(item.record.id)}
                      onClick={() => toggle(item.record.id)}
                    >
                      {selectedIds.has(item.record.id) ? (
                        <Check aria-hidden="true" focusable="false" size={13} />
                      ) : null}
                    </button>
                    <DocumentIcon item={item} />
                    <span>
                      <Text as="b" size="md" weight="semibold">{documentLabel(item)}</Text>
                      <Text as="small" size="sm">{documentDetail(item)}</Text>
                    </span>
                    <Button size="sm" variant="tertiary"
                      type="button"
                      onClick={() => onViewDocument(item.record.documentId)}
                    >
                      View
                    </Button>
                  </article>
                ))}
              </div>
              <div className="lp-visit-pack-note">
                <FileText aria-hidden="true" focusable="false" size="var(--icon-regular)" />
                <Text size="md">
                  Cover sheet included: allergies, conditions, medicines, and
                  latest readings.
                </Text>
                <Button size="sm" variant="tertiary" type="button">Preview</Button>
              </div>
              <Button loading={downloading} variant="primary"
                type="button"
                disabled={!selected.length || downloading}
                onClick={() => void download()}
              >
                <Download aria-hidden="true" focusable="false" size="var(--icon-regular)" />{" "}
                {downloading
                  ? "Preparing visit pack…"
                  : `Download visit pack (cover + ${selected.length})`}
              </Button>
            </>
          )
        ) : (
          <div className="lp-visit-pack-empty">
            <CalendarClock aria-hidden="true" focusable="false" size={22} />
            <Text as="b" size="md" weight="semibold">No visit history for {member.name} yet.</Text>
            <Text as="p" size="md">
              Add a medical record with a doctor or documented follow-up to
              prepare a visit pack.
            </Text>
          </div>
        )}
        {error ? (
          <Text as="p" size="sm" weight="semibold" className="lp-health-form-error" role="alert">
            {error}
          </Text>
        ) : null}
      </ModalPanel>
    </ModalBackdrop>
  );
}

function buildVisitContexts(records: HealthRecord[]) {
  const contexts = new Map<string, VisitContext>();
  const add = (kind: VisitContext["kind"], label: string, recordId: string) => {
    const clean = label.trim();
    if (!clean) return;
    const id = `${kind}:${clean.toLocaleLowerCase()}`;
    const current = contexts.get(id) ?? {
      id,
      label: clean,
      kind,
      recordIds: [],
    };
    if (!current.recordIds.includes(recordId)) current.recordIds.push(recordId);
    contexts.set(id, current);
  };
  // Only persisted doctor fields describe a visit context. Follow-up titles are
  // extracted recommendations and must never be presented as a visit option.
  records.forEach((record) => {
    if (record.doctor) add("doctor", record.doctor, record.id);
    if (record.provider) add("provider", record.provider, record.id);
  });
  const recent = records
    .slice()
    .sort((a, b) =>
      String(b.documentDate || b.createdAt).localeCompare(
        String(a.documentDate || a.createdAt),
      ),
    )
    .slice(0, 8)
    .map((record) => record.id);
  if (recent.length) {
    contexts.set("recent:everything", {
      id: "recent:everything",
      label: "Everything recent",
      kind: "recent",
      recordIds: recent,
    });
  }
  return [...contexts.values()].sort(
    (a, b) => a.kind.localeCompare(b.kind) || a.label.localeCompare(b.label),
  );
}
function findInsuranceDocument(records: HealthRecord[], documents: DocumentRecord[]) {
  const ids = new Set(records.map((record) => record.documentId));
  const healthRecordDocument = documents.find((document) => {
    if (!ids.has(document.id)) return false;
    return isInsuranceDocument(document);
  });
  if (healthRecordDocument) return healthRecordDocument;
  return documents.find(isInsuranceDocument);
}
function isInsuranceDocument(document: DocumentRecord) {
  const text =
    `${document.category} ${document.documentType} ${document.normalizedType ?? ""}`.toLowerCase();
  return /insurance|policy/.test(text);
}
function known(value: string | null | undefined) {
  return value && value !== "Unknown" ? value : "NOT ANSWERED";
}
function contactSummary(member: HealthMember) {
  return [member.emergencyContactName, member.emergencyContactPhone]
    .filter(Boolean)
    .join(" · ");
}
function medicineSummary(records: HealthRecord[]) {
  const total = records.reduce(
    (sum, record) => sum + record.medicationCount,
    0,
  );
  return total
    ? `${total} medication${total === 1 ? "" : "s"} on file`
    : "NOT ANSWERED";
}
function preferredHospital(records: HealthRecord[]) {
  const provider = records.find((record) => record.provider)?.provider;
  return provider ?? "";
}
function exportEmergencyCardPdf(html: string) {
  const popup = window.open("", "_blank");
  if (!popup) return;
  popup.document.write(html);
  popup.document.close();
  popup.focus();
  void Promise.all(Object.values(typography.weights).map((weight) =>
    popup.document.fonts.load(`${weight} ${typography.text.md} Poppins`),
  )).catch(() => undefined).then(() => popup.print());
}
function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char] ?? char,
  );
}
function buildEmergencyCardHtml(rows: string[][], generatedDate: string) {
  const rowHtml = rows
    .map(
      ([label, value]) => `
        <div>
          <dt>${escapeHtml(label)}</dt>
          <dd>${escapeHtml(value)}</dd>
        </div>`,
    )
    .join("");
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Emergency card</title>
  <style>
    ${poppinsFontFaces}
    ${typographyVariables}
    * { box-sizing: border-box; }
    body { margin: 0; padding: 24px; background: #eef0f3; color: #1B2431; font-family: ${typography.family}; font-size: ${typography.text.md}; line-height: ${typography.lineHeights.body}; }
    .paper { max-width: 560px; margin: 0 auto; overflow: hidden; border: 1px solid #E3E6EA; border-radius: 10px; background: #fff; }
    .band { display: flex; justify-content: space-between; align-items: center; padding: 18px 16px; background: #c9181f; color: #fff; }
    .band b { font-size: var(--text-md); font-weight: var(--weight-bold); letter-spacing: 1px; text-transform: uppercase; }
    .band span { font-size: var(--text-sm); font-weight: var(--weight-bold); }
    dl { display: grid; margin: 0; padding: 8px 16px 12px; }
    dl div { display: grid; grid-template-columns: 124px minmax(0, 1fr); gap: 12px; padding: 9px 0; }
    dt { color: #5E6674; font-size: var(--text-sm); line-height: var(--line-body); }
    dd { margin: 0; color: #1B2431; font-size: var(--text-md); font-weight: var(--weight-bold); line-height: var(--line-body); }
    footer { display: flex; justify-content: space-between; gap: 12px; padding: 12px 16px; border-top: 1px solid #E3E6EA; color: #5E6674; font-size: var(--text-sm); }
  </style>
</head>
<body>
  <section class="paper">
    <div class="band"><b>Emergency info</b><span>ReadiNes</span></div>
    <dl>${rowHtml}</dl>
    <footer><span>Assembled facts only · no diagnosis.</span><span>Generated ${escapeHtml(generatedDate)}</span></footer>
  </section>
</body>
</html>`;
}
function visitChooserGroups(
  contexts: VisitContext[],
  selectedId: string,
  query: string,
) {
  const needle = query.trim().toLowerCase();
  const order: Array<{ title: string; kind: VisitContext["kind"] }> = [
    { title: "Doctors", kind: "doctor" },
    { title: "Hospitals and labs", kind: "provider" },
    { title: "Everything recent", kind: "recent" },
  ];
  return order
    .map((group) => ({
      title: group.title,
      items: contexts
        .filter((context) => context.kind === group.kind)
        .filter(
          (context) => !needle || context.label.toLowerCase().includes(needle),
        )
        .sort((a, b) =>
          a.id === selectedId
            ? -1
            : b.id === selectedId
              ? 1
              : a.label.localeCompare(b.label),
        ),
    }))
    .filter((group) => group.items.length);
}
function visitSummary(items: VisitDocument[]) {
  const dates = [
    ...new Set(items.map(visitDate).filter((date) => date !== "Undated")),
  ].sort();
  const visits = dates.length || (items.length ? 1 : 0);
  const range =
    dates.length > 1
      ? `${formatVisitDate(dates[0]!)} – ${formatVisitDate(dates[dates.length - 1]!)}`
      : dates.length
        ? formatVisitDate(dates[0]!)
        : "date unavailable";
  return `${items.length} ${items.length === 1 ? "document" : "documents"} from ${visits} ${visits === 1 ? "visit" : "visits"} · ${range}`;
}
function visitAppointmentDate(items: VisitDocument[]) {
  const dates = items
    .map(visitDate)
    .filter((date) => date !== "Undated")
    .sort();
  return dates[dates.length - 1] ?? "";
}
function visitDate(item: VisitDocument) {
  return item.record.documentDate || item.document?.documentDate || "Undated";
}
function formatVisitDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value.slice(0, 10)}T00:00:00`));
}
function documentLabel(item: VisitDocument) {
  return (
    item.document?.title ||
    item.document?.displayName ||
    humanRecordType(item.record.type)
  );
}
function documentDetail(item: VisitDocument) {
  const fileName =
    item.document?.originalName ||
    item.document?.displayName ||
    item.document?.title;
  const date =
    visitDate(item) === "Undated"
      ? "Date unavailable"
      : formatVisitDate(visitDate(item));
  return fileName ? `${fileName} · ${date}` : date;
}
function DocumentIcon({ item }: { item: VisitDocument }) {
  const meta = documentIconMeta(item);
  const Icon = meta.icon;
  return (
    <span
      className="lp-visit-pack-document-icon"
      style={{
        color: meta.color,
        background: meta.background,
      }}
    >
      <Icon aria-hidden="true" focusable="false" size={17} />
    </span>
  );
}
function documentIconMeta(item: VisitDocument) {
  const text =
    `${item.record.type} ${item.document?.documentType ?? ""} ${item.document?.category ?? ""}`.toLowerCase();
  if (/prescription|medication|medicine/.test(text)) {
    return {
      icon: Pill,
      color: "var(--lp-purple)",
      background: "color-mix(in srgb, var(--lp-purple) 14%, transparent)",
    };
  }
  if (/lab|test|report|blood|lipid/.test(text)) {
    return {
      icon: FlaskConical,
      color: "var(--lp-pink)",
      background: "color-mix(in srgb, var(--lp-pink) 14%, transparent)",
    };
  }
  if (/insurance|policy/.test(text)) {
    return {
      icon: ShieldCheck,
      color: "var(--lp-mint)",
      background: "color-mix(in srgb, var(--lp-mint) 14%, transparent)",
    };
  }
  return {
    icon: Link2,
    color: "var(--lp-purple)",
    background: "color-mix(in srgb, var(--lp-purple) 14%, transparent)",
  };
}
function humanRecordType(type: string) {
  return type
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
function safeFileStem(value: string) {
  return (
    value
      .trim()
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "Health"
  );
}
function safeFileName(value: string) {
  const parts = value.split(/[\\/]/).pop() || "document";
  return (
    parts
      .replace(/[^a-zA-Z0-9._ -]+/g, "-")
      .replace(/\s+/g, "-")
      .slice(0, 180) || "document"
  );
}
function appendSuffix(path: string, suffix: number) {
  const index = path.lastIndexOf(".");
  return index > path.lastIndexOf("/")
    ? `${path.slice(0, index)}-${suffix}${path.slice(index)}`
    : `${path}-${suffix}`;
}
