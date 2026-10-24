import {
  Text,
  Button,
  Card,
  Pill,
  Heading,
  Stack,
  Row,
  Grid,
  Disclosure,
  Preformatted,
} from "@/design-system";

import { Download, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import type { DocumentRecord } from "@/lib/api";
import { useAppDispatch } from "@/store/hooks";
import { deleteDocument } from "@/store/slices/documentsSlice";
import {
  documentTitle,
  fieldsObject,
  labelize,
  reviewFields,
  safeCategory,
  sourceLabel,
} from "./document-utils";
import { confirmDeleteDocuments, downloadDocuments } from "./document-actions";
import FilePreview from "./file-preview";

export default function DocumentDetail({ doc }: { doc: DocumentRecord }) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [busy, setBusy] = useState<"download" | "delete" | null>(null);
  const category = safeCategory(doc.category);
  const fields = fieldsObject(doc);
  const rawExtractedText =
    doc.rawText ||
    (typeof fields.rawExtractedText === "string"
      ? fields.rawExtractedText
      : "");
  const evidence = Array.isArray(fields.evidence)
    ? (fields.evidence as Array<{
        label?: string;
        text?: string;
        points?: number;
      }>)
    : [];
  const warnings = Array.isArray(fields.warnings)
    ? (fields.warnings as Array<{ code?: string; message?: string }>)
    : [];
  const approvedFields = reviewFields(doc);
  const downloadDocument = async () => {
    setBusy("download");
    try {
      await downloadDocuments([doc]);
    } finally {
      setBusy(null);
    }
  };
  const removeDocument = async () => {
    if (!confirmDeleteDocuments(1)) return;
    setBusy("delete");
    try {
      await dispatch(deleteDocument(doc.id)).unwrap();
      navigate("/documents", { replace: true });
    } finally {
      setBusy(null);
    }
  };

  return (
    <Stack $gap="s24">
      <Row $justify="space-between">
        <Button
          variant="secondary"
          size="sm"
          type="button"
          onClick={() => navigate("/documents")}
        >
          Documents
        </Button>
        <Row $gap="s8">
          <Button
            loading={Boolean(busy)}
            variant="primary"
            type="button"
            disabled={Boolean(busy)}
            onClick={() => void downloadDocument()}
          >
            <Download aria-hidden="true" size="var(--icon-small)" />
            {busy === "download" ? "Downloading..." : "Download"}
          </Button>
          <Button
            tone="danger"
            loading={Boolean(busy)}
            variant="secondary"
            type="button"
            disabled={Boolean(busy)}
            onClick={() => void removeDocument()}
          >
            <Trash2 aria-hidden="true" size="var(--icon-small)" />
            {busy === "delete" ? "Deleting..." : "Delete"}
          </Button>
        </Row>
      </Row>
      <Card>
        <Stack $gap="s12">
          <Heading level={1} size="lg">
            {documentTitle(doc)}
          </Heading>
          <Row $gap="s8">
            <Pill tone="flat">{labelize(category)}</Pill>
            <Pill tone="flat">{labelize(doc.documentType)}</Pill>
            <Pill tone="flat">{sourceLabel(doc)}</Pill>
            <Pill tone="flat">
              {doc.pages?.length
                ? `${doc.pages.length} page${doc.pages.length === 1 ? "" : "s"}`
                : "1 page"}
            </Pill>
          </Row>
          <Text tone="muted">
            {doc.source === "MANUAL_UPLOAD" ? "Uploaded" : "Indexed"}{" "}
            {new Date(doc.createdAt).toLocaleString()} · {doc.originalName}
          </Text>
        </Stack>
      </Card>
      <FilePreview doc={doc} rawExtractedText={rawExtractedText} />
      <Card>
        <Stack $gap="s12">
          <Heading level={2} size="sm">
            Review fields
          </Heading>
          {approvedFields.length ? (
            approvedFields.map((field, index) => (
              <Grid key={field.id ?? `${field.key}-${index}`}>
                <Text tone="muted">{field.label}</Text>
                <Text>{field.value}</Text>
              </Grid>
            ))
          ) : (
            <Text tone="muted">
              No reviewed fields saved for this document.
            </Text>
          )}
        </Stack>
      </Card>
      <Disclosure>
        <summary>Raw extracted text</summary>
        <Preformatted>{rawExtractedText || "No raw text saved."}</Preformatted>
      </Disclosure>
      <Disclosure>
        <summary>Evidence and warnings</summary>
        <Stack $gap="s8">
          {warnings.map((warning, index) => (
            <Text tone="danger" key={`${warning.code}-${index}`}>
              <b>{warning.code}</b> - {warning.message}
            </Text>
          ))}
          {evidence.map((item, index) => (
            <Text key={`${item.label}-${index}`}>
              <b>{item.label}</b> ({item.points}) - {item.text}
            </Text>
          ))}
          {!warnings.length && !evidence.length ? (
            <Text tone="muted">No evidence or warnings saved.</Text>
          ) : null}
        </Stack>
      </Disclosure>
      <Row>
        <Button
          variant="secondary"
          type="button"
          disabled
          title="Metadata editing is not available for saved documents."
        >
          Edit metadata
        </Button>
      </Row>
    </Stack>
  );
}
