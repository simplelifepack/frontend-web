import { Text, Heading, Input, SelectMenu, Textarea, Button } from "@/design-system";
import { useMemo, useState } from "react";
import { Trash2, UploadCloud } from "lucide-react";
import UploadDocumentModal from "@/components/UploadDocumentModal";
import { type DocumentRecord, type WealthRecord } from "@/lib/api";
import { useAppSelector } from "@/store/hooks";
import { Modal, labelStyle, inputStyle } from "./capture-proof-dialog.Mode";
import { Head, Field, DateField, isWealthEvidenceDocument, DocumentRow } from "./capture-proof-dialog.DocumentRow";
import { useHoldingModalLogic, HoldingModalViewSection1 } from "./capture-proof-dialog.useHoldingModalLogic";
import { HoldingModalViewSection2, HoldingModalViewSection3, HoldingModalViewSection4 } from "./capture-proof-dialog.HoldingModalViewSection2";


export function HoldingModal(props: Parameters<typeof useHoldingModalLogic>[0]) {
const context = useHoldingModalLogic(props);
const { title, record, initialDocument, onClose, onSaved, onDeleted, documents, user, familyMembers, busy, setBusy, error, setError, fillNote, setFillNote, uploading, setUploading, f, setF, typeChoice, setTypeChoice, otherType, setOtherType, attachedDocumentIds, setAttachedDocumentIds, attachedDocuments, setAttachedDocuments, attachedDocumentList, linkedDocument, ownerOptions, set, setKind, resolvedType, kindType, valueKey, valid, save, attachDocument, fillFromDocument, deleteHolding } = context;
if (uploading)
    return (
      <UploadDocumentModal
        open
        onClose={() => setUploading(false)}
        onSaved={attachDocument}
      />
    );
return ((
    <Modal onClose={onClose} className="lp-holding-modal">
      <Head
        title={title ?? (record ? "Edit holding" : "Add holding")}
        onClose={onClose}
      />
      <HoldingModalViewSection1 {...context} />
      <Text as="label" size="sm" weight="medium" style={labelStyle()}>Name</Text>
      <Input
        style={inputStyle()}
        value={f.name}
        onChange={(e) => set("name", e.target.value)}
        placeholder="e.g. Investment portfolio"
      />
      <HoldingModalViewSection2 {...context} />
      {typeChoice === "Other" ? (
        <div className="lp-other-type-field">
          <Text as="label" size="sm" weight="medium" style={labelStyle()}>Other type</Text>
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
      <HoldingModalViewSection3 {...context} />
      <div className="lp-holding-owner">
        <Field label="Owner">
          <SelectMenu
            value={f.memberId}
            onValueChange={(selectedValue) => set("memberId", selectedValue)}
            options={ownerOptions.map((owner) => ({
              value: owner.id,
              label: owner.name,
            }))}
          />
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
        <Text as="label" size="sm" weight="medium" style={labelStyle()}>
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
        <HoldingModalViewSection4 {...context} />
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
  ));
}


export function ProofModal({
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
