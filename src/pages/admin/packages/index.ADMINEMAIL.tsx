import { Heading, Text, SearchField, Input, SelectMenu, Textarea, Checkbox, Button } from "@/design-system";
import { Download, FilePlus2, Loader2, Plus, Save, Trash2, Upload, X } from "lucide-react";
import { type AdminPackage, type AdminPackagePayload, type AdminPackageRequirement, type AdminPackageSource } from "@/lib/api";
import { useAdminPackagesPageLogic } from "./index.useAdminPackagesPageLogic";


export const ADMIN_EMAIL = "admin@readines.com";

export const blankRequirement = (): AdminPackageRequirement => ({
  acceptedDocumentTypes: [],
  alternativeLabels: [],
  description: "",
  documentType: "",
  group: "Required",
  owner: "self",
  required: true,
  title: "",
});

export const blankSource = (): AdminPackageSource => ({ name: "", title: "", type: "official", url: "" });

export const blankDraft = (): AdminPackagePayload => ({
  aliases: [],
  category: "",
  description: "",
  keywords: [],
  requirements: [blankRequirement()],
  sources: [],
  title: "",
  verificationStatus: "verified",
});


export function listText(values?: string[]) {
  return values?.join("\n") ?? "";
}


export function textList(value: string) {
  return value.split(/\n|,/).map((item) => item.trim()).filter(Boolean);
}


export function editableRequirement(item: AdminPackage["requirements"][number]): AdminPackageRequirement {
  return {
    acceptedDocumentTypes: item.acceptedDocumentTypes ?? [],
    alternativeLabels: item.alternativeLabels ?? [],
    description: item.description ?? "",
    documentType: item.documentType ?? "",
    group: item.group || "Required",
    id: item.id,
    metadata: item.metadata ?? undefined,
    owner: item.owner || "self",
    required: item.required,
    sortOrder: item.sortOrder,
    title: item.title,
  };
}


export function editableSource(source: AdminPackageSource): AdminPackageSource {
  return {
    name: source.name ?? source.organization ?? "",
    organization: source.organization ?? source.name ?? "",
    retrievedAt: source.retrievedAt ?? "",
    title: source.title,
    type: source.type ?? "official",
    url: source.url,
  };
}


export function draftFromPackage(pack: AdminPackage): AdminPackagePayload {
  const metadata: Record<string, unknown> = pack.searchMetadata && typeof pack.searchMetadata === "object" && !Array.isArray(pack.searchMetadata) ? pack.searchMetadata : {};
  return {
    aliases: pack.aliases ?? [],
    applicability: typeof metadata.applicability === "string" ? metadata.applicability : "",
    category: pack.category,
    country: typeof metadata.country === "string" ? metadata.country : "",
    description: pack.description,
    keywords: pack.keywords ?? [],
    lastCheckedAt: pack.lastCheckedAt?.slice(0, 10) ?? null,
    lastVerifiedAt: pack.lastVerifiedAt?.slice(0, 10) ?? null,
    requirements: pack.requirements.length ? pack.requirements.map(editableRequirement) : [blankRequirement()],
    searchMetadata: metadata,
    slug: pack.slug,
    sourceName: pack.sourceName ?? "",
    sourceTitle: pack.sourceTitle ?? "",
    sourceType: pack.sourceType ?? "official",
    sourceUrl: pack.sourceUrl ?? "",
    sources: pack.verificationSources?.map(editableSource) ?? [],
    subtitle: pack.subtitle ?? "",
    title: pack.title,
    verificationStatus: pack.verificationStatus ?? "verified",
  };
}


