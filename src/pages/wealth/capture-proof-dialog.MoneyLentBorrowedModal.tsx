import { Text, Input, SelectMenu, Button } from "@/design-system";
import { ChevronUp, Paperclip, UploadCloud } from "lucide-react";
import UploadDocumentModal from "@/components/UploadDocumentModal";
import { documentTitle } from "@/pages/documents/document-utils";
import { Modal, css, labelStyle, inputStyle, currencies } from "./capture-proof-dialog.Mode";
import { Head, DocumentRow, Field } from "./capture-proof-dialog.DocumentRow";
import { useMoneyLentBorrowedModalLogic } from "./capture-proof-dialog.HoldingModalViewSection2";


 export function MoneyLentBorrowedModal(props: Parameters<typeof useMoneyLentBorrowedModalLogic>[0]) {
const context = useMoneyLentBorrowedModalLogic(props);
const { onClose, onSaved, documents, user, selectedDoc, setSelectedDoc, uploading, setUploading, showDocs, setShowDocs, more, setMore, busy, setBusy, error, setError, f, setF, set, relevantDocs, amount, valid, choose, save } = context;
if (uploading)
    return (
      <UploadDocumentModal
        open
        onClose={() => setUploading(false)}
        onSaved={choose}
      />
    );
return ((
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
          <SelectMenu
            value={f.currency}
            onValueChange={(selectedValue) => set("currency", selectedValue)}
            options={currencies.map((item) => ({ value: item, label: item }))}
          />
        </Field>
      </div>
      <div className="lp-wealth-form-row" style={{ display: "flex", gap: "var(--space-s10)" }}>
        <Field label="Which way">
          <SelectMenu
            value={f.direction}
            onValueChange={(selectedValue) => set("direction", selectedValue)}
            options={[
              { value: "LENT", label: "I lent" },
              { value: "BORROWED", label: "I borrowed" },
            ]}
          />
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
  ));
}
