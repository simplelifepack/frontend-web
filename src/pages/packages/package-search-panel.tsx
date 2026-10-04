import CustomPackButton from "@/components/CustomPackButton";
import type { DerivedPackSummary } from "@/readiness/selectors";
import { Loader2, Plus, RefreshCw, Search, Sparkles } from "lucide-react";

type PackageSearchPanelProps = {
  generationStatus: "idle" | "loading" | "succeeded" | "failed";
  query: string;
  searchError: string | null;
  searchStatus: "idle" | "loading" | "succeeded" | "failed";
  streamPreview: string;
  suggestions: DerivedPackSummary[];
  onCreateCustom: () => void;
  onGenerate: () => void;
  onOpen: (slug: string) => void;
  onQueryChange: (query: string) => void;
};

const MAX_PACKAGE_QUERY_LENGTH = 160;

export default function PackageSearchPanel({
  generationStatus,
  query,
  searchError,
  searchStatus,
  streamPreview,
  suggestions,
  onCreateCustom,
  onGenerate,
  onOpen,
  onQueryChange,
}: PackageSearchPanelProps) {
  const hasQuery = Boolean(query.trim());
  return (
    <>
      <CustomPackButton
        quotaReached={false}
        className="lp-pack-create-top"
        onClick={onCreateCustom}
      >
        <Plus size={16} />
        Create a custom pack
      </CustomPackButton>

      <label className="lp-pack-search">
        <Search size={17} />
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value.slice(0, MAX_PACKAGE_QUERY_LENGTH))}
          onKeyDown={(event) => {
            if (event.key !== "Enter") return;
            event.preventDefault();
            if (suggestions[0]) onOpen(suggestions[0].slug);
            else onGenerate();
          }}
          placeholder="Search packages or describe what you need"
          aria-label="Search packages"
          maxLength={MAX_PACKAGE_QUERY_LENGTH}
        />
      </label>

      {hasQuery && suggestions.length ? (
        <div className="lp-pack-suggestions">
          {suggestions.map((pack) => (
            <button type="button" key={pack.slug} onClick={() => onOpen(pack.slug)}>
              <Search size={13} />
              <span>{pack.title}</span>
              <strong>match</strong>
            </button>
          ))}
        </div>
      ) : null}

      {searchStatus === "loading" && hasQuery ? (
        <div className="lp-pack-search-state"><Loader2 size={14} className="lp-spin" />Searching packages...</div>
      ) : null}

      {generationStatus === "loading" ? (
        <div className="lp-pack-generation-state">
          <Loader2 size={15} className="lp-spin" />
          {streamPreview ? `Verifying ${streamPreview}...` : "Building your package..."}
        </div>
      ) : null}

      {generationStatus === "succeeded" ? (
        <div className="lp-pack-generation-state"><Sparkles size={15} />Package created and saved.</div>
      ) : null}

      {generationStatus === "failed" && searchError ? (
        <div className="lp-pack-generation-state error">
          {searchError}
          <button type="button" onClick={onGenerate}><RefreshCw size={13} /> Retry</button>
        </div>
      ) : null}
    </>
  );
}
