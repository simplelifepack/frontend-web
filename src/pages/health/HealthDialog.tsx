import { useEffect, useMemo, useRef, useState } from "react";
import JSZip from "jszip";
import {
  CalendarClock,
  Check,
  Download,
  FileText,
  ShieldCheck,
  X,
} from "lucide-react";

import { api } from "@/lib/api";
import type {
  DocumentRecord,
  HealthMember,
  HealthRecord,
} from "@/lib/api.types";
import { btnPrimary, btnGhost } from "@/constants/theme";

export type HealthDialogKind =
  | "reminder"
  | "profile"
  | "emergency"
  | "visit"
  | "reading";
type VisitContext = {
  id: string;
  label: string;
  kind: "doctor" | "checkup";
  recordIds: string[];
};
type VisitDocument = { record: HealthRecord; document?: DocumentRecord };

export default function HealthDialog({
  kind,
  member,
  records,
  onClose,
  onSaved,
  onUpload,
  onViewDocument,
}: {
  kind: HealthDialogKind;
  member: HealthMember;
  records: HealthRecord[];
  onClose: () => void;
  onSaved: () => Promise<void>;
  onUpload: () => void;
  onViewDocument: (documentId: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
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
    setSaving(true);
    setError("");
    try {
      if (kind === "reminder")
        await api.health.createReminder({
          memberId: member.id,
          title,
          dueDate: date,
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
  return (
    <div className="lp-modal-backdrop">
      <div
        className={`lp-modal-panel lp-health-add-dialog${kind === "profile" ? " lp-health-profile-dialog" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="health-action-title"
      >
        <header className="lp-health-dialog-head">
          <h2 id="health-action-title">{titles[kind]}</h2>
          <button onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>
        {kind === "reminder" ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void save();
            }}
            className="lp-health-form"
          >
            <label>
              Reminder
              <input
                required
                maxLength={180}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>
            <label>
              Due date
              <input
                required
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
            <button style={btnPrimary} disabled={saving}>
              Save reminder
            </button>
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
            <label>
              Blood group
              <select
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
              </select>
            </label>
            <label>
              Conditions
              <textarea
                value={conditions}
                onChange={(e) => setConditions(e.target.value)}
                maxLength={2000}
                placeholder="e.g. asthma, diabetes"
              />
            </label>
            <label>
              Allergies
              <textarea
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                maxLength={2000}
                placeholder="e.g. penicillin, peanuts"
              />
            </label>
            <label>
              Emergency contact name
              <input
                value={emergencyContactName}
                onChange={(e) => setEmergencyContactName(e.target.value)}
                maxLength={120}
              />
            </label>
            <label>
              Emergency contact phone
              <input
                value={emergencyContactPhone}
                onChange={(e) => setEmergencyContactPhone(e.target.value)}
                maxLength={40}
                inputMode="tel"
              />
            </label>
            <label>
              Primary doctor
              <input
                value={primaryDoctor}
                onChange={(e) => setPrimaryDoctor(e.target.value)}
                maxLength={160}
              />
            </label>
            <label>
              Insurance provider
              <input
                value={insuranceProvider}
                onChange={(e) => setInsuranceProvider(e.target.value)}
                maxLength={160}
              />
            </label>
            <label>
              Policy number
              <input
                value={insurancePolicyNumber}
                onChange={(e) => setInsurancePolicyNumber(e.target.value)}
                maxLength={120}
              />
            </label>
          </form>
        ) : null}
        {kind === "emergency" ? (
          <>
            <h3>{member.name}</h3>
            <p>{member.relation}</p>
            <dl>
              <dt>Blood group</dt>
              <dd>{member.bloodGroup || "Not added"}</dd>
              <dt>Emergency contact</dt>
              <dd>
                {[member.emergencyContactName, member.emergencyContactPhone]
                  .filter(Boolean)
                  .join(" · ") || "Not added"}
              </dd>
              <dt>Allergies</dt>
              <dd>{member.allergies || "Not recorded"}</dd>
            </dl>
          </>
        ) : null}
        {kind === "reading" ? (
          <>
            <p>
              Manual reading entry is not available yet. You can add a health
              report and track its extracted measurements.
            </p>
            <button style={btnPrimary} onClick={onUpload}>
              Add health record
            </button>
          </>
        ) : null}
        {error && <p role="alert">{error}</p>}
        <footer>
          <button style={btnGhost} onClick={onClose}>
            Close
          </button>
          {kind === "profile" ? (
            <button
              type="submit"
              form="health-profile-form"
              style={btnPrimary}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save profile"}
            </button>
          ) : null}
        </footer>
      </div>
    </div>
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
  const selectedPillRef = useRef<HTMLButtonElement | null>(null);

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
  useEffect(() => {
    selectedPillRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    });
  }, [selectedContextId]);

  const selected = matching.filter((item) => selectedIds.has(item.record.id));
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
    <div className="lp-modal-backdrop lp-visit-pack-backdrop">
      <div
        className="lp-modal-panel lp-visit-pack-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="visit-pack-title"
      >
        <header className="lp-health-dialog-head">
          <div>
            <p className="lp-visit-pack-eyebrow">
              Your real documents · filtered for this visit
            </p>
            <h2 id="visit-pack-title">Prepare for visit</h2>
          </div>
          <button onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </header>
        {loading ? (
          <p className="lp-health-muted">
            Loading this profile’s visit history…
          </p>
        ) : contexts.length ? (
          <>
            <h3 className="lp-visit-pack-question">
              Preparing for which visit?
            </h3>
            <div className="lp-visit-pack-pills">
              {contexts.map((context) => (
                <button
                  className={context.id === selectedContext?.id ? "active" : ""}
                  key={context.id}
                  ref={
                    context.id === selectedContext?.id ? selectedPillRef : null
                  }
                  type="button"
                  onClick={() => setSelectedContextId(context.id)}
                >
                  {context.label}
                </button>
              ))}
            </div>
            {matching.length ? (
              <p className="lp-visit-pack-summary">{visitSummary(matching)}</p>
            ) : (
              <p className="lp-health-muted">
                No documents are available for this selection.
              </p>
            )}
            <div className="lp-visit-pack-documents">
              {matching.map((item) => (
                <article
                  className="lp-visit-pack-document"
                  key={item.record.id}
                >
                  <button
                    className={selectedIds.has(item.record.id) ? "checked" : ""}
                    type="button"
                    aria-label={`Select ${documentLabel(item)}`}
                    aria-pressed={selectedIds.has(item.record.id)}
                    onClick={() => toggle(item.record.id)}
                  >
                    {selectedIds.has(item.record.id) ? (
                      <Check size={14} />
                    ) : null}
                  </button>
                  <span className="lp-visit-pack-document-icon">
                    <ShieldCheck size={18} />
                  </span>
                  <span>
                    <b>{documentLabel(item)}</b>
                    <small>{documentDetail(item)}</small>
                  </span>
                  <button
                    className="lp-visit-pack-view"
                    type="button"
                    onClick={() => onViewDocument(item.record.documentId)}
                  >
                    View
                  </button>
                </article>
              ))}
            </div>
            <div className="lp-visit-pack-note">
              <FileText size={18} />
              <span>
                The pack includes the selected original documents in date-based
                folders. No replacement files are generated.
              </span>
            </div>
            <button
              className="lp-visit-pack-download"
              type="button"
              disabled={!selected.length || downloading}
              onClick={() => void download()}
            >
              <Download size={18} />{" "}
              {downloading
                ? "Preparing visit pack…"
                : `Download visit pack · ${selected.length} ${selected.length === 1 ? "document" : "documents"}`}
            </button>
          </>
        ) : (
          <div className="lp-visit-pack-empty">
            <CalendarClock size={22} />
            <b>No visit history for {member.name} yet.</b>
            <p>
              Add a medical record with a doctor or documented follow-up to
              prepare a visit pack.
            </p>
          </div>
        )}
        {error ? (
          <p className="lp-health-form-error" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </div>
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
  });
  return [...contexts.values()].sort(
    (a, b) => a.kind.localeCompare(b.kind) || a.label.localeCompare(b.label),
  );
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
