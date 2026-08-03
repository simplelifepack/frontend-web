import { ChevronRight, Plane, Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import Card from "@/components/Card";
import Ring from "@/components/Ring";
import SectionHead from "@/components/SectionHead";
import { btnGold, T } from "@/constants/theme";
import { api } from "@/lib/api";
import { useAppSelector } from "@/store/hooks";
import { makeSelectPackageReadiness, selectPackageCards } from "@/readiness/selectors";
import PackDetail from "./pack-detail";

const PACKS_PER_PAGE = 10;
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
    new CustomEvent("lifepack:open-upload", { detail: { stayOnSave: true } }),
  );
}

function downloadBlobFile(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

export default function PackagesPage() {
  const readinessSelector = useMemo(makeSelectPackageReadiness, []);
  const {
    status,
    error,
  } = useAppSelector((state) => state.packages);
  const packs = useAppSelector(selectPackageCards);
  const [selectedSlug, setSelectedSlug] = useState<string>("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof PACKAGE_CATEGORIES)[number]>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [downloadStatus, setDownloadStatus] = useState<
    "idle" | "loading" | "failed"
  >("idle");

  useEffect(() => {
    if (!selectedSlug && packs.length) {
      setSelectedSlug(packs[0].slug);
    }
  }, [packs, selectedSlug]);

  const filteredPacks = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return packs.filter((pack) => {
      const matchesQuery =
        !needle ||
        [pack.title, pack.category, pack.description].some((value) =>
          value.toLowerCase().includes(needle),
        );
      return matchesQuery && matchesCategory(pack.category, category);
    });
  }, [category, packs, query]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPacks.length / PACKS_PER_PAGE),
  );
  const shouldShowPagination = filteredPacks.length > PACKS_PER_PAGE;
  const paginatedPacks = useMemo(() => {
    const start = (currentPage - 1) * PACKS_PER_PAGE;
    return filteredPacks.slice(start, start + PACKS_PER_PAGE);
  }, [currentPage, filteredPacks]);

  useEffect(() => {
    setCurrentPage(1);
  }, [category, query]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

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

  const selectedPack =
    packs.find((pack) => pack.slug === selectedSlug) ??
    filteredPacks[0] ??
    packs[0];
  const localReadiness = useAppSelector((state) => readinessSelector(state, selectedSlug));
  const readiness = localReadiness?.result ?? null;
  const readinessStatus = status === "loading" ? "loading" : error ? "failed" : "idle";
  const completion = localReadiness?.percentage ?? selectedPack?.completion ?? 0;
  const readyCount = localReadiness?.requiredReadyCount ?? 0;
  const totalCount = localReadiness?.requiredTotalCount ?? 0;
  const isComplete = totalCount > 0 && readyCount === totalCount;

  const handleDownload = async () => {
    if (!selectedPack) return;
    setDownloadStatus("loading");
    try {
      const { blob, fileName } = await api.packages.download(selectedPack.slug);
      downloadBlobFile(blob, fileName);
      setDownloadStatus("idle");
    } catch {
      setDownloadStatus("failed");
    }
  };

  return (
    <div className="lp-route lp-packages-route">
      <SectionHead
        title="Packages"
        sub={`${packs.length} real-world situations. LifePack matches your archive against each one and shows how ready you already are.`}
        action={null}
      />

      {error ? (
        <div style={{ color: T.coral, fontSize: 13, marginBottom: 12 }}>
          {error}
        </div>
      ) : null}

      <button type="button" style={{ ...btnGold, marginBottom: 16 }} onClick={openPackUpload}>
        <Plus size={16} /> Create a custom pack
      </button>

      <label className="lp-pack-search">
        <Search size={17} color={T.muted} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Schengen visa, home loan, hospital admission, school admission, passport renewal"
          aria-label="Search packages"
        />
      </label>

      <div className="lp-pack-cats">
        {PACKAGE_CATEGORIES.map((item) => (
          <button
            type="button"
            className={category === item ? "active" : ""}
            key={item}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="lp-pack-grid">
        {paginatedPacks.map((pack) => (
          <button
            type="button"
            className="lp-pack-result"
            key={pack.slug}
            onClick={() => {
              setSelectedSlug(pack.slug);
              setDetailOpen(true);
            }}
          >
            <Ring score={Math.round(pack.completion)} size={54} />
            <span className="lp-pack-result-copy">
              <strong><Plane size={15} /> {pack.title}</strong>
              <span>
                {Math.max(0, pack.requiredDocumentTypes.length - pack.uploadedDocumentTypes.length)} missing ·{" "}
                {pack.uploadedDocumentTypes.length} of {pack.requiredDocumentTypes.length} ready
              </span>
            </span>
            <ChevronRight size={18} color={T.muted} />
          </button>
        ))}
        {!filteredPacks.length && status !== "loading" ? (
          <Card style={{ gridColumn: "1 / -1", textAlign: "center", padding: 34 }}>
            <strong style={{ color: T.white }}>No matching packages</strong>
            <div style={{ color: T.muted, fontSize: 13, marginTop: 5 }}>Try another search or category.</div>
          </Card>
        ) : null}
      </div>

      {shouldShowPagination ? (
        <div className="lp-pack-pages">
          <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}>Previous</button>
          <span>Page {currentPage} of {totalPages}</span>
          <button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}>Next</button>
        </div>
      ) : null}

      {detailOpen && selectedPack ? (
        <div className="lp-pack-drawer-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setDetailOpen(false);
        }}>
          <aside
            className="lp-pack-drawer"
            role="dialog"
            aria-modal="true"
            aria-label={`${selectedPack.title} package details`}
          >
            <PackDetail
              completion={completion}
              downloadStatus={downloadStatus}
              isComplete={isComplete}
              pack={selectedPack}
              readiness={readiness}
              readinessStatus={readinessStatus}
              readyCount={readyCount}
              totalCount={totalCount}
              onClose={() => setDetailOpen(false)}
              onDownload={() => void handleDownload()}
              onUpload={openPackUpload}
            />
          </aside>
        </div>
      ) : null}
    </div>
  );
}
