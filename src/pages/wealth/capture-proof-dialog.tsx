import { Text, Heading, ModalPanel, ModalBackdrop, Input, Select, Textarea, Checkbox, Button } from "@/design-system";

import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import {
  ChevronDown,
  ChevronUp,
  FileText,
  Paperclip,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";

import UploadDocumentModal from "@/components/UploadDocumentModal";
import {
  api,
  type DocumentRecord,
  type WealthRecord,
  type WealthRecordPayload,
  type WealthRecordType,
} from "@/lib/api";
import {
  categories,
  documentTitle,
  fieldsObject,
  labelize,
} from "@/pages/documents/document-utils";
import { useAppSelector } from "@/store/hooks";
import {
  classifyWealthRecord,
  payloadFromRecord,
  recordAmount,
} from "./wealth-view";

type Mode = "asset" | "proof" | "money";
type Props = {
  mode?: Mode;
  initialCategoryCode?: string;
  title?: string;
  onClose: () => void;
  onSaved: (record: WealthRecord) => void;
};

const currencies = ["INR", "USD", "EUR", "GBP", "AED", "SGD"];
const holdingTypeSuggestions = {
  asset: [
    "Savings account",
    "Current account",
    "Fixed deposit",
    "Mutual funds",
    "Stocks",
    "Bonds",
    "Retirement / NPS",
    "EPF / PF",
    "PPF",
    "Property",
    "Gold",
    "Crypto",
    "Business ownership",
    "Other",
  ],
  liability: [
    "Home loan / Mortgage",
    "Car loan",
    "Personal loan",
    "Education loan",
    "Credit card",
    "Business loan",
    "Loan against property",
    "Other",
  ],
  cover: [
    "Life insurance",
    "Health insurance",
    "Vehicle insurance",
    "Home / Property insurance",
    "Personal accident insurance",
    "Travel insurance",
    "Other",
  ],
} as const;
const today = () => new Date().toISOString().slice(0, 10);
const css = {
  panel: "var(--lp-panel)",
  raised: "var(--lp-raised)",
  border: "var(--lp-border)",
  text: "var(--lp-text)",
  muted: "var(--lp-muted)",
  heading: "var(--lp-heading)",
  action: "var(--lp-action)",
  coral: "var(--lp-coral)",
  mint: "var(--lp-mint)",
};

function inputStyle(): CSSProperties {
  return { width: "100%" };
}

function labelStyle(): CSSProperties {
  return { display: "block", marginBottom: 5, color: css.muted, fontSize: "var(--text-sm)", fontWeight: "var(--weight-bold)", letterSpacing: 0.5, textTransform: "uppercase", fontVariantNumeric: "tabular-nums" };
}

function Modal({
  children,
  onClose,
  danger,
  className = "",
}: {
  children: ReactNode;
  onClose: () => void;
  danger?: boolean;
  className?: string;
}) {
  return (
    <ModalBackdrop

      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: "var(--layer-overlay)", display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <ModalPanel onDismiss={onClose}
        className={`lp-wealth-ref-modal ${className}`}
        onClick={(event) => event.stopPropagation()}
        style={{ width: "min(500px,100%)", maxHeight: "92vh", overflowY: "auto" }}
      >
        <div className="lp-sheet-grab lp-grabonly" />
        {children}
      </ModalPanel>
    </ModalBackdrop>
  );
}

export default function CaptureProofDialog({
  mode,
  initialCategoryCode,
  title,
  onClose,
  onSaved,
}: Props) {
  const resolved: Mode =
    mode ?? (initialCategoryCode === "payment_proof" ? "proof" : "asset");
  if (resolved === "money")
    return <MoneyLentBorrowedModal onClose={onClose} onSaved={onSaved} />;
  return resolved === "proof" ? (
    <ProofModal onClose={onClose} onSaved={onSaved} />
  ) : (
    <HoldingModal title={title} onClose={onClose} onSaved={onSaved} />
  );
}

function text(value: unknown) {
  return value == null ? "" : String(value);
}

function holdingKind(record?: WealthRecord) {
  if (!record) return "asset";
  const domain = classifyWealthRecord(record);
  if (domain === "liability") return "liability";
  if (domain === "protection") return "cover";
  return "asset";
}

function initialHoldingState(record?: WealthRecord) {
  const details = record?.details ?? {};
  const kind = holdingKind(record);
  return {
    name: record?.title ?? "",
    kind,
    type: text(
      details.assetType ||
        details.loanType ||
        details.insuranceType ||
        details.type,
    ),
    institution: text(
      details.institution ||
        details.provider ||
        details.party ||
        details.location,
    ),
    accountRef: text(
      details.accountRef ||
        details.referenceNumber ||
        details.reference ||
        details.policyNumber ||
        details.loanAccountNumber,
    ),
    value: record ? String(recordAmount(record) || "") : "",
    currency: text(details.currency) || "INR",
    memberId: text(details.memberId) || "you",
    renewalDate: text(details.renewalDate),
    maturityDate: text(details.maturityDate),
    accessNote: text(details.accessInstruction || record?.notes),
    nominee: Boolean(details.nominee),
    nomineeName: text(
      details.nomineeName ||
        (typeof details.nominee === "string" ? details.nominee : ""),
    ),
  };
}

function valueFromDocumentFields(doc: DocumentRecord, keys: string[]) {
  const fields = fieldsObject(doc);
  for (const key of keys) {
    const value = fields[key];
    if (
      (typeof value === "string" && value.trim()) ||
      typeof value === "number"
    ) {
      return String(value);
    }
  }
  const reviewFields = Array.isArray(fields.reviewFields)
    ? (fields.reviewFields as Array<{
        key?: string;
        label?: string;
        value?: unknown;
      }>)
    : [];
  const match = reviewFields.find((field) =>
    keys.some((key) =>
      `${field.key ?? ""} ${field.label ?? ""}`
        .toLowerCase()
        .includes(key.toLowerCase()),
    ),
  );
  return match?.value == null || match.value === "" ? "" : String(match.value);
}

function kindFromDocument(doc: DocumentRecord) {
  const category = `${doc.category} ${doc.documentType}`.toLowerCase();
  if (/insurance|policy|cover/.test(category)) return "cover";
  if (/loan|mortgage|liability|credit/.test(category)) return "liability";
  return "asset";
}

function typeFromDocument(doc: DocumentRecord, kind: string) {
  const docType = doc.documentType?.trim();
  if (docType && !/^unknown$/i.test(docType)) return docType;
  if (kind === "cover") return "Insurance";
  if (kind === "liability") return "Loan";
  if (/property/i.test(doc.category)) return "Property";
  return "Bank account";
}

function initialStateFromDocument(doc: DocumentRecord) {
  const kind = kindFromDocument(doc);
  return {
    name: documentTitle(doc),
    kind,
    type: typeFromDocument(doc, kind),
    institution: valueFromDocumentFields(doc, [
      "institution",
      "issuer",
      "bankName",
      "provider",
      "insurerName",
    ]),
    accountRef: valueFromDocumentFields(doc, [
      "accountNumber",
      "accountNumberMasked",
      "policyNumber",
      "referenceNumber",
      "loanAccountNumber",
    ]),
    value: valueFromDocumentFields(doc, [
      "amount",
      "marketValue",
      "coverageAmount",
      "sumAssured",
      "principalAmount",
      "value",
    ]),
    currency: valueFromDocumentFields(doc, ["currency"]) || "INR",
    memberId: "you",
    renewalDate: valueFromDocumentFields(doc, [
      "renewalDate",
      "expiryDate",
      "validTill",
      "validUntil",
    ]),
    maturityDate: valueFromDocumentFields(doc, ["maturityDate"]),
    accessNote: "",
    nominee: false,
    nomineeName: "",
  };
}

type HoldingKind = keyof typeof holdingTypeSuggestions;

function suggestionsForKind(kind: string) {
  return holdingTypeSuggestions[
    (kind in holdingTypeSuggestions ? kind : "asset") as HoldingKind
  ];
}

function normalizeTypeName(value: string) {
  return value.trim().toLowerCase();
}

function initialTypeChoice(kind: string, type: string) {
  const options = suggestionsForKind(kind);
  if (!type) return "";
  return (
    options.find(
      (option) => normalizeTypeName(option) === normalizeTypeName(type),
    ) ?? "Other"
  );
}

function TypeCombobox({
  kind,
  value,
  onChange,
  onOtherQuery,
}: {
  kind: string;
  value: string;
  onChange: (value: string) => void;
  onOtherQuery?: (value: string) => void;
}) {
  const [query, setQuery] = useState(value === "Other" ? "" : value);
  const [open, setOpen] = useState(false);
  const options = suggestionsForKind(kind);
  const needle = normalizeTypeName(query);
  const filtered = options.filter(
    (option) =>
      option === "Other" || normalizeTypeName(option).includes(needle),
  );
  const matches = filtered.filter((option) => option !== "Other");
  const shown = [...matches, "Other"];
  const choose = (option: string) => {
    onChange(option);
    if (option === "Other") onOtherQuery?.(query === "Other" ? "" : query);
    setQuery(option === "Other" ? "Other" : option);
    setOpen(false);
  };
  return (
    <div className="lp-type-combobox">
      <Input
        aria-label="Type"
        autoComplete="off"
        value={open ? query : value}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          setQuery(value === "Other" ? "" : value);
          setOpen(true);
        }}
        placeholder="Select or enter type..."
      />
      <button
        type="button"
        aria-label="Show type options"
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => {
          setQuery(value === "Other" ? "" : value);
          setOpen((current) => !current);
        }}
      >
        <ChevronDown aria-hidden="true" focusable="false" size="var(--icon-small)" />
      </button>
      {open ? (
        <div   className="lp-type-menu">
          {matches.length ? null : (
            <Text as="div" size="md" weight="semibold" className="lp-type-no-match">No matching types</Text>
          )}
          {shown.map((option) => (
            <button
              key={option}
              type="button"
              onMouseDown={(event) => {
                event.preventDefault();
                choose(option);
              }}
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function HoldingModal({
  title,
  record,
  initialDocument,
  onClose,
  onSaved,
  onDeleted,
}: {
  title?: string;
  record?: WealthRecord;
  initialDocument?: DocumentRecord;
  onClose: () => void;
  onSaved: (record: WealthRecord) => void;
  onDeleted?: (id: string) => void;
}) {
  const documents = useAppSelector((state) => state.documents.items);
  const user = useAppSelector((state) => state.auth.user);
  const familyMembers = useAppSelector((state) => state.family.members);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fillNote, setFillNote] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [f, setF] = useState(() =>
    record
      ? initialHoldingState(record)
      : initialDocument
        ? initialStateFromDocument(initialDocument)
        : initialHoldingState(),
  );
  const [typeChoice, setTypeChoice] = useState(() => {
    const initial = record
      ? initialHoldingState(record)
      : initialDocument
        ? initialStateFromDocument(initialDocument)
        : initialHoldingState();
    return initialTypeChoice(initial.kind, initial.type);
  });
  const [otherType, setOtherType] = useState(() => {
    const initial = record
      ? initialHoldingState(record)
      : initialDocument
        ? initialStateFromDocument(initialDocument)
        : initialHoldingState();
    return initialTypeChoice(initial.kind, initial.type) === "Other"
      ? initial.type
      : "";
  });
  const [attachedDocumentIds, setAttachedDocumentIds] = useState<string[]>(
    () => [
      ...new Set(
        record?.attachmentDocumentIds?.length
          ? record.attachmentDocumentIds
          : (record?.attachments.map((item) => item.documentId) ??
              (initialDocument ? [initialDocument.id] : [])),
      ),
    ],
  );
  const [attachedDocuments, setAttachedDocuments] = useState<DocumentRecord[]>(
    () => (initialDocument ? [initialDocument] : []),
  );
  const attachedDocumentList = attachedDocumentIds
    .map(
      (id) =>
        attachedDocuments.find((doc) => doc.id === id) ??
        documents.find((doc) => doc.id === id),
    )
    .filter((doc): doc is DocumentRecord => Boolean(doc));
  const linkedDocument = attachedDocumentList[0] ?? null;
  const ownerOptions = [
    { id: "you", name: user?.name || "You" },
    ...familyMembers.map((member) => ({ id: member.id, name: member.name })),
  ];
  if (f.memberId && !ownerOptions.some((member) => member.id === f.memberId)) {
    ownerOptions.push({
      id: f.memberId,
      name:
        text(
          record?.details.ownerName || record?.details.owner || f.memberId,
        ) || f.memberId,
    });
  }
  const set = (key: string, value: string | boolean) =>
    setF((current) => ({ ...current, [key]: value }));
  const setKind = (kind: string) => {
    setF((current) => ({ ...current, kind, type: "" }));
    setTypeChoice("");
    setOtherType("");
  };
  const resolvedType =
    typeChoice === "Other" ? otherType.trim() : typeChoice.trim();
  const kindType: WealthRecordType =
    f.kind === "liability"
      ? "LOAN_TAKEN"
      : f.kind === "cover"
        ? "INSURANCE"
        : "ASSET";
  const valueKey =
    f.kind === "liability"
      ? "principalAmount"
      : f.kind === "cover"
        ? "coverageAmount"
        : "value";
  const valid = f.name.trim().length > 0 && Boolean(resolvedType);

  async function save() {
    if (!valid) return;
    setBusy(true);
    setError(null);
    const details = {
      ...(record?.details ?? {}),
      assetType: f.kind === "asset" ? resolvedType : "",
      loanType: f.kind === "liability" ? resolvedType : "",
      insuranceType: f.kind === "cover" ? resolvedType : "",
      type: resolvedType,
      typeClassification: typeChoice === "Other" ? "other" : "predefined",
      provider: f.institution,
      institution: f.institution,
      accountRef: f.accountRef,
      currency: f.currency,
      memberId: f.memberId,
      renewalDate: f.renewalDate,
      maturityDate: f.maturityDate,
      accessInstruction: f.accessNote,
      nominee: f.nominee ? f.nomineeName || "Named" : "",
      nomineeName: f.nominee ? f.nomineeName : "",
      [valueKey]: f.value,
      amount: f.value,
      categoryCode:
        f.kind === "liability"
          ? "loan"
          : f.kind === "cover"
            ? "insurance"
            : "asset",
    };
    const payload: WealthRecordPayload = record
      ? payloadFromRecord(record, {
          type: kindType,
          title: f.name.trim(),
          details,
          notes: f.accessNote,
          attachmentDocumentIds: attachedDocumentIds,
        })
      : {
          type: kindType,
          title: f.name.trim(),
          details,
          notes: f.accessNote,
          followUpDate: null,
          followUpNote: "",
          attachmentDocumentIds: attachedDocumentIds,
        };
    try {
      onSaved(
        record
          ? await api.wealth.updateRecord(record.id, payload)
          : await api.wealth.createRecord(payload),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : record
            ? "Unable to update holding."
            : "Unable to add holding.",
      );
    } finally {
      setBusy(false);
    }
  }

  function attachDocument(document: DocumentRecord) {
    setAttachedDocuments((current) => [
      document,
      ...current.filter((item) => item.id !== document.id),
    ]);
    setAttachedDocumentIds((current) => [
      ...new Set([...current, document.id]),
    ]);
    const draft = initialStateFromDocument(document);
    setF((current) => {
      const next = { ...current };
      (Object.keys(draft) as Array<keyof typeof draft>).forEach((key) => {
        if (!next[key] && draft[key]) next[key] = draft[key] as never;
      });
      return next;
    });
    if (!typeChoice && draft.type) {
      const choice = initialTypeChoice(draft.kind, draft.type);
      setTypeChoice(choice);
      setOtherType(choice === "Other" ? draft.type : "");
    }
    setFillNote(null);
  }

  function fillFromDocument() {
    if (!linkedDocument) return;
    let count = 0;
    const draft = initialStateFromDocument(linkedDocument);
    const next = { ...f };
    const apply = (key: keyof typeof f, value: string) => {
      if (next[key]) return;
      if (!value) return;
      next[key] = String(value) as never;
      count += 1;
    };
    apply("name", draft.name);
    apply("kind", draft.kind);
    apply("institution", draft.institution);
    apply("accountRef", draft.accountRef);
    apply("value", draft.value);
    apply("currency", draft.currency);
    apply("renewalDate", draft.renewalDate);
    apply("maturityDate", draft.maturityDate);
    setF(next);
    if (!typeChoice && draft.type) {
      const choice = initialTypeChoice(draft.kind, draft.type);
      setTypeChoice(choice);
      setOtherType(choice === "Other" ? draft.type : "");
      count += 1;
    }
    const hasDocumentDetails = [
      draft.name,
      draft.type,
      draft.institution,
      draft.accountRef,
      draft.value,
      draft.renewalDate,
      draft.maturityDate,
    ].some(Boolean);
    setFillNote(
      count
        ? `Filled ${count} field${count === 1 ? "" : "s"} from your document. Check and confirm.`
        : hasDocumentDetails
          ? "Document details are already filled. Check and confirm."
          : "No additional fields found. Fill in by hand.",
    );
  }

  async function deleteHolding() {
    if (!record || busy) return;
    if (
      !window.confirm(
        `${record.title} will be removed from Wealth. Attached documents stay in Documents.`,
      )
    )
      return;
    setBusy(true);
    setError(null);
    try {
      await api.wealth.deleteRecord(record.id);
      onDeleted?.(record.id);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to remove holding.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (uploading)
    return (
      <UploadDocumentModal
        open
        onClose={() => setUploading(false)}
        onSaved={attachDocument}
      />
    );

  return (
    <Modal onClose={onClose} className="lp-holding-modal">
      <Head
        title={title ?? (record ? "Edit holding" : "Add holding")}
        onClose={onClose}
      />
      <div className="lp-holding-doc-banner">
        <FileText aria-hidden="true" focusable="false" size="var(--icon-small)" color={css.muted} />
        <Text size="md">
          {linkedDocument
            ? fillNote ||
              `${documentTitle(linkedDocument)} is linked. Read it once to fill what it states.`
            : "Add a document now, or save this holding and attach one later."}
        </Text>
        <div   className="lp-holding-doc-actions">
          {linkedDocument ? (
            <Button size="sm" variant="tertiary"
              type="button"
              onClick={fillFromDocument}
              disabled={!linkedDocument}
            >
              {fillNote ? "Read again" : "Fill from this document"}
            </Button>
          ) : null}
          {!linkedDocument ? (
            <Button size="sm" variant="tertiary" type="button" onClick={() => setUploading(true)}>
              Add document
            </Button>
          ) : null}
        </div>
      </div>
      <Text as="label" size="sm" weight="semibold" style={labelStyle()}>Name</Text>
      <Input
        style={inputStyle()}
        value={f.name}
        onChange={(e) => set("name", e.target.value)}
        placeholder="e.g. Investment portfolio"
      />
      <div
        className="lp-wealth-form-row"
        style={{ display: "flex", gap: "var(--space-s10)", marginTop: "var(--space-s12)" }}
      >
        <Field label="Kind">
          <Select
            style={inputStyle()}
            value={f.kind}
            onChange={(e) => setKind(e.target.value)}
          >
            {["asset", "liability", "cover"].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Type">
          <TypeCombobox
            kind={f.kind}
            value={typeChoice}
            onChange={setTypeChoice}
            onOtherQuery={setOtherType}
          />
        </Field>
      </div>
      {typeChoice === "Other" ? (
        <div className="lp-other-type-field">
          <Text as="label" size="sm" weight="semibold" style={labelStyle()}>Other type</Text>
          <Input
            style={inputStyle()}
            value={otherType}
            onChange={(e) => setOtherType(e.target.value)}
            placeholder="Enter type"
          />
        </div>
      ) : null}
      <div
        className="lp-wealth-form-row lp-holding-place-row"
        style={{ display: "flex", gap: "var(--space-s10)", marginTop: "var(--space-s12)" }}
      >
        <Field label="Institution">
          <Input
            style={inputStyle()}
            value={f.institution}
            onChange={(e) => set("institution", e.target.value)}
            placeholder="Bank / insurer"
          />
        </Field>
        <Field label="Account">
          <Input
            style={inputStyle()}
            value={f.accountRef}
            onChange={(e) => set("accountRef", e.target.value)}
            placeholder="...4821"
          />
        </Field>
      </div>
      <div
        className="lp-wealth-form-row lp-holding-money-row"
        style={{ display: "flex", gap: "var(--space-s10)", marginTop: "var(--space-s12)" }}
      >
        <Field
          label={
            f.kind === "liability"
              ? "Outstanding"
              : f.kind === "cover"
                ? "Cover"
                : "Value"
          }
        >
          <Input
            type="number"
            min="0"
            style={inputStyle()}
            value={f.value}
            onChange={(e) => set("value", e.target.value)}
            placeholder="0"
          />
        </Field>
        <Field label="Currency">
          <Select
            style={inputStyle()}
            value={f.currency}
            onChange={(e) => set("currency", e.target.value)}
          >
            {currencies.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="lp-holding-owner">
        <Field label="Owner">
          <Select
            style={inputStyle()}
            value={f.memberId}
            onChange={(e) => set("memberId", e.target.value)}
          >
            {ownerOptions.map((owner) => (
              <option key={owner.id} value={owner.id}>
                {owner.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      {f.kind === "cover" ? (
        <DateField
          label="Renewal date"
          value={f.renewalDate}
          onChange={(value) => set("renewalDate", value)}
        />
      ) : null}
      {f.kind === "asset" ? (
        <DateField
          label="Maturity date (deposits, retirement)"
          value={f.maturityDate}
          onChange={(value) => set("maturityDate", value)}
        />
      ) : null}
      <div className="lp-holding-access">
        <Text as="label" size="sm" weight="semibold" style={labelStyle()}>
          {f.kind === "liability"
            ? "Closure instructions for the family"
            : "Access instructions for the family"}
        </Text>
        <Textarea
          style={{ ...inputStyle() }}
          value={f.accessNote}
          onChange={(e) => set("accessNote", e.target.value)}
          placeholder={
            f.kind === "liability"
              ? "Who to contact, account details, and how to close or take over the loan"
              : "Where it is, who to contact, how to claim (locker no., agent, portal)"
          }
        />
      </div>
      {f.kind !== "liability" ? (
        <div
          className="lp-wealth-form-row lp-holding-nominee"
          style={{
            marginTop: "var(--space-s14)",
            display: "flex",
            gap: "var(--space-s10)",
            alignItems: "center",
          }}
        >
          <Text as="label" size="md" weight="semibold">
            <Checkbox
              type="checkbox"
              checked={f.nominee}
              onChange={(e) => set("nominee", e.target.checked)}
            />{" "}
            Nominee named
          </Text>
          {f.nominee ? (
            <Input
              style={{ ...inputStyle(), flex: 1 }}
              value={f.nomineeName}
              onChange={(e) => set("nomineeName", e.target.value)}
              placeholder="Nominee name"
            />
          ) : null}
        </div>
      ) : null}
      {error ? <Text as="div" size="md" className="lp-sos-error">{error}</Text> : null}
      <div
        className="lp-wealth-form-actions"
        style={{ display: "flex", gap: "var(--space-s10)", marginTop: "var(--space-s20)" }}
      >
        <Button loading={Boolean(busy)} variant="primary" type="button"
          disabled={!valid || busy}
          onClick={save}

        >
          {busy ? "Saving..." : record ? "Save" : "Add holding"}
        </Button>
        {record ? (
          <Button size="sm" tone="danger" iconOnly variant="tertiary" type="button"
            onClick={deleteHolding}
            title="Remove"
            aria-label="Remove"
          >
            <Trash2 aria-hidden="true" focusable="false" size={15} />
          </Button>
        ) : null}
      </div>
    </Modal>
  );
}

function ProofModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: (record: WealthRecord) => void;
}) {
  const documents = useAppSelector((state) => state.documents.items);
  const user = useAppSelector((state) => state.auth.user);
  const [selectedDoc, setSelectedDoc] = useState<DocumentRecord | null>(null);
  const [uploading, setUploading] = useState(false);
  const relevantDocs = useMemo(
    () => documents.filter(isWealthEvidenceDocument),
    [documents],
  );
  const choose = (doc: DocumentRecord) => setSelectedDoc(doc);

  if (uploading)
    return (
      <UploadDocumentModal
        open
        onClose={() => setUploading(false)}
        onSaved={choose}
      />
    );
  if (!selectedDoc)
    return (
      <Modal onClose={onClose}>
        <div className="lp-vault-picker-head">
          <Heading level={2} size="sm">From a document in your vault</Heading>
          <Button size="sm" variant="tertiary" type="button" onClick={onClose}>
            Done
          </Button>
        </div>
        <button
          type="button"
          className="lp-vault-doc-row upload"
          onClick={() => setUploading(true)}
        >
          <span className="lp-vault-icon upload">
            <UploadCloud aria-hidden="true" focusable="false" size="var(--icon-regular)" />
          </span>
          <span>
            <b>Scan or upload a new document</b>
            <small>
              Statement, policy, or deed. It is filed in Documents and opened
              here.
            </small>
          </span>
        </button>
        <div   className="lp-vault-doc-list">
          {relevantDocs.map((doc) => (
            <DocumentRow
              key={doc.id}
              doc={doc}
              fallbackOwner={user?.name}
              onClick={() => choose(doc)}
            />
          ))}
          {!relevantDocs.length ? (
            <Text as="div" size="md" weight="medium" className="lp-vault-empty">
              No matching vault documents yet.
            </Text>
          ) : null}
        </div>
      </Modal>
    );
  return (
    <HoldingModal
      title="Add holding"
      initialDocument={selectedDoc}
      onClose={onClose}
      onSaved={onSaved}
    />
  );
}

function MoneyLentBorrowedModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: (record: WealthRecord) => void;
}) {
  const documents = useAppSelector((state) => state.documents.items);
  const user = useAppSelector((state) => state.auth.user);
  const [selectedDoc, setSelectedDoc] = useState<DocumentRecord | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const [more, setMore] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [f, setF] = useState({
    whatFor: "",
    amount: "",
    currency: currencies[0] ?? "INR",
    direction: "LENT",
    date: today(),
    who: "",
    followUpOn: "",
    followUpNote: "",
  });
  const set = (key: string, value: string) => {
    setF((current) => ({ ...current, [key]: value }));
    setError(null);
  };
  const relevantDocs = useMemo(
    () => documents.filter(isWealthEvidenceDocument),
    [documents],
  );
  const amount = Number(f.amount);
  const valid =
    f.whatFor.trim().length > 0 &&
    Number.isFinite(amount) &&
    amount > 0 &&
    Boolean(f.currency) &&
    Boolean(f.direction) &&
    Boolean(f.date);
  const choose = (doc: DocumentRecord) => {
    setSelectedDoc(doc);
    setShowDocs(false);
    setF((current) => ({
      ...current,
      whatFor: current.whatFor || documentTitle(doc),
      amount: current.amount || amountFromDocument(doc),
    }));
  };

  async function save() {
    if (!valid || busy) {
      setError("Enter what for, amount, currency, which way, and date.");
      return;
    }
    setBusy(true);
    setError(null);
    const amountText = normalizeAmount(f.amount);
    const direction = f.direction === "BORROWED" ? "BORROWED" : "LENT";
    const details = {
      recordKind: "money_lent_borrowed",
      whatFor: f.whatFor.trim(),
      amount: amountText,
      principalAmount: amountText,
      currency: f.currency,
      direction,
      transactionDate: f.date,
      date: f.date,
      who: f.who.trim(),
      party: f.who.trim(),
      paidTo: direction === "LENT" ? f.who.trim() : "",
      receivedFrom: direction === "BORROWED" ? f.who.trim() : "",
      followUpOn: f.followUpOn,
      proofStatus: selectedDoc ? "attached" : "cash_no_record",
      sourceDocumentId: selectedDoc?.id ?? "",
      sourceDocumentCategory: selectedDoc?.category ?? "",
      sourceDocumentType: selectedDoc?.documentType ?? "",
    };
    const payload: WealthRecordPayload = {
      type: direction === "BORROWED" ? "LOAN_TAKEN" : "LOAN_GIVEN",
      title: f.whatFor.trim(),
      details,
      notes: f.followUpNote,
      followUpDate: f.followUpOn || null,
      followUpNote: f.followUpNote,
      attachmentDocumentIds: selectedDoc ? [selectedDoc.id] : [],
    };
    try {
      onSaved(await api.wealth.createRecord(payload));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to record money lent or borrowed.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (uploading)
    return (
      <UploadDocumentModal
        open
        onClose={() => setUploading(false)}
        onSaved={choose}
      />
    );
  return (
    <Modal onClose={onClose} className="lp-money-modal">
      <Head title="Record money lent or borrowed" onClose={onClose} />
      <Text as="p" size="md" tone="muted"
        style={{ margin: "-6px 0 14px", color: css.muted }}
      >
        Attach the UPI screenshot, chat, or statement line, confirm who and how
        much, done. Cash with no record is fine too; say so.
      </Text>
      <button
        type="button"
        className="lp-money-proof"
        onClick={() => setShowDocs((value) => !value)}
      >
        <Paperclip aria-hidden="true" focusable="false" size={22} color="var(--lp-action)" />
        <b>Photo · screenshot · receipt · PDF</b>
        <small style={{ color: css.muted }}>
          The proof is the record; it files into Documents too
        </small>
        {selectedDoc ? (
          <small style={{ color: css.action, fontWeight: "var(--weight-bold)" }}>
            Attached: {documentTitle(selectedDoc)}
          </small>
        ) : null}
      </button>
      {showDocs ? (
        <div style={{ marginTop: "var(--space-s10)" }}>
          <button
            type="button"
            className="lp-vault-doc-row upload"
            onClick={() => setUploading(true)}
          >
            <span className="lp-vault-icon upload">
              <UploadCloud aria-hidden="true" focusable="false" size="var(--icon-regular)" />
            </span>
            <span>
              <b>Scan or upload a new document</b>
              <small>
                Photo, screenshot, receipt, or PDF. It will be filed in
                Documents.
              </small>
            </span>
          </button>
          <div
            className="lp-vault-doc-list"
            style={{ maxHeight: 180, overflowY: "auto" }}
          >
            {selectedDoc ? (
              <DocumentRow
                doc={selectedDoc}
                fallbackOwner={user?.name}
                selected
                onClick={() => setSelectedDoc(null)}
              />
            ) : null}
            {relevantDocs.map((doc) => (
              <DocumentRow
                key={doc.id}
                doc={doc}
                fallbackOwner={user?.name}
                onClick={() => choose(doc)}
              />
            ))}
            {!relevantDocs.length ? (
              <Text as="div" size="md" weight="medium" className="lp-vault-empty">
                No matching vault documents yet.
              </Text>
            ) : null}
          </div>
        </div>
      ) : null}
      <Text as="label" size="md" style={{ ...labelStyle(), marginTop: "var(--space-s14)" }}>What for</Text>
      <Input
        style={inputStyle()}
        value={f.whatFor}
        onChange={(e) => set("whatFor", e.target.value)}
        placeholder="e.g. car down payment, hospital bill, wedding advance"
      />
      <div className="lp-wealth-form-row" style={{ display: "flex", gap: "var(--space-s10)" }}>
        <Field label="Amount">
          <Input
            style={inputStyle()}
            type="number"
            min="0"
            inputMode="decimal"
            value={f.amount}
            onChange={(e) => set("amount", e.target.value)}
            placeholder="0"
          />
        </Field>
        <Field label="Currency">
          <Select
            style={inputStyle()}
            value={f.currency}
            onChange={(e) => set("currency", e.target.value)}
          >
            {currencies.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="lp-wealth-form-row" style={{ display: "flex", gap: "var(--space-s10)" }}>
        <Field label="Which way">
          <Select
            style={inputStyle()}
            value={f.direction}
            onChange={(e) => set("direction", e.target.value)}
          >
            <option value="LENT">I lent</option>
            <option value="BORROWED">I borrowed</option>
          </Select>
        </Field>
        <Field label="Date">
          <Input
            style={inputStyle()}
            type="date"
            value={f.date}
            onChange={(e) => set("date", e.target.value)}
          />
        </Field>
      </div>
      <Button variant="tertiary"
        type="button"
        onClick={() => setMore((value) => !value)}
        style={{ marginTop: "var(--space-s12)" }}
      >
        <ChevronUp aria-hidden="true" focusable="false"
          size={12}
          style={{ transform: more ? "none" : "rotate(180deg)" }}
        />{" "}
        Fewer details
      </Button>
      {more ? (
        <>
          <Text as="label" size="md" style={{ ...labelStyle(), marginTop: "var(--space-s12)" }}>Who</Text>
          <Input
            style={inputStyle()}
            value={f.who}
            onChange={(e) => set("who", e.target.value)}
            placeholder="e.g. Rohan K (friend), Meera (sister)"
          />
          <div
            className="lp-wealth-form-row"
            style={{ display: "flex", gap: "var(--space-s10)" }}
          >
            <Field label="Follow up on">
              <Input
                style={inputStyle()}
                type="date"
                value={f.followUpOn}
                onChange={(e) => set("followUpOn", e.target.value)}
              />
            </Field>
            <Field label="Follow-up note">
              <Input
                style={inputStyle()}
                value={f.followUpNote}
                onChange={(e) => set("followUpNote", e.target.value)}
                placeholder="e.g. check if cheque cleared"
              />
            </Field>
          </div>
        </>
      ) : null}
      {error ? <Text as="div" size="md" className="lp-sos-error">{error}</Text> : null}
      <Button loading={Boolean(busy)} variant="primary"
        type="button"
        disabled={!valid || busy}
        onClick={save}
      >
        {busy ? "Saving..." : "Confirm"}
      </Button>
    </Modal>
  );
}

function DocumentRow({
  doc,
  fallbackOwner,
  onClick,
  selected,
}: {
  doc: DocumentRecord;
  fallbackOwner?: string;
  onClick: () => void;
  selected?: boolean;
}) {
  const meta = categoryMeta(doc.category);
  const Icon = meta.icon;
  const owner = doc.owner || fallbackOwner || "You";
  return (
    <button
      type="button"
      className={`lp-vault-doc-row ${selected ? "selected" : ""}`}
      onClick={onClick}
    >
      <span
        className="lp-vault-icon"
        style={{
          color: meta.accent,
        }}
      >
        <Icon aria-hidden="true" focusable="false" size="var(--icon-regular)" />
      </span>
      <span>
        <b>{documentTitle(doc)}</b>
        <small>
          {owner} · {labelize(doc.category)}
        </small>
      </span>
    </button>
  );
}

function categoryMeta(category: string) {
  return (
    categories.find(
      (item) =>
        item.name.toLowerCase() === category.toLowerCase() ||
        item.key === category.toLowerCase(),
    ) ?? categories[categories.length - 1]!
  );
}

function isWealthEvidenceDocument(doc: DocumentRecord) {
  const haystack = [
    doc.category,
    doc.documentType,
    doc.normalizedType,
    doc.title,
    doc.originalName,
    JSON.stringify(fieldsObject(doc)),
  ]
    .join(" ")
    .toLowerCase();
  return [
    "finance",
    "insurance",
    "bank",
    "investment",
    "itr",
    "tax",
    "transaction",
    "property",
    "deed",
    "loan",
    "liability",
    "policy",
    "statement",
    "payment",
    "receipt",
  ].some((word) => haystack.includes(word));
}

function amountFromDocument(doc: DocumentRecord) {
  const fields = fieldsObject(doc);
  const found = ["amount", "value", "coverageAmount", "principalAmount"]
    .map((key) => fields[key])
    .find((value) => typeof value === "string" || typeof value === "number");
  return found ? String(found).replace(/[^\d.]/g, "") : "";
}

function normalizeAmount(value: string) {
  const normalized = value.trim().replace(/[^\d.]/g, "");
  if (!normalized) return "";
  const [whole, ...rest] = normalized.split(".");
  return rest.length ? `${whole}.${rest.join("").slice(0, 2)}` : whole;
}

function Head({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div
      className="lp-wealth-modal-head"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "var(--space-s16)",
      }}
    >
      <Text as="b" size="lg" weight="semibold" style={{ color: css.heading }}>{title}</Text>
      <Button size="sm" iconOnly variant="tertiary" type="button" aria-label="Close"
        onClick={onClose}
      >
        <X aria-hidden="true" focusable="false" size="var(--icon-small)" />
      </Button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ flex: 1, marginTop: "var(--space-s12)" }}>
      <Text as="label" size="md" style={labelStyle()}>{label}</Text>
      {children}
    </div>
  );
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div style={{ marginTop: "var(--space-s12)" }}>
      <Text as="label" size="md" style={labelStyle()}>{label}</Text>
      <Input
        type="date"
        style={inputStyle()}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
