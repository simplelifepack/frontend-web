import { Text, Button, Card } from "@/design-system";

import { useNavigate } from "react-router-dom";

import SectionHead from "@/components/SectionHead";
import { T } from "@/constants/theme";
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
          gap: "var(--space-s14)",
          marginBottom: "var(--space-s18)",
        }}
      >
        <div>
          <Button variant="secondary" size="sm"
            type="button"
            onClick={() => navigate("/documents")}
            style={{ marginBottom: "var(--space-s14)" }}
          >
            Documents / {name}
          </Button>
          <SectionHead
            title={name}
            sub={`${documents.length} ${documents.length === 1 ? "document" : "documents"}`}
          />
        </div>
        <Button variant="primary"
          type="button"
          onClick={openUpload}
          style={{ alignSelf: "start" }}
        >
          Upload
        </Button>
      </div>

      {documents.length ? (
        <DocumentRows documents={documents} showCategory={false} />
      ) : (
        <Card style={{ textAlign: "center" }}>
          <Text as="div" size="lg" weight="semibold" style={{ color: T.white }}>
            No {labelize(name)} documents yet.
          </Text>
          <Text as="div" size="md" tone="muted" style={{ color: T.muted, marginTop: "var(--space-s8)" }}>
            Upload a document and Readines will place it here automatically.
          </Text>
          <Button variant="primary" type="button" onClick={openUpload} style={{ marginTop: "var(--space-s18)" }}>
            Upload
          </Button>
        </Card>
      )}
    </div>
  );
}
