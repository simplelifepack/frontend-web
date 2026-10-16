import { vars, Text, ModalBackdrop, ModalPanel, Textarea, Input, Button } from "@/design-system";

import { Loader2, Plus, Search, Trash2, X, Pencil } from "lucide-react";
import { useMemo, useState } from "react";

import UploadDocumentModal from "@/components/UploadDocumentModal";
import { T } from "@/constants/theme";
import { api, type CustomPackPayload, type DocumentRecord, type PackSummary, type VerificationSource } from "@/lib/api";
import { sourceProviderName } from "./package-source-display";

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
  const [verificationStatus, setVerificationStatus] = useState("user_created");
  const [generationMessage, setGenerationMessage] = useState("");
  const [disclaimer, setDisclaimer] = useState("");
  const [searchMetadata, setSearchMetadata] = useState<CustomPackPayload["searchMetadata"]>();
  const vocab = useMemo(() => [...new Set(supportedDocumentTypes.filter(Boolean))].sort(), [supportedDocumentTypes]);

  const applyDraft = (draft: Awaited<ReturnType<typeof api.packages.draftCustom>>["draft"]) => {
    setName((current) => current.trim() || draft.packageName);
    setDesc((current) => current.trim() || draft.description);
    setReqs(draft.requiredDocuments.map((item) => item.title || item.name).filter(Boolean));
    setSource(draft.sourceUrl ? {
      name: draft.sourceOrganization,
      title: draft.sourceTitle,
      url: draft.sourceUrl,
      lastCheckedAt: draft.lastChecked,
    } : undefined);
    setVerificationSources(draft.verificationSources);
    setVerificationStatus(draft.verificationStatus || (draft.verificationSources.length ? "draft_verified" : "user_created"));
    setDisclaimer(typeof draft.disclaimer === "string" ? draft.disclaimer : "");
  };

  const lookup = async () => {
    const query = desc.trim();
    if (!query || loading) return;
    setLoading(true);
    setError(null);
    setDrafted(true);
    if (!name.trim()) setName(query.replace(/^documents?\s+(needed|required|requested)\s+(for|by)\s+/i, "").slice(0, 80));
    try {
      const created = await api.packages.createCustomGenerationJob(query, documentLabels);
      let job = created.job;
      setGenerationMessage(job.statusMessage);
      while (!job.draft && job.status !== "failed") {
        if (job.status === "queued") await new Promise((resolve) => setTimeout(resolve, 1500));
        const response = await api.packages.getCustomGenerationJob(job.id);
        job = response.job;
        setGenerationMessage(job.statusMessage);
      }
      if (!job.draft) throw new Error(job.errorMessage || "Could not generate this package right now.");
      applyDraft(job.draft);
      setSearchMetadata({
        ...job.draft.searchMetadata,
        searchPhrases: job.draft.searchMetadata.searchPhrases ?? [query],
        confidence: job.confidence,
        disclaimer: job.disclaimer,
        hasVerifiedOfficialSource: job.hasVerifiedOfficialSource,
      });
      if (job.disclaimer) setDisclaimer(job.disclaimer);
    } catch (lookupError) {
      setReqs((current) => current.length ? current : [""]);
      setError(lookupError instanceof Error ? lookupError.message : "Could not look this up right now. You can still add the documents yourself.");
    } finally {
      setGenerationMessage("");
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
        verificationStatus: verificationSources.length ? verificationStatus : verificationStatus === "unverified_guidance" ? "unverified_guidance" : "user_created",
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
    <ModalBackdrop  style={backdrop} onClick={onClose}>
      <ModalPanel onDismiss={onClose} as="section" className="lp-custom-pack-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label="Create custom pack">
        <div className="lp-sheet-grab lp-grabonly" />
        <header className="lp-custom-pack-head">
          <Text as="b" size="lg" weight="semibold">Create a custom pack</Text>
          <Button iconOnly variant="tertiary" size="sm" type="button" onClick={onClose} aria-label="Close custom pack">
            <X aria-hidden="true" focusable="false" size="var(--icon-small)" />
          </Button>
        </header>
        {!drafted ? (
          <>
            <Text as="p" size="md" className="lp-custom-pack-copy">For situations the catalog does not cover.</Text>
            <Text as="label" size="sm" weight="semibold" className="lp-custom-pack-label">What do you need documents for?</Text>
            <Textarea

              value={desc}
              onChange={(event) => setDesc(event.target.value)}
              placeholder="My son's school admission"
            />
            <Button loading={loading} variant="primary" type="button" disabled={!desc.trim() || loading} onClick={() => void lookup()}>
              {loading ? <Loader2 aria-hidden="true" focusable="false" size={15} className="lp-spin" /> : <Search aria-hidden="true" focusable="false" size={15} />}
              {loading ? "Looking it up..." : "Look it up for me"}
            </Button>
            <div className="lp-custom-pack-or"><span /><Text as="em" size="sm">or</Text><span /></div>
            <Button variant="secondary" type="button" onClick={startManual}>
              <Pencil aria-hidden="true" focusable="false" size={15} /> Add documents myself
            </Button>
          </>
        ) : (
          <>
            {loading ? <Text as="div" size="md" className="lp-pack-generation-state"><Loader2 aria-hidden="true" focusable="false" size={14} className="lp-spin" />{generationMessage || "Looking up requirements..."}</Text> : null}
            <Text as="label" size="sm" weight="semibold" className="lp-custom-pack-label">Pack name</Text>
            <Input  value={name} onChange={(event) => setName(event.target.value)} placeholder="Name this pack" />
            <Text as="label" size="sm" weight="semibold" className="lp-custom-pack-label">Description</Text>
            <Textarea  value={desc} onChange={(event) => setDesc(event.target.value)} placeholder="What is this pack for?" />
            <Text as="label" size="sm" weight="semibold" className="lp-custom-pack-label">Documents needed</Text>
            <Text as="p" size="md" className="lp-custom-pack-copy">List what you were asked for, or add the actual document now.</Text>
            <datalist id="lp-custom-pack-doc-types">{vocab.map((item) => <option key={item} value={item} />)}</datalist>
            {reqs.map((req, index) => (
              <div className="lp-custom-pack-req" key={`${index}-${req}`}>
                <Input

                  list="lp-custom-pack-doc-types"
                  value={req}
                  onChange={(event) => setReqs((items) => items.map((item, itemIndex) => itemIndex === index ? event.target.value : item))}
                  placeholder="Document name"
                />
                <Button size="sm" tone="danger" iconOnly variant="tertiary" type="button" onClick={() => setReqs((items) => items.filter((_, itemIndex) => itemIndex !== index))} aria-label="Remove">
                  <Trash2 aria-hidden="true" focusable="false" size={14} />
                </Button>
              </div>
            ))}
            <Button size="sm" variant="tertiary" type="button" onClick={() => setUploadOpen(true)}>
              <Plus aria-hidden="true" focusable="false" size={13} /> Add document
            </Button>
            <Button size="sm" variant="tertiary" type="button" onClick={() => setReqs((items) => [...items, ""])}>
              Add requirement by name
            </Button>
            {verificationSources.length ? (
              <Text as="div" size="sm" className="lp-custom-pack-source">
                <strong>Live sourced draft</strong>
                {verificationSources.slice(0, 4).map((item) => <Text as="a" size="md" key={item.url} href={item.url} target="_blank" rel="noreferrer" title={item.title}>{sourceProviderName(item)}</Text>)}
              </Text>
            ) : null}
            {disclaimer ? <Text as="div" size="sm" className="lp-pack-assignment-error">{disclaimer}</Text> : null}
            <footer className="lp-custom-pack-actions">
              <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
              <Button loading={saving} variant="primary" type="button" disabled={!name.trim() || !reqs.some((item) => item.trim()) || saving} onClick={() => void save()}>
                {saving ? <Loader2 aria-hidden="true" focusable="false" size={15} className="lp-spin" /> : null}
                Save pack
              </Button>
            </footer>
          </>
        )}
        {error ? <Text as="div" size="sm" className="lp-pack-assignment-error">{error}</Text> : null}
      </ModalPanel>
      {uploadOpen ? (
        <UploadDocumentModal
          open={uploadOpen}
          zIndex={vars.layers.confirmation}
          onClose={() => setUploadOpen(false)}
          onSaved={(document) => {
            addUploadedDocument(document);
            setUploadOpen(false);
          }}
        />
      ) : null}
    </ModalBackdrop>
  );
}

const backdrop = {
  position: "fixed",
  inset: 0,
  zIndex: "var(--layer-overlay)",
  background: "var(--lpv-scrim, rgba(18,22,30,.38))",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "var(--space-s18)",
} as const;
