import AccountUsage from "@/components/AccountUsage";
import { refreshUsage } from "@/store/slices/usageSlice";
import { useEffect, useMemo, useState } from "react";

import SectionHead from "@/components/SectionHead";
import { T } from "@/constants/theme";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { makeSelectPackageReadiness, selectPackageCards } from "@/readiness/selectors";
import { assignRequirementDocument, clearRequirementDocument, createCustomPack as createCustomPackThunk, fetchPackageDetail, fetchPackages, setActivePackageQuery, setPackageGenerationStatus } from "@/store/slices/packagesSlice";
import PackageDetailDrawer from "./package-detail-drawer";
import { matchesPackageCategory, PackageCategoryPills, PackageGrid } from "./package-list-ui";
import PackageSearchPanel from "./package-search-panel";
import CustomPackModal from "./custom-pack-modal";

const PACKS_PER_PAGE = 20;
const SEARCH_DEBOUNCE_MS = 350;

export default function PackagesPage() {
  const dispatch = useAppDispatch();
  const usage = useAppSelector(state => state.usage?.data);
  const quotaReached = usage?.accountTier === "free" && usage.aiUsage.remaining === 0;
  useEffect(() => { void dispatch(refreshUsage()); }, [dispatch]);
  const readinessSelector = useMemo(makeSelectPackageReadiness, []);
  const {
    status,
    error,
    loaded,
    pagination,
    categories,
    searchCanGenerate,
    searchStatus,
    generationStatus,
  } = useAppSelector((state) => state.packages);
  const documentLabels = useAppSelector((state) => state.documents.items.map((document) =>
    document.normalizedType || document.documentType).filter(Boolean));
  const documents = useAppSelector((state) => state.documents.items);
  const packs = useAppSelector(selectPackageCards);
  const cataloguePacks = useAppSelector((state) => state.packages.catalogueItems);
  const categoryPills = categories;
  const [selectedSlug, setSelectedSlug] = useState<string>("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchError, setSearchError] = useState<string | null>(null);
  const [category, setCategory] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [customInitialDescription, setCustomInitialDescription] = useState("");
  const [customModalOpen, setCustomModalOpen] = useState(false);

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

  useEffect(() => {
    void dispatch(fetchPackages({ background: true, category: "My packs", limit: PACKS_PER_PAGE, page: 1, sort: "newest" }));
  }, [dispatch]);

  const filteredPacks = useMemo(() => packs.filter((pack) => matchesPackageCategory(pack, category)), [category, packs]);
  const displayedPacks = filteredPacks;
  const suggestions = useMemo(() => displayedPacks.slice(0, 4), [displayedPacks]);
  const hasSearchQuery = Boolean(debouncedQuery.trim());
  const activeQuerySettled = loaded && Boolean(pagination) && searchStatus !== "loading" && status !== "loading";
  const hasEmptySearch = hasSearchQuery && !displayedPacks.length && activeQuerySettled;
  const visiblePackageTotal = pagination?.total ?? packs.length;

  const totalPages = Math.max(
    1,
    pagination ? Math.ceil(pagination.total / pagination.limit) : 1,
  );
  const shouldShowPagination = Boolean(pagination) || currentPage > 1;
  const isPageLoading = status === "loading" || searchStatus === "loading" || !pagination;
  const paginatedPacks = displayedPacks;
  const supportedDocumentTypes = useMemo(() => {
    const packageTypes = packs.flatMap((pack) => pack.requirements.flatMap((requirement) => [requirement.title, ...requirement.acceptedDocumentTypes]));
    return [...new Set([...packageTypes, ...documentLabels].filter(Boolean))];
  }, [documentLabels, packs]);

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

  const openPackage = (slug: string) => {
    setSelectedSlug(slug);
    setDetailOpen(true);
    void dispatch(fetchPackageDetail(slug));
  };

  const openCustomPackModal = (description = "") => {
    setCustomInitialDescription(description);
    setCustomModalOpen(true);
    setSearchError(null);
  };

  return (
    <div className="lp-route lp-packages-route">
      <SectionHead
        title="Packages"
        sub={`${visiblePackageTotal} real-world situations. Readiness matches your archive against each one and shows how ready you already are.`}
        action={null}
      />

      {usage && <AccountUsage usage={usage} only="ai" />}
      {error ? (
        <div style={{ color: T.coral, fontSize: 13, marginBottom: 12 }}>
          {error}
        </div>
      ) : null}

      <PackageSearchPanel
        generationStatus={generationStatus}
        query={query}
        searchError={searchError}
        searchStatus={searchStatus}
        streamPreview=""
        suggestions={suggestions}
        onCreateCustom={() => openCustomPackModal()}
        onGenerate={() => openCustomPackModal(query.trim())}
        onOpen={openPackage}
        onQueryChange={(nextQuery) => {
          if (!query.trim() && nextQuery.trim()) setCategory("All");
          setQuery(nextQuery);
          setSearchError(null);
          if (generationStatus !== "loading") dispatch(setPackageGenerationStatus("idle"));
        }}
      />

      <PackageCategoryPills active={category} categories={categoryPills} packs={cataloguePacks.length ? cataloguePacks : packs} onSelect={(item) => { setCategory(item); setCurrentPage(1); }} />

      {!hasEmptySearch ? (
        <div className="lp-pack-section-label">
          {hasSearchQuery ? "Search results" : "All packages"}
        </div>
      ) : null}
      <PackageGrid
        activeQuerySettled={activeQuerySettled}
        debouncedQuery={debouncedQuery}
        generationStatus={generationStatus}
        hasSearchQuery={hasSearchQuery}
        packs={paginatedPacks}
        quotaReached={quotaReached}
        searchCanGenerate={searchCanGenerate}
        searchStatus={searchStatus}
        status={status}
        onGenerate={() => openCustomPackModal(debouncedQuery.trim())}
        onOpen={openPackage}
      />

      {shouldShowPagination ? (
        <nav className="lp-pack-pages" aria-label="Package pagination" aria-busy={isPageLoading}>
          <button type="button" disabled={isPageLoading || currentPage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}>Previous</button>
          <span aria-live="polite">{pagination ? `Page ${currentPage} of ${totalPages} · ${pagination.total} packages` : `Loading page ${currentPage}…`}</span>
          <button type="button" disabled={isPageLoading || !pagination?.hasNextPage} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}>Next</button>
        </nav>
      ) : null}

      <PackageDetailDrawer
        completion={completion}
        documents={documents}
        isComplete={isComplete}
        open={detailOpen && Boolean(selectedDetail || selectedSummary)}
        pack={selectedDetail}
        readiness={readiness}
        readyCount={readyCount}
        selectedTitle={selectedDetail?.title ?? selectedSummary?.title ?? "Package"}
        totalCount={totalCount}
        onAssignRequirement={(requirement, document, assignmentSource) =>
          selectedDetail
            ? dispatch(assignRequirementDocument({ slug: selectedDetail.slug, requirementId: requirement.id, documentId: document.id, assignmentSource })).unwrap().then(() => undefined)
            : Promise.resolve()
        }
        onClearAssignment={(requirement) =>
          selectedDetail
            ? dispatch(clearRequirementDocument({ slug: selectedDetail.slug, requirementId: requirement.id })).unwrap().then(() => undefined)
            : Promise.resolve()
        }
        onClose={() => setDetailOpen(false)}
      />
      {customModalOpen ? (
        <CustomPackModal
          documentLabels={documentLabels}
          initialDescription={customInitialDescription}
          supportedDocumentTypes={supportedDocumentTypes}
          onClose={() => setCustomModalOpen(false)}
          onSave={async (payload) => {
            const pack = await dispatch(createCustomPackThunk(payload)).unwrap();
            setCustomModalOpen(false);
            setCategory("My packs");
            setCurrentPage(1);
            setQuery("");
            setDebouncedQuery("");
            setSelectedSlug(pack.slug);
            setDetailOpen(true);
            void dispatch(fetchPackages({ background: true, category: "My packs", forceRefresh: true, limit: PACKS_PER_PAGE, page: 1, sort: "newest" }));
            return pack;
          }}
        />
      ) : null}
    </div>
  );
}
