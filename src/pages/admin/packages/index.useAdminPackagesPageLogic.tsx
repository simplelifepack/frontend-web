import { useEffect, useMemo, useState } from "react";
import { api, type AdminCsvImportResult, type AdminCsvPreview, type AdminPackage, type AdminPackagePayload, type AdminPackageRequirement, type AdminPackageSource } from "@/lib/api";
import { clearPackageCatalogueCache } from "@/packages/packageCatalogueCache";
import { useAppSelector } from "@/store/hooks";
import { blankDraft, ADMIN_EMAIL, draftFromPackage } from "./index.ADMINEMAIL";


export function useAdminPackagesPageLogic() {

  const user = useAppSelector((state) => state.auth.user);
  const [items, setItems] = useState<AdminPackage[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, hasNextPage: false });
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState<AdminPackage | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [draft, setDraft] = useState<AdminPackagePayload>(blankDraft);
  const [csvPreview, setCsvPreview] = useState<AdminCsvPreview | null>(null);
  const [importResult, setImportResult] = useState<AdminCsvImportResult | null>(null);
  const [csvText, setCsvText] = useState("");

  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL;
  const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.limit));
  const canImport = Boolean(csvPreview?.rows.length) && (csvPreview?.summary.invalid ?? 0) === 0;

  const load = async (page = pagination.page, overrides: { category?: string; search?: string } = {}) => {
    setLoading(true);
    setError("");
    try {
      const response = await api.adminPackages.list({
        category: (overrides.category ?? category) || undefined,
        limit: pagination.limit,
        page,
        search: (overrides.search ?? search) || undefined,
      });
      setItems(response.items);
      setCategories(response.categories);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load packages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) void load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, category]);

  const selectedSlug = selected?.slug;
  useEffect(() => {
    if (selected) {
      setDraft(draftFromPackage(selected));
      setFormOpen(true);
    }
  }, [selected]);

  const payload = useMemo(() => ({
    ...draft,
    aliases: draft.aliases.filter(Boolean),
    keywords: draft.keywords.filter(Boolean),
    lastCheckedAt: draft.lastCheckedAt || null,
    lastVerifiedAt: draft.lastVerifiedAt || null,
    requirements: draft.requirements
      .filter((requirement) => requirement.title.trim())
      .map((requirement, index) => ({ ...requirement, sortOrder: requirement.sortOrder ?? index })),
    sourceName: draft.sourceName || null,
    sourceTitle: draft.sourceTitle || null,
    sourceType: draft.sourceType || null,
    sourceUrl: draft.sourceUrl || null,
    sources: draft.sources.filter((source) => source.title && source.url),
    subtitle: draft.subtitle || null,
    verificationStatus: draft.verificationStatus || null,
  }), [draft]);

  const save = async () => {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      if (!payload.title.trim() || !payload.category.trim() || !payload.description.trim()) {
        throw new Error("Package name, category, and description are required.");
      }
      if (!payload.requirements.some((requirement) => requirement.title.trim())) {
        throw new Error("Add at least one requirement title.");
      }
      const response = selected
        ? await api.adminPackages.update(selected.slug, payload)
        : await api.adminPackages.create(payload);
      await clearPackageCatalogueCache().catch(() => undefined);
      setMessage(selected ? "Package updated." : "Package created.");
      setSelected(null);
      setDraft(blankDraft());
      setFormOpen(false);
      if (!selected) {
        setSearch("");
        setCategory("");
        await load(1, { category: "", search: "" });
      } else {
        await load(pagination.page);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save package.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (pack: AdminPackage) => {
    if (!window.confirm(`Delete ${pack.title}? Existing user documents and hidden requirement assignments will be preserved.`)) return;
    setError("");
    setMessage("");
    try {
      await api.adminPackages.delete(pack.slug);
      await clearPackageCatalogueCache().catch(() => undefined);
      setMessage("Package deleted.");
      if (selected?.slug === pack.slug) { setSelected(null); setDraft(blankDraft()); }
      await load(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete package.");
    }
  };

  const updateRequirement = (index: number, patch: Partial<AdminPackageRequirement>) => {
    setDraft((current) => ({
      ...current,
      requirements: current.requirements.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item),
    }));
  };

  const updateSource = (index: number, patch: Partial<AdminPackageSource>) => {
    setDraft((current) => ({
      ...current,
      sources: current.sources.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item),
    }));
  };

  const previewCsv = async (file?: File) => {
    if (!file) return;
    const text = await file.text();
    setCsvText(text);
    setImportResult(null);
    setCsvPreview(await api.adminPackages.previewCsv(text));
  };

  const importCsv = async () => {
    const result = await api.adminPackages.importCsv(csvText);
    await clearPackageCatalogueCache().catch(() => undefined);
    setImportResult(result);
    await load(1);
  };

  const downloadTemplate = async () => {
    const { blob, fileName } = await api.adminPackages.downloadTemplate();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName === "readiness.zip" ? "readiness-packages-template.csv" : fileName;
    link.click();
    URL.revokeObjectURL(url);
  };
return { user, items, setItems, categories, setCategories, pagination, setPagination, search, setSearch, category, setCategory, loading, setLoading, saving, setSaving, error, setError, message, setMessage, selected, setSelected, formOpen, setFormOpen, draft, setDraft, csvPreview, setCsvPreview, importResult, setImportResult, csvText, setCsvText, isAdmin, totalPages, canImport, load, selectedSlug, payload, save, remove, updateRequirement, updateSource, previewCsv, importCsv, downloadTemplate };
}
