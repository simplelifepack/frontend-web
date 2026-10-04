import { Loader2, Plus, Search, Trash2, X, Pencil } from "lucide-react";
import { useMemo, useState } from "react";

import UploadDocumentModal from "@/components/UploadDocumentModal";
import { btnGhost, btnPrimary, T } from "@/constants/theme";
import { api, type CustomPackPayload, type DocumentRecord, type PackSummary, type VerificationSource } from "@/lib/api";

type CustomPackModalProps = {
  documentLabels: string[];
  initialDescription?: string;
  onClose: () => void;
  onSave: (payload: CustomPackPayload) => Promise<PackSummary>;
  supportedDocumentTypes: string[];
};

export default function CustomPackModal({
  documentLabels,
  initialDescription = "",
  onClose,
  onSave,
  supportedDocumentTypes,
}: CustomPackModalProps) {
  const [desc, setDesc] = useState(initialDescription);
  const [name, setName] = useState("");
  const [reqs, setReqs] = useState<string[]>([]);
  const [drafted, setDrafted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [source, setSource] = useState<CustomPackPayload["source"]>();
  const [verificationSources, setVerificationSources] = useState<VerificationSource[]>([]);
  const [searchMetadata, setSearchMetadata] = useState<CustomPackPayload["searchMetadata"]>();
  const vocab = useMemo(() => [...new Set(supportedDocumentTypes.filter(Boolean))].sort(), [supportedDocumentTypes]);

  const lookup = async () => {
    const query = desc.trim();
    if (!query || loading) return;
    setLoading(true);
    setError(null);
    setDrafted(true);
    if (!name.trim()) setName(query.replace(/^documents?\s+(needed|required|requested)\s+(for|by)\s+/i, "").slice(0, 80));
    try {
      const { draft } = await api.packages.draftCustom(query, documentLabels);
      setName((current) => current.trim() || draft.packageName);
      setDesc((current) => current.trim() || draft.description);
      setReqs(draft.requiredDocuments.map((item) => item.title || item.name).filter(Boolean));
      setSource({
        name: draft.sourceOrganization,
        title: draft.sourceTitle,
        url: draft.sourceUrl,
        lastCheckedAt: draft.lastChecked,
      });
      setVerificationSources(draft.verificationSources);
      setSearchMetadata({ ...draft.searchMetadata, searchPhrases: draft.searchMetadata.searchPhrases ?? [query] });
    } catch (lookupError) {
      setReqs((current) => current.length ? current : [""]);
      setError(lookupError instanceof Error ? lookupError.message : "Could not look this up right now. You can still add the documents yourself.");
    } finally {
      setLoading(false);
    }
  };

  const startManual = () => {
    if (!name.trim() && desc.trim()) setName(desc.trim().slice(0, 80));
    setReqs(["", ""]);
    setDrafted(true);
    setError(null);
  };

  const save = async () => {
    const requirements = reqs.map((item) => item.trim()).filter(Boolean);
    if (!name.trim() || !requirements.length || saving) return;
    setSaving(true);
    setError(null);
    try {
      await onSave({
        title: name.trim(),
        description: desc.trim() || "Custom pack",
        requirements,
        searchMetadata,
        source,
        verificationSources,
        verificationStatus: verificationSources.length ? "draft_verified" : "user_created",
      });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save this custom pack.");
    } finally {
      setSaving(false);
    }
  };

  const addUploadedDocument = (document: DocumentRecord) => {
    const label = document.displayName
      || document.title
      || document.normalizedType
      || document.documentType
      || document.originalName;
    if (!label?.trim()) return;
    setReqs((items) => [...items.filter((item) => item.trim()), label.trim()]);
  };

  return (
    <div className="lp-modalwrap" style={backdrop} onClick={onClose}>
      <section className="lp-modalbox lp-custom-pack-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="Create custom pack">
        <div className="lp-sheet-grab lp-grabonly" />
        <header className="lp-custom-pack-head">
          <b>Create a custom pack</b>
          <button type="button" onClick={onClose} style={{ ...btnGhost, padding: 8 }} aria-label="Close custom pack">
            <X size={16} />
          </button>
        </header>
        {!drafted ? (
          <>
            <p className="lp-custom-pack-copy">For situations the catalog does not cover.</p>
            <label className="lp-custom-pack-label">What do you need documents for?</label>
            <textarea
              className="lp-custom-pack-input"
              value={desc}
              onChange={(event) => setDesc(event.target.value)}
              placeholder="My son's school admission"
            />
            <button type="button" className="lp-custom-pack-primary" disabled={!desc.trim() || loading} onClick={() => void lookup()}>
              {loading ? <Loader2 size={15} className="lp-spin" /> : <Search size={15} />}
              {loading ? "Looking it up..." : "Look it up for me"}
            </button>
            <div className="lp-custom-pack-or"><span /><em>or</em><span /></div>
            <button type="button" className="lp-custom-pack-manual" onClick={startManual}>
              <Pencil size={15} /> Add documents myself
            </button>
          </>
        ) : (
          <>
            {loading ? <div className="lp-pack-generation-state"><Loader2 size={14} className="lp-spin" />Looking up requirements...</div> : null}
            <label className="lp-custom-pack-label">Pack name</label>
            <input className="lp-custom-pack-input" value={name} onChange={(event) => setName(event.target.value)} placeholder="Name this pack" />
            <label className="lp-custom-pack-label">Description</label>
            <textarea className="lp-custom-pack-input" value={desc} onChange={(event) => setDesc(event.target.value)} placeholder="What is this pack for?" />
            <label className="lp-custom-pack-label">Documents needed</label>
            <p className="lp-custom-pack-copy">List what you were asked for, or add the actual document now.</p>
            <datalist id="lp-custom-pack-doc-types">{vocab.map((item) => <option key={item} value={item} />)}</datalist>
            {reqs.map((req, index) => (
              <div className="lp-custom-pack-req" key={`${index}-${req}`}>
                <input
                  className="lp-custom-pack-input"
                  list="lp-custom-pack-doc-types"
                  value={req}
                  onChange={(event) => setReqs((items) => items.map((item, itemIndex) => itemIndex === index ? event.target.value : item))}
                  placeholder="Document name"
                />
                <button type="button" onClick={() => setReqs((items) => items.filter((_, itemIndex) => itemIndex !== index))} aria-label="Remove">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button type="button" className="lp-custom-pack-add" onClick={() => setUploadOpen(true)}>
              <Plus size={13} /> Add document
            </button>
            <button type="button" className="lp-custom-pack-text-add" onClick={() => setReqs((items) => [...items, ""])}>
              Add requirement by name
            </button>
            {verificationSources.length ? (
              <div className="lp-custom-pack-source">
                <strong>Live sourced draft</strong>
                {verificationSources.slice(0, 4).map((item) => <a key={item.url} href={item.url} target="_blank" rel="noreferrer">{item.title}</a>)}
              </div>
            ) : null}
            <footer className="lp-custom-pack-actions">
              <button type="button" style={btnGhost} onClick={onClose}>Cancel</button>
              <button type="button" style={btnPrimary} disabled={!name.trim() || !reqs.some((item) => item.trim()) || saving} onClick={() => void save()}>
                {saving ? <Loader2 size={15} className="lp-spin" /> : null}
                Save pack
              </button>
            </footer>
          </>
        )}
        {error ? <div className="lp-pack-assignment-error">{error}</div> : null}
      </section>
      {uploadOpen ? (
        <UploadDocumentModal
          open={uploadOpen}
          zIndex={90}
          onClose={() => setUploadOpen(false)}
          onSaved={(document) => {
            addUploadedDocument(document);
            setUploadOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}

const backdrop = {
  position: "fixed",
  inset: 0,
  zIndex: 72,
  background: "var(--lpv-scrim, rgba(18,22,30,.38))",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 18,
} as const;
