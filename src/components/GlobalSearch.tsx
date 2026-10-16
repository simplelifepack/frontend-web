import { Text, SearchField, Button } from "@/design-system";

import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { T } from "@/constants/theme";
import { api, type GlobalSearchGroup, type GlobalSearchResult } from "@/lib/api";

export default function GlobalSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [groups, setGroups] = useState<GlobalSearchGroup[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "succeeded" | "failed">("idle");
  const [error, setError] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const requestRef = useRef(0);
  const visibleGroups = useMemo(
    () => groups.map((group) => ({ ...group, results: group.results.filter((result) => result.title.trim()) })).filter((group) => group.results.length),
    [groups],
  );
  const flatResults = useMemo(() => visibleGroups.flatMap((group) => group.results), [visibleGroups]);

  useEffect(() => {
    const trimmed = query.trim();
    setActiveIndex(0);
    if (!trimmed) {
      requestRef.current += 1;
      setGroups([]);
      setStatus("idle");
      setError("");
      return;
    }
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;
    const controller = new AbortController();
    const handle = window.setTimeout(() => {
      setStatus("loading");
      setError("");
      void api.search(trimmed, 5, controller.signal)
        .then((response) => {
          if (requestRef.current !== requestId) return;
          setGroups(response.groups);
          setStatus("succeeded");
        })
        .catch((caught) => {
          if (controller.signal.aborted || requestRef.current !== requestId) return;
          setGroups([]);
          setStatus("failed");
          setError(caught instanceof Error ? caught.message : "Search failed.");
        });
    }, 220);
    return () => {
      window.clearTimeout(handle);
      controller.abort();
    };
  }, [query]);

  const close = () => {
    setOpen(false);
    setActiveIndex(0);
  };
  const clear = () => {
    setQuery("");
    close();
  };
  const openResult = (result: GlobalSearchResult | undefined) => {
    if (!result) return;
    navigate(result.navigation.path);
    clear();
  };
  const moveActive = (direction: 1 | -1) => {
    if (!flatResults.length) return;
    setActiveIndex((current) => (current + direction + flatResults.length) % flatResults.length);
  };

  return (
    <div className="lp-global-search-wrap">
      <SearchField className="lp-global-search" value={query} onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }} onFocus={() => {
            if (query.trim()) setOpen(true);
          }} onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setOpen(true);
              moveActive(1);
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setOpen(true);
              moveActive(-1);
            } else if (event.key === "Enter") {
              event.preventDefault();
              openResult(flatResults[activeIndex] ?? flatResults[0]);
            } else if (event.key === "Escape") {
              event.preventDefault();
              close();
            }
          }} placeholder="Search..." aria-label="Search Readiness" aria-expanded={open} aria-controls="readiness-global-search-results" />
      {open && query.trim() ? (
        <GlobalSearchResults
          activeIndex={activeIndex}
          error={error}
          flatResults={flatResults}
          groups={visibleGroups}
          status={status}
          onOpen={openResult}
          onPointerActive={setActiveIndex}
        />
      ) : null}
    </div>
  );
}

function GlobalSearchResults(props: {
  activeIndex: number;
  error: string;
  flatResults: GlobalSearchResult[];
  groups: GlobalSearchGroup[];
  status: "idle" | "loading" | "succeeded" | "failed";
  onOpen: (result: GlobalSearchResult) => void;
  onPointerActive: (index: number) => void;
}) {
  let resultIndex = 0;
  const hasResults = props.flatResults.length > 0;
  return (
    <div   id="readiness-global-search-results" className="lp-global-search-results" role="listbox">
      {props.status === "loading" ? <Text as="div" size="md" className="lp-global-search-state">Searching...</Text> : null}
      {props.status === "failed" ? <Text as="div" size="md" className="lp-global-search-state error">{props.error || "Search failed."}</Text> : null}
      {props.status === "succeeded" && !hasResults ? <Text as="div" size="md" className="lp-global-search-state">No results found.</Text> : null}
      {props.groups.map((group) => (
        <div className="lp-global-search-group" key={group.section}>
          <Text as="div" size="sm" weight="semibold" className="lp-global-search-heading">{group.label}</Text>
          {group.results.map((result) => {
            const index = resultIndex;
            resultIndex += 1;
            return (
              <button
                type="button"
                key={`${result.section}:${result.id}`}
                className={index === props.activeIndex ? "active" : ""}
                role="option"
                aria-selected={index === props.activeIndex}
                onMouseEnter={() => props.onPointerActive(index)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => props.onOpen(result)}
              >
                <span>{result.title}</span>
                <small>{result.subtitle}</small>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
