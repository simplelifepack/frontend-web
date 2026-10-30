import { SearchableSelectMenu } from "@/design-system";
import { useState } from "react";
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
  const [query, setQuery] = useState("");
  return (
    <SearchableSelectMenu
      aria-label="Type"
      value={value}
      placeholder="Select or enter type..."
      onSearchChange={setQuery}
      onValueChange={(option) => {
        onChange(option);
        if (option === "Other") onOtherQuery?.(query);
      }}
      options={suggestionsForKind(kind).map(option => ({
        value: option,
        label: option,
        alwaysVisible: option === "Other",
      }))}
    />
  );
}
