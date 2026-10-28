import { Text, Input } from "@/design-system";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { type DocumentRecord } from "@/lib/api";
import { documentTitle } from "@/pages/documents/document-utils";
import { kindFromDocument, typeFromDocument, valueFromDocumentFields, holdingTypeSuggestions } from "./capture-proof-dialog.Mode";


export function initialStateFromDocument(doc: DocumentRecord) {
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


export type HoldingKind = keyof typeof holdingTypeSuggestions;


export function suggestionsForKind(kind: string) {
  return holdingTypeSuggestions[
    (kind in holdingTypeSuggestions ? kind : "asset") as HoldingKind
  ];
}


export function normalizeTypeName(value: string) {
  return value.trim().toLowerCase();
}


export function initialTypeChoice(kind: string, type: string) {
  const options = suggestionsForKind(kind);
  if (!type) return "";
  return (
    options.find(
      (option) => normalizeTypeName(option) === normalizeTypeName(type),
    ) ?? "Other"
  );
}


export function TypeCombobox({
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
