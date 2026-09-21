import { Camera, ChevronDown, Search, UploadCloud } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import Card from "@/components/Card";
import SectionHead from "@/components/SectionHead";
import { btnGhost, btnGold, T } from "@/constants/theme";
import type { DocumentRecord } from "@/lib/api";
import { useAppSelector } from "@/store/hooks";
import { categories, openUpload } from "./document-utils";
import {
  documentPerson,
  documentSource,
  filterDocuments,
  matchesQuickFilter,
  sourceNames,
  type DocumentSort,
  type QuickFilter,
} from "./document-filters";
import DocumentRows from "./document-rows";

type DocumentsOverviewProps = {
  documents: DocumentRecord[];
  error: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
};

export default function DocumentsOverview({
  documents,
  error,
  status,
}: DocumentsOverviewProps) {
  const [searchParams] = useSearchParams();
  const currentUserName = useAppSelector((state) => state.auth.user?.name);
  const [query, setQuery] = useState(() => searchParams.get("search") ?? "");
  const [category, setCategory] = useState("all");
  const [person, setPerson] = useState("all");
  const [source, setSource] = useState("all");
  const [sort, setSort] = useState<DocumentSort>("newest");
  const [quick, setQuick] = useState<QuickFilter>("all");

  useEffect(() => {
    setQuery(searchParams.get("search") ?? "");
  }, [searchParams]);

  const people = useMemo(
    () =>
      [
        ...new Set(
          documents.map((document) =>
            documentPerson(document, currentUserName),
          ),
        ),
      ].sort(),
    [documents, currentUserName],
  );
  const sources = useMemo(
    () => [...new Set(documents.map(documentSource))],
    [documents],
  );
  const visibleDocuments = useMemo(
    () =>
      filterDocuments(documents, {
        query,
        category,
        person,
        source,
        sort,
        quick,
        currentUserName,
      }),
    [documents, query, category, person, source, sort, quick, currentUserName],
  );
  const quickCounts = useMemo(
    () => ({
      all: documents.length,
      soon: documents.filter((document) => matchesQuickFilter(document, "soon"))
        .length,
      expired: documents.filter((document) =>
        matchesQuickFilter(document, "expired"),
      ).length,
      week: documents.filter((document) => matchesQuickFilter(document, "week"))
        .length,
    }),
    [documents],
  );

  return (
    <div className="lp-route lp-documents-route">
      <SectionHead
        title="Documents"
        sub={`${documents.length} records in your archive. Search, filter, and open any row for full context.`}
        action={
          <div className="lp-document-add-actions">
            <button type="button" onClick={openUpload} style={btnGold}>
              <UploadCloud size={16} /> Upload <ChevronDown size={15} />
            </button>
            <button type="button" onClick={openUpload} style={btnGhost}>
              <Camera size={16} /> Scan
            </button>
          </div>
        }
      />

      <div className="lp-doc-quick">
        {(
          [
            ["all", "All"],
            ["soon", "Expiring soon"],
            ["expired", "Expired"],
            ["week", "Added this week"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={quick === key ? "active" : ""}
            onClick={() => setQuick(key)}
          >
            {label} <b>{quickCounts[key]}</b>
          </button>
        ))}
      </div>

      <div className="lp-doc-toolbar">
        <label className="lp-doc-search">
          <Search size={16} color={T.muted} />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search type, file, person, notes…"
            aria-label="Search documents"
          />
        </label>
        <select
          aria-label="Category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          <option value="all">All</option>
          {categories.map((item) => (
            <option key={item.key} value={item.key}>
              {item.name}
            </option>
          ))}
        </select>
        <select
          aria-label="Person"
          value={person}
          onChange={(event) => setPerson(event.target.value)}
        >
          <option value="all">Everyone</option>
          {people.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <select
          aria-label="Source"
          value={source}
          onChange={(event) => setSource(event.target.value)}
        >
          <option value="all">All</option>
          <option value="uploaded">Uploaded</option>
          {sources
            .filter((value) => value !== "uploaded")
            .map((value) => (
              <option key={value} value={value}>
                {sourceNames[value] ?? value}
              </option>
            ))}
        </select>
        <select
          aria-label="Sort"
          value={sort}
          onChange={(event) => setSort(event.target.value as DocumentSort)}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="name-asc">Name A–Z</option>
          <option value="name-desc">Name Z–A</option>
        </select>
      </div>

      {error ? (
        <div style={{ color: T.coral, fontSize: 13, marginBottom: 14 }}>
          {error}
        </div>
      ) : null}
      {status === "loading" ? (
        <Card>
          <div style={{ color: T.muted, fontSize: 13 }}>
            Loading documents from backend...
          </div>
        </Card>
      ) : visibleDocuments.length ? (
        <DocumentRows documents={visibleDocuments} />
      ) : (
        <Card>
          <div style={{ color: T.muted, fontSize: 13 }}>
            No documents match the selected filters.
          </div>
        </Card>
      )}
    </div>
  );
}
