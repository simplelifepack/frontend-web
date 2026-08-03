import { Camera, Check, Link2, Search, UploadCloud } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import Card from "@/components/Card";
import SectionHead from "@/components/SectionHead";
import { btnGhost, btnGold, T } from "@/constants/theme";
import type { DocumentRecord } from "@/lib/api";
import DocumentRows from "./document-rows";
import { openUpload, type Source } from "./document-utils";

type DocumentsOverviewProps = {
  documents: DocumentRecord[];
  error: string | null;
  sources: Source[];
  status: "idle" | "loading" | "succeeded" | "failed";
  onSelectSource: (id: string) => void;
};

export default function DocumentsOverview({
  documents,
  error,
  sources,
  status,
  onSelectSource,
}: DocumentsOverviewProps) {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get("search") ?? "");
  const visibleDocuments = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return documents;
    return documents.filter((document) => [
      document.title, document.displayName, document.originalName, document.documentType,
      document.category, document.uniqueIdentifier, document.source,
    ].some((value) => String(value ?? "").toLowerCase().includes(normalized)));
  }, [documents, query]);

  return (
    <div className="lp-route lp-documents-route">
      <SectionHead
        title="Documents"
        sub={`${documents.length} records in your archive. Search, filter, and open any row for full context.`}
        action={
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={openUpload} style={btnGold}><UploadCloud size={15} /> Upload</button>
            <button type="button" onClick={openUpload} style={btnGhost}><Camera size={15} /> Scan</button>
          </div>
        }
      />

      <div className="lp-doc-quick">
        <button type="button" className="active">All <b>{documents.length}</b></button>
        <button type="button">Expiring soon <b>0</b></button>
        <button type="button">Expired <b>0</b></button>
        <button type="button">Added this week <b>0</b></button>
      </div>

      <div className="lp-doc-toolbar">
        <label>
          <Search size={15} color={T.muted} />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search type, file, person, notes…"
            aria-label="Search documents"
          />
        </label>
        {sources.map((source) => (
          <button
            key={source.id}
            onClick={() => onSelectSource(source.id)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: source.connected ? "rgba(79,203,149,0.1)" : T.panel,
              color: source.connected ? T.mint : T.muted,
              border: `1px solid ${source.connected ? "rgba(79,203,149,0.4)" : T.border}`,
              borderRadius: 10,
              padding: "8px 11px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {source.connected ? <Check size={14} /> : <Link2 size={14} />}
            <span>{source.name}</span>
          </button>
        ))}
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
      ) : (
        visibleDocuments.length ? <DocumentRows documents={visibleDocuments} /> : (
          <Card><div style={{ color: T.muted, fontSize: 13 }}>No documents match “{query}”.</div></Card>
        )
      )}
    </div>
  );
}