export function AdminPackagesPage() {
const context = useAdminPackagesPageLogic();
const { user, items, setItems, categories, setCategories, pagination, setPagination, search, setSearch, category, setCategory, loading, setLoading, saving, setSaving, error, setError, message, setMessage, selected, setSelected, formOpen, setFormOpen, draft, setDraft, csvPreview, setCsvPreview, importResult, setImportResult, csvText, setCsvText, isAdmin, totalPages, canImport, load, selectedSlug, payload, save, remove, updateRequirement, updateSource, previewCsv, importCsv, downloadTemplate } = context;
if (!isAdmin) {
    return (
      <section className="lp-admin-packages">
        <div className="lp-admin-empty" role="alert">
          <Heading level={1} size="lg">403</Heading>
          <Text as="p" size="md">This packages admin panel is only available to the configured admin account.</Text>
        </div>
      </section>
    );
  }
return ((
    <section className="lp-admin-packages">
      <header className="lp-admin-head">
        <div>
          <Heading level={1} size="lg">Package Admin</Heading>
          <Text as="p" size="md">Manage shared packages only. Custom user packages are excluded.</Text>
        </div>
        <Button variant="primary" type="button" onClick={() => { setSelected(null); setDraft(blankDraft()); setFormOpen(true); setError(""); setMessage(""); }}><FilePlus2 aria-hidden="true" focusable="false" size="var(--icon-small)" />New package</Button>
      </header>

      {(error || message) && <Text as="div" size="md" className={error ? "lp-admin-alert error" : "lp-admin-alert"}>{error || message}</Text>}

      <div className="lp-admin-grid">
        <aside className="lp-admin-list">
          <div className="lp-admin-tools">
            <SearchField appearance="filter" aria-label="Search packages" value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void load(1); }} placeholder="Search packages" />
            <SelectMenu
              aria-label="Package category"
              value={category || "all"}
              onValueChange={(value) => setCategory(value === "all" ? "" : value)}
              options={[
                { value: "all", label: "All categories" },
                ...categories.map((item) => ({ value: item, label: item })),
              ]}
            />
            <Button variant="primary" type="button" onClick={() => void load(1)}>Apply</Button>
          </div>
          {loading ? <Text as="div" size="md" className="lp-admin-state"><Loader2 aria-hidden="true" focusable="false" className="lp-spin" size="var(--icon-small)" />Loading packages</Text> : null}
          {!loading && !items.length ? <Text as="div" size="md" className="lp-admin-state">No shared packages found.</Text> : null}
          {items.map((pack) => (
            <button key={pack.id} type="button" className={`lp-admin-row ${selected?.slug === pack.slug ? "active" : ""}`} onClick={() => { setSelected(pack); setError(""); setMessage(""); }}>
              <span><b>{pack.title}</b><small>{pack.category} · {pack.requirements.length} requirements</small></span>
              <Trash2 size={16} onClick={(event) => { event.stopPropagation(); void remove(pack); }} />
            </button>
          ))}
          <div className="lp-admin-pages">
            <Button size="sm" variant="default" type="button" disabled={pagination.page <= 1} onClick={() => void load(pagination.page - 1)}>Previous</Button>
            <Text size="md">Page {pagination.page} of {totalPages} · {pagination.total}</Text>
            <Button size="sm" variant="default" type="button" disabled={!pagination.hasNextPage} onClick={() => void load(pagination.page + 1)}>Next</Button>
          </div>
        </aside>

        {formOpen ? <main className="lp-admin-editor">
          <div className="lp-admin-section">
            <Heading level={2} size="md">{selected ? "Edit package" : "Add package"}</Heading>
            <div className="lp-admin-form two">
              <Text as="label" size="sm" weight="medium">Package name<Input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></Text>
              <Text as="label" size="sm" weight="medium">Slug<Input value={draft.slug ?? ""} onChange={(event) => setDraft({ ...draft, slug: event.target.value })} /></Text>
              <Text as="label" size="sm" weight="medium">Category<Input value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} /></Text>
              <Text as="label" size="sm" weight="medium">Subtitle<Input value={draft.subtitle ?? ""} onChange={(event) => setDraft({ ...draft, subtitle: event.target.value })} /></Text>
              <Text as="label" size="sm" weight="medium">Country<Input value={draft.country ?? ""} onChange={(event) => setDraft({ ...draft, country: event.target.value })} /></Text>
              <Text as="label" size="sm" weight="medium">Applicability<Input value={draft.applicability ?? ""} onChange={(event) => setDraft({ ...draft, applicability: event.target.value })} /></Text>
              <Text as="label" size="sm" weight="medium" className="wide">Description<Textarea value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></Text>
              <Text as="label" size="sm" weight="medium">Aliases<Textarea value={listText(draft.aliases)} onChange={(event) => setDraft({ ...draft, aliases: textList(event.target.value) })} /></Text>
              <Text as="label" size="sm" weight="medium">Keywords<Textarea value={listText(draft.keywords)} onChange={(event) => setDraft({ ...draft, keywords: textList(event.target.value) })} /></Text>
            </div>
          </div>

          <div className="lp-admin-section">
            <div className="lp-admin-section-head"><Heading level={2} size="md">Sources</Heading><Button size="sm" variant="secondary" type="button" onClick={() => setDraft({ ...draft, sources: [...draft.sources, blankSource()] })}><Plus aria-hidden="true" focusable="false" size={15} />Source</Button></div>
            <div className="lp-admin-form two">
              <Text as="label" size="sm" weight="medium">Primary source name<Input value={draft.sourceName ?? ""} onChange={(event) => setDraft({ ...draft, sourceName: event.target.value })} /></Text>
              <Text as="label" size="sm" weight="medium">Primary URL<Input value={draft.sourceUrl ?? ""} onChange={(event) => setDraft({ ...draft, sourceUrl: event.target.value })} /></Text>
              <Text as="label" size="sm" weight="medium">Primary source title<Input value={draft.sourceTitle ?? ""} onChange={(event) => setDraft({ ...draft, sourceTitle: event.target.value })} /></Text>
              <Text as="label" size="sm" weight="medium">Source type<Input value={draft.sourceType ?? ""} onChange={(event) => setDraft({ ...draft, sourceType: event.target.value })} /></Text>
            </div>
            {draft.sources.map((source, index) => (
              <div className="lp-admin-repeat" key={`${source.url}-${index}`}>
                <Text as="label" size="sm" weight="medium">Display name<Input value={source.title} onChange={(event) => updateSource(index, { title: event.target.value })} /></Text>
                <Text as="label" size="sm" weight="medium">URL<Input value={source.url} onChange={(event) => updateSource(index, { url: event.target.value })} /></Text>
                <Text as="label" size="sm" weight="medium">Organization<Input value={source.name ?? source.organization ?? ""} onChange={(event) => updateSource(index, { name: event.target.value })} /></Text>
                <Button size="sm" tone="danger" iconOnly variant="tertiary" type="button" aria-label="Remove source" onClick={() => setDraft({ ...draft, sources: draft.sources.filter((_, itemIndex) => itemIndex !== index) })}><X aria-hidden="true" focusable="false" size="var(--icon-small)" /></Button>
              </div>
            ))}
          </div>

          <div className="lp-admin-section">
            <div className="lp-admin-section-head"><Heading level={2} size="md">Requirements</Heading><Button size="sm" variant="secondary" type="button" onClick={() => setDraft({ ...draft, requirements: [...draft.requirements, blankRequirement()] })}><Plus aria-hidden="true" focusable="false" size={15} />Requirement</Button></div>
            {draft.requirements.map((requirement, index) => (
              <div className="lp-admin-requirement" key={requirement.id ?? index}>
                <div className="lp-admin-form two">
                  <Text as="label" size="sm" weight="medium">Title<Input value={requirement.title} onChange={(event) => updateRequirement(index, { title: event.target.value })} /></Text>
                  <Text as="label" size="sm" weight="medium">Group<Input value={requirement.group} onChange={(event) => updateRequirement(index, { group: event.target.value })} /></Text>
                  <Text as="label" size="sm" weight="medium">Document type<Input value={requirement.documentType ?? ""} onChange={(event) => updateRequirement(index, { documentType: event.target.value })} /></Text>
                  <Text as="label" size="sm" weight="medium">Owner<Input value={requirement.owner} onChange={(event) => updateRequirement(index, { owner: event.target.value })} /></Text>
                  <Text as="label" size="sm" weight="medium" className="wide">Description<Textarea value={requirement.description ?? ""} onChange={(event) => updateRequirement(index, { description: event.target.value })} /></Text>
                  <Text as="label" size="sm" weight="medium">Accepted document types<Textarea value={listText(requirement.acceptedDocumentTypes)} onChange={(event) => updateRequirement(index, { acceptedDocumentTypes: textList(event.target.value) })} /></Text>
                  <Text as="label" size="sm" weight="medium">Alternative labels<Textarea value={listText(requirement.alternativeLabels)} onChange={(event) => updateRequirement(index, { alternativeLabels: textList(event.target.value) })} /></Text>
                </div>
                <div className="lp-admin-requirement-actions">
                  <Text as="label" size="md"><Checkbox type="checkbox" checked={requirement.required} onChange={(event) => updateRequirement(index, { required: event.target.checked })} /> Required</Text>
                  <Button tone="danger" variant="default" type="button" disabled={draft.requirements.length === 1} onClick={() => setDraft({ ...draft, requirements: draft.requirements.filter((_, itemIndex) => itemIndex !== index) })}><Trash2 aria-hidden="true" focusable="false" size={15} />Remove</Button>
                </div>
              </div>
            ))}
          </div>

          <div className="lp-admin-actions">
            <Button loading={saving} variant="primary" type="button" disabled={saving} onClick={() => void save()}>{saving ? <Loader2 aria-hidden="true" focusable="false" className="lp-spin" size="var(--icon-small)" /> : <Save aria-hidden="true" focusable="false" size="var(--icon-small)" />}{selected ? "Save changes" : "Create package"}</Button>
            <Button variant="secondary" type="button" disabled={saving} onClick={() => { setSelected(null); setDraft(blankDraft()); setFormOpen(false); }}>Cancel</Button>
          </div>

          <div className="lp-admin-section">
            <div className="lp-admin-section-head"><Heading level={2} size="md">CSV import</Heading><Button size="sm" variant="secondary" type="button" onClick={() => void downloadTemplate()}><Download aria-hidden="true" focusable="false" size={15} />Template</Button></div>
            <Text as="label" size="sm" weight="medium" className="lp-admin-upload"><Upload aria-hidden="true" focusable="false" size="var(--icon-small)" />Upload CSV<input type="file" accept=".csv,text/csv" onChange={(event) => void previewCsv(event.target.files?.[0])} /></Text>
            {csvPreview && (
              <div className="lp-admin-preview">
                <Text as="b" size="md" weight="semibold">{csvPreview.summary.valid} valid · {csvPreview.summary.invalid} invalid</Text>
                {csvPreview.rows.slice(0, 12).map((row) => <Text as="p" size="md" key={row.rowNumber}>Row {row.rowNumber}: {row.title || row.slug || "Untitled"} {row.errors.length ? `- ${row.errors.join("; ")}` : "- ready"}</Text>)}
                <Button variant="primary" type="button" disabled={!canImport} onClick={() => void importCsv()}>Import valid CSV</Button>
              </div>
            )}
            {importResult && <div   className="lp-admin-preview"><Text as="b" size="md" weight="semibold">{importResult.successCount} created · {importResult.failedCount} failed</Text>{importResult.results.filter((row) => row.errors.length).map((row) => <Text as="p" size="md" key={row.rowNumber}>Row {row.rowNumber}: {row.errors.join("; ")}</Text>)}</div>}
          </div>
        </main> : (
          <main className="lp-admin-editor">
            <div className="lp-admin-empty">
              <Heading level={1} size="lg">Packages</Heading>
              <Text as="p" size="md">Select a package to edit, or add a new package.</Text>
            </div>
          </main>
        )}
      </div>
    </section>
  ));
}
