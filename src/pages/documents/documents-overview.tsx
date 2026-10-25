import {
  Text,
  Stack,
  Row,
  FilterBar,
  SearchField,
  ChoiceGroup,
  Choice,
  SelectMenu,
  Button,
  Card,
} from "@/design-system";

import { Camera, ChevronDown, UploadCloud } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import SectionHead from "@/components/SectionHead";
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
import DigiLockerDialog from "./digilocker-dialog";

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
      proofs: documents.filter((document) =>
        matchesQuickFilter(document, "proofs"),
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
          <Row $gap="s8">
            <Button variant="primary" type="button" onClick={openUpload}>
              <UploadCloud
                aria-hidden="true"
                focusable="false"
                size="var(--icon-small)"
              />{" "}
              Upload{" "}
              <ChevronDown aria-hidden="true" focusable="false" size={15} />
            </Button>
            <DigiLockerDialog />
            <Button variant="secondary" type="button" onClick={openUpload}>
              <Camera
                aria-hidden="true"
                focusable="false"
                size="var(--icon-small)"
              />{" "}
              Scan
            </Button>
          </Row>
        }
      />

      <Stack className="documents-collection">
        <ChoiceGroup className="documents-quick-filters">
          {(
            [
              ["all", "All"],
              ["soon", "Expiring soon"],
              ["expired", "Expired"],
              ["week", "Added this week"],
              ["proofs", "Proofs"],
            ] as const
          ).map(([key, label]) => (
            <Choice
              data-filter={key}
              appearance="filter"
              count={quickCounts[key]}
              key={key}
              type="button"
              aria-pressed={quick === key}
              onClick={() => setQuick(key)}
            >
              {key !== "all" && (
                <span
                  className={`documents-filter-dot is-${key}`}
                  aria-hidden="true"
                />
              )}
              {label}
            </Choice>
          ))}
        </ChoiceGroup>

        <FilterBar className="documents-filters" $search>
          <SearchField
            appearance="filter"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search type, file, person, notes…"
            aria-label="Search documents"
          />
          <SelectMenu
            aria-label="Category"
            value={category}
            onValueChange={setCategory}
            options={[
              { value: "all", label: "All" },
              ...categories.map((item) => ({
                value: item.key,
                label: item.name,
              })),
            ]}
          />
          <SelectMenu
            aria-label="Person"
            value={person}
            onValueChange={setPerson}
            options={[
              { value: "all", label: "Everyone" },
              ...people.map((name) => ({ value: name, label: name })),
            ]}
          />
          <SelectMenu
            aria-label="Source"
            value={source}
            onValueChange={setSource}
            options={[
              { value: "all", label: "All" },
              { value: "uploaded", label: "Uploaded" },
              ...sources
                .filter((value) => value !== "uploaded")
                .map((value) => ({
                  value,
                  label: sourceNames[value] ?? value,
                })),
            ]}
          />
          <SelectMenu
            aria-label="Sort"
            value={sort}
            onValueChange={(value) => setSort(value as DocumentSort)}
            options={[
              { value: "newest", label: "Newest first" },
              { value: "oldest", label: "Oldest first" },
              { value: "name-asc", label: "Name A–Z" },
              { value: "name-desc", label: "Name Z–A" },
            ]}
          />
        </FilterBar>

        {error ? (
          <Text as="div" size="md" tone="danger">
            {error}
          </Text>
        ) : null}
        {status === "loading" ? (
          <Card>
            <Text as="div" size="md" tone="muted">
              Loading documents from backend...
            </Text>
          </Card>
        ) : visibleDocuments.length ? (
          <DocumentRows documents={visibleDocuments} />
        ) : (
          <Card>
            <Text as="div" size="md" tone="muted">
              No documents match the selected filters.
            </Text>
          </Card>
        )}
      </Stack>
    </div>
  );
}
