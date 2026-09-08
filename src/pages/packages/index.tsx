import CustomPackButton from "@/components/CustomPackButton";
import AccountUsage from "@/components/AccountUsage";
import { refreshUsage } from "@/store/slices/usageSlice";
import { ChevronRight, Loader2, Plane, Plus, RefreshCw, Search, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import Card from "@/components/Card";
import Ring from "@/components/Ring";
import SectionHead from "@/components/SectionHead";
import { btnGold, T } from "@/constants/theme";
import { api } from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { makeSelectPackageReadiness, selectCataloguePackageCards, selectPackageCards } from "@/readiness/selectors";
import { fetchPackages, setActivePackageQuery, setPackageGenerationStatus, upsertPackage } from "@/store/slices/packagesSlice";
import PackDetail from "./pack-detail";

const PACKS_PER_PAGE = 20;
const PACKAGE_CATEGORIES = [
  "All",
  "Travel & Immigration",
  "Identity & Civic",
  "Money & Tax",
  "Jobs & Employment",
  "Education",
  "Health",
  "Home & Property",
  "Family & Life",
] as const;
const SEARCH_DEBOUNCE_MS = 350;
const MAX_PACKAGE_QUERY_LENGTH = 160;
const PACKAGE_GENERATION_WAIT_MS = 40_000;

function matchesCategory(packCategory: string, selectedCategory: string) {
  if (selectedCategory === "All") return true;
  const category = packCategory.toLowerCase();
  const terms: Record<string, string[]> = {
    "Travel & Immigration": ["travel", "visa", "immigration"],
    "Identity & Civic": ["identity", "civic", "government"],
    "Money & Tax": ["banking", "finance", "money", "tax", "loan"],
    "Jobs & Employment": ["job", "employment", "business"],
    Education: ["education", "school", "student"],
    Health: ["health", "medical", "insurance"],
    "Home & Property": ["home", "property", "housing"],
    "Family & Life": ["family", "life"],
  };
  return (terms[selectedCategory] ?? []).some((term) => category.includes(term));
}

function openPackUpload() {
  window.dispatchEvent(
    new CustomEvent("readiness:open-upload", { detail: { stayOnSave: true } }),
  );
}

function readinessText(pack: {
  requiredDocumentTypes: string[];
  uploadedDocumentTypes: string[];
}) {
  const total = pack.requiredDocumentTypes.length;
  const ready = pack.uploadedDocumentTypes.length;
  const missing = Math.max(0, total - ready);
  return `${missing} missing · ${ready} of ${total} ready`;
}

export default function PackagesPage() {
  const dispatch = useAppDispatch();
  const usage = useAppSelector(state => state.usage?.data);
  const quotaReached = usage?.accountTier === "free" && usage.aiUsage.remaining === 0;
  const streamController = useRef<AbortController | null>(null);
  const [streamPreview, setStreamPreview] = useState("");
  useEffect(() => { void dispatch(refreshUsage()); return () => streamController.current?.abort(); }, [dispatch]);
  const readinessSelector = useMemo(makeSelectPackageReadiness, []);
  const {
    status,
    error,
    pagination,
    searchCanGenerate,
    searchStatus,
    generationStatus,
  } = useAppSelector((state) => state.packages);
  const documentLabels = useAppSelector((state) => state.documents.items.map((document) =>
    document.normalizedType || document.documentType).filter(Boolean));
  const packs = useAppSelector(selectPackageCards);
  const cachedCataloguePacks = useAppSelector(selectCataloguePackageCards);
  const [selectedSlug, setSelectedSlug] = useState<string>("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchError, setSearchError] = useState<string | null>(null);
  const [category, setCategory] = useState<(typeof PACKAGE_CATEGORIES)[number]>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const activeSearchRef = useRef(0);

  useEffect(() => {
    if (!selectedSlug && packs.length) {
      setSelectedSlug(packs[0].slug);
    }
  }, [packs, selectedSlug]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query);
      setCurrentPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const request = {
      category: category === "All" ? undefined : category,
      limit: PACKS_PER_PAGE,
      page: currentPage,
      search: debouncedQuery.trim() || undefined,
      sort: debouncedQuery.trim() ? "relevance" as const : "category" as const,
    };
    dispatch(setActivePackageQuery(request));
    void dispatch(fetchPackages(request));
  }, [category, currentPage, debouncedQuery, dispatch]);

  const filteredPacks = useMemo(() => packs.filter((pack) => matchesCategory(pack.category, category)), [category, packs]);
  const displayedPacks = filteredPacks;
  const suggestions = useMemo(() => displayedPacks.slice(0, 4), [displayedPacks]);
  const hasSearchQuery = Boolean(debouncedQuery.trim());
  const hasEmptySearch = hasSearchQuery && !displayedPacks.length && searchStatus !== "loading" && status !== "loading";

  const totalPages = Math.max(
    1,
    pagination ? Math.ceil(pagination.total / pagination.limit) : 1,
  );
  const shouldShowPagination = Boolean(pagination) || currentPage > 1;
  const isPageLoading = status === "loading" || searchStatus === "loading" || !pagination;
  const paginatedPacks = displayedPacks;

  useEffect(() => {
    if (pagination) setCurrentPage((page) => Math.min(page, totalPages));
  }, [pagination, totalPages]);

  useEffect(() => {
    if (!detailOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDetailOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [detailOpen]);

  const selectedDetail = useAppSelector((state) => selectedSlug ? state.packages.detailsBySlug[selectedSlug] : undefined);
  const selectedSummary = packs.find((pack) => pack.slug === selectedSlug);
  const localReadiness = useAppSelector((state) => readinessSelector(state, selectedSlug));
  const readiness = localReadiness;
  const completion = localReadiness?.percentage ?? 0;
  const readyCount = localReadiness?.satisfiedRequired ?? 0;
  const totalCount = localReadiness?.totalRequired ?? 0;
  const isComplete = totalCount > 0 && readyCount === totalCount;

  const handleSearchOrGenerate = async () => {
    const trimmed = query.trim();
    if (!trimmed || generationStatus === "loading" || quotaReached) return;
    const requestId = activeSearchRef.current + 1;
    activeSearchRef.current = requestId;
    dispatch(setPackageGenerationStatus("loading"));
    setSearchError(null);
    streamController.current?.abort();
    const controller = new AbortController();
    streamController.current = controller;
    setStreamPreview("");
    const waitTimer = window.setTimeout(() => {
      if (activeSearchRef.current !== requestId) return;
      dispatch(setPackageGenerationStatus("failed"));
      controller.abort();
      setSearchError("Requirements verification timed out. Please retry.");
    }, PACKAGE_GENERATION_WAIT_MS);
    try {
      let partial = "";
      const result = await api.packages.streamSearchOrGenerate(trimmed, [...new Set(documentLabels)], delta => {
        partial += delta;
        const title = partial.match(/"packageName"\s*:\s*"([^"\\]*)/);
        if (title) setStreamPreview(title[1]);
      }, controller.signal);
      window.clearTimeout(waitTimer);
      if (activeSearchRef.current !== requestId) return;
      dispatch(upsertPackage(result.package));
      dispatch(setPackageGenerationStatus(result.source === "official_source" ? "succeeded" : "idle"));
      setSelectedSlug(result.package.slug);
      setDetailOpen(true);
    } catch (apiError) {
      window.clearTimeout(waitTimer);
      if (controller.signal.aborted) return;
      if (activeSearchRef.current !== requestId) return;
      dispatch(setPackageGenerationStatus("failed"));
      setSearchError(apiError instanceof Error ? apiError.message : "Unable to build this package.");
    } finally { void dispatch(refreshUsage()); }
  };

  const openPackage = (slug: string) => {
    setSelectedSlug(slug);
    setDetailOpen(true);
  };

  return (
    <div className="lp-route lp-packages-route">
      <SectionHead
        title="Packages"
        sub={`${packs.length} real-world situations. Readiness matches your archive against each one and shows how ready you already are.`}
        action={null}
      />

      {usage && <AccountUsage usage={usage} only="ai" />}
      {error ? (
        <div style={{ color: T.coral, fontSize: 13, marginBottom: 12 }}>
          {error}
        </div>
      ) : null}

      <CustomPackButton quotaReached={quotaReached} style={{ ...btnGold, marginBottom: 16 }} onClick={openPackUpload}>
        <Plus size={16} /> Create a custom pack
      </CustomPackButton>

      <label className="lp-pack-search">
        <Search size={17} color={T.muted} />
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value.slice(0, MAX_PACKAGE_QUERY_LENGTH));
            setSearchError(null);
            if (generationStatus !== "loading") dispatch(setPackageGenerationStatus("idle"));
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              if (displayedPacks[0]) {
                openPackage(displayedPacks[0].slug);
              } else {
                void handleSearchOrGenerate();
              }
            }
          }}
          placeholder="Schengen visa, home loan, hospital admission, school admission, passport renewal"
          aria-label="Search packages"
          maxLength={MAX_PACKAGE_QUERY_LENGTH}
        />
      </label>

      {hasSearchQuery && suggestions.length ? (
        <div className="lp-pack-suggestions">
          {suggestions.map((pack) => (
            <button
              type="button"
              key={pack.slug}
              onClick={() => openPackage(pack.slug)}
            >
              <Search size={13} />
              <span>{pack.title}</span>
              <strong>match</strong>
            </button>
          ))}
        </div>
      ) : null}

      {searchStatus === "loading" && hasSearchQuery ? (
        <div className="lp-pack-search-state">
          <Loader2 size={14} className="lp-spin" />
          Searching packages...
        </div>
      ) : null}

      {generationStatus === "loading" ? (
        <div className="lp-pack-generation-state">
          <Loader2 size={15} className="lp-spin" />
          {streamPreview ? `Verifying ${streamPreview}…` : "Building your package..."}
        </div>
      ) : null}

      {generationStatus === "succeeded" ? (
        <div className="lp-pack-generation-state">
          <Sparkles size={15} />
          Package created and saved.
        </div>
      ) : null}

      {generationStatus === "failed" && searchError ? (
        <div className="lp-pack-generation-state error">
          {searchError}
          <button type="button" onClick={() => void handleSearchOrGenerate()}>
            <RefreshCw size={13} /> Retry
          </button>
        </div>
      ) : null}

      <div className="lp-pack-cats">
        {PACKAGE_CATEGORIES.map((item) => (
          <button
            type="button"
            className={category === item ? "active" : ""}
            key={item}
            onClick={() => { setCategory(item); setCurrentPage(1); }}
          >
            {item}
          </button>
        ))}
        <button type="button" className="lp-pack-my-packs" aria-disabled="true">
          My packs (0)
        </button>
      </div>

      {!hasEmptySearch ? (
        <div className="lp-pack-section-label">
          {hasSearchQuery ? "Search results" : "All packages"}
        </div>
      ) : null}
      <div className="lp-pack-grid">
        {(status === "loading" || searchStatus === "loading") && !paginatedPacks.length ? (
          Array.from({ length: 6 }, (_, index) => (
            <div className="lp-pack-result lp-pack-result-skeleton" key={index}>
              <span />
              <span />
              <span />
            </div>
          ))
        ) : null}
        {paginatedPacks.map((pack) => (
          <button
            type="button"
            className="lp-pack-result"
            key={pack.slug}
            onClick={() => openPackage(pack.slug)}
          >
            <Ring score={Math.round(pack.completion)} size={54} />
            <span className="lp-pack-result-copy">
              <strong><Plane size={15} /> {pack.title}</strong>
              <span>{readinessText(pack)}</span>
            </span>
            <ChevronRight size={18} color={T.muted} />
          </button>
        ))}
        {!filteredPacks.length && searchStatus !== "loading" && status !== "loading" ? (
          <Card style={{ gridColumn: "1 / -1", textAlign: "center", padding: hasSearchQuery ? "56px 34px 52px" : 34 }}>
            <strong style={{ color: T.white, display: "block", fontSize: hasSearchQuery ? 16 : 14 }}>
              {hasSearchQuery ? `No pack covers "${debouncedQuery.trim()}" yet` : "No matching packages"}
            </strong>
            <div style={{ color: T.muted, fontSize: hasSearchQuery ? 15 : 13, marginTop: 8 }}>
              {hasSearchQuery ? "Describe it and Readiness drafts the checklist for you." : "Try another search or category."}
            </div>
            {hasSearchQuery && searchCanGenerate ? (
              <CustomPackButton
                quotaReached={quotaReached}
                className="lp-pack-create-ai"
                disabled={generationStatus === "loading"}
                onClick={() => void handleSearchOrGenerate()}
              >
                {generationStatus === "loading" ? <Loader2 size={17} className="lp-spin" /> : <Plus size={17} />}
                {generationStatus === "loading" ? "Drafting pack..." : "Create a custom pack"}
              </CustomPackButton>
            ) : null}
          </Card>
        ) : null}
      </div>

      {hasSearchQuery && filteredPacks.length && cachedCataloguePacks.length ? (
        <>
          <div className="lp-pack-section-label all">All packages</div>
          <div className="lp-pack-grid">
            {cachedCataloguePacks.map((pack) => (
              <button
                type="button"
                className="lp-pack-result"
                key={pack.slug}
                onClick={() => openPackage(pack.slug)}
              >
                <Ring score={Math.round(pack.completion)} size={54} />
                <span className="lp-pack-result-copy">
                  <strong><Plane size={15} /> {pack.title}</strong>
                  <span>{readinessText(pack)}</span>
                </span>
                <ChevronRight size={18} color={T.muted} />
              </button>
            ))}
          </div>
        </>
      ) : null}

      {shouldShowPagination ? (
        <nav className="lp-pack-pages" aria-label="Package pagination" aria-busy={isPageLoading}>
          <button type="button" disabled={isPageLoading || currentPage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}>Previous</button>
          <span aria-live="polite">{pagination ? `Page ${currentPage} of ${totalPages} · ${pagination.total} packages` : `Loading page ${currentPage}…`}</span>
          <button type="button" disabled={isPageLoading || !pagination?.hasNextPage} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}>Next</button>
        </nav>
      ) : null}

      {detailOpen && (selectedDetail || selectedSummary) ? (
        <div className="lp-pack-drawer-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setDetailOpen(false);
        }}>
          <aside
            className="lp-pack-drawer"
            role="dialog"
            aria-modal="true"
            aria-label={`${selectedDetail?.title ?? selectedSummary?.title ?? "Package"} package details`}
          >
            {selectedDetail ? (
              <PackDetail
                completion={completion}
                isComplete={isComplete}
                pack={selectedDetail}
                readiness={readiness}
                readyCount={readyCount}
                totalCount={totalCount}
                onClose={() => setDetailOpen(false)}
                onUpload={openPackUpload}
              />
            ) : (
              <div className="lp-pack-drawer-message">Loading package details...</div>
            )}
          </aside>
        </div>
      ) : null}
    </div>
  );
}
