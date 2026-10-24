import { Text, SearchField, Button, Stack } from "@/design-system";

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
    <Stack>
      <div>
        <CustomPackButton
          quotaReached={false}
          variant="primary"
          onClick={onCreateCustom}
        >
          <Plus aria-hidden="true" focusable="false" size="var(--icon-small)" />
          Create a custom pack
        </CustomPackButton>
      </div>

      <SearchField
        appearance="filter"
        className="lp-pack-search"
        value={query}
        onChange={(event) =>
          onQueryChange(event.target.value.slice(0, MAX_PACKAGE_QUERY_LENGTH))
        }
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

      {hasQuery && suggestions.length ? (
        <div className="lp-pack-suggestions">
          {suggestions.map((pack) => (
            <button
              type="button"
              key={pack.slug}
              onClick={() => onOpen(pack.slug)}
            >
              <Search aria-hidden="true" focusable="false" size={13} />
              <span>{pack.title}</span>
              <strong>match</strong>
            </button>
          ))}
        </div>
      ) : null}

      {searchStatus === "loading" && hasQuery ? (
        <Text as="div" size="md" className="lp-pack-search-state">
          <Loader2
            aria-hidden="true"
            focusable="false"
            size={14}
            className="lp-spin"
          />
          Searching packages...
        </Text>
      ) : null}

      {generationStatus === "loading" ? (
        <Text as="div" size="md" className="lp-pack-generation-state">
          <Loader2
            aria-hidden="true"
            focusable="false"
            size={15}
            className="lp-spin"
          />
          {streamPreview
            ? `Verifying ${streamPreview}...`
            : "Building your package..."}
        </Text>
      ) : null}

      {generationStatus === "succeeded" ? (
        <Text as="div" size="md" className="lp-pack-generation-state">
          <Sparkles aria-hidden="true" focusable="false" size={15} />
          Package created and saved.
        </Text>
      ) : null}

      {generationStatus === "failed" && searchError ? (
        <div className="lp-pack-generation-state error">
          {searchError}
          <Button
            size="sm"
            variant="tertiary"
            type="button"
            onClick={onGenerate}
          >
            <RefreshCw aria-hidden="true" focusable="false" size={13} /> Retry
          </Button>
        </div>
      ) : null}
    </Stack>
  );
}
