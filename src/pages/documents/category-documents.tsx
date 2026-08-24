import { useNavigate } from "react-router-dom";

import Card from "@/components/Card";
import SectionHead from "@/components/SectionHead";
import { btnGhost, btnGold, T } from "@/constants/theme";
import type { DocumentRecord } from "@/lib/api";
import DocumentRows from "./document-rows";
import { labelize, openUpload } from "./document-utils";

type CategoryDocumentsProps = {
  documents: DocumentRecord[];
  name: string;
};

export default function CategoryDocuments({
  documents,
  name,
}: CategoryDocumentsProps) {
  const navigate = useNavigate();

  return (
    <div className="lp-route lp-documents-route">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 14,
          marginBottom: 18,
        }}
      >
        <div>
          <button
            type="button"
            onClick={() => navigate("/documents")}
            style={{ ...btnGhost, padding: "7px 11px", marginBottom: 14 }}
          >
            Documents / {name}
          </button>
          <SectionHead
            title={name}
            sub={`${documents.length} ${documents.length === 1 ? "document" : "documents"}`}
          />
        </div>
        <button
          type="button"
          onClick={openUpload}
          style={{ ...btnGold, alignSelf: "start" }}
        >
          Upload
        </button>
      </div>

      {documents.length ? (
        <DocumentRows documents={documents} showCategory={false} />
      ) : (
        <Card style={{ textAlign: "center", padding: 34 }}>
          <div style={{ color: T.white, fontWeight: 800, fontSize: 18 }}>
            No {labelize(name)} documents yet.
          </div>
          <div style={{ color: T.muted, fontSize: 13, marginTop: 8 }}>
            Upload a document and ReadiNes will place it here automatically.
          </div>
          <button type="button" onClick={openUpload} style={{ ...btnGold, marginTop: 18 }}>
            Upload
          </button>
        </Card>
      )}
    </div>
  );
}
