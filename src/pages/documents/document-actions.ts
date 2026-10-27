import { api, type DocumentRecord } from "@/lib/api";

function saveBlob(blob: Blob, fileName: string) {
  let decodedName = fileName;
  try { decodedName = decodeURIComponent(fileName); } catch { /* Literal percent signs are valid filenames. */ }
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = decodedName;
  document.body.appendChild(link);
  try { link.click(); } finally {
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
  }
}

export async function downloadDocuments(documents: DocumentRecord[]) {
  if (!documents.length) return;
  const response = documents.length === 1
    ? await api.documents.download(documents[0]!.id)
    : await api.documents.bulkDownload(documents.map((document) => document.id));
  saveBlob(response.blob, response.fileName);
}

export function confirmDeleteDocuments(count: number) {
  return window.confirm(
    count === 1
      ? "Delete this document? This cannot be undone."
      : `Delete ${count} documents? This cannot be undone.`,
  );
}
