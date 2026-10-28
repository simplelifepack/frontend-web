import { useEffect, useMemo, useState } from "react";
import JSZip from "jszip";
import { api } from "@/lib/api";
import type { DocumentRecord, HealthMember, HealthRecord } from "@/lib/api.types";
import { type VisitDocument } from "./HealthDialog.HealthDialogKind";
import { buildVisitContexts, visitAppointmentDate, visitChooserGroups, visitDate } from "./HealthDialog.buildVisitContexts";
import { safeFileName, humanRecordType, appendSuffix, safeFileStem } from "./HealthDialog.documentDetail";


export function useVisitPackDialogLogic({
  member,
  records,
  onClose,
  onViewDocument,
}: {
  member: HealthMember;
  records: HealthRecord[];
  onClose: () => void;
  onViewDocument: (documentId: string) => void;
}) {

  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [selectedContextId, setSelectedContextId] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const [choosingVisit, setChoosingVisit] = useState(false);
  const [chooserQuery, setChooserQuery] = useState("");

  useEffect(() => {
    let active = true;
    void api.documents
      .list()
      .then((nextDocuments) => {
        if (active) setDocuments(nextDocuments);
      })
      .catch((reason: unknown) => {
        if (active)
          setError(
            reason instanceof Error
              ? reason.message
              : "Visit details could not be loaded.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [records]);

  const contexts = useMemo(() => buildVisitContexts(records), [records]);
  const selectedContext =
    contexts.find((context) => context.id === selectedContextId) ??
    contexts[0] ??
    null;
  const matching = useMemo<VisitDocument[]>(() => {
    if (!selectedContext) return [];
    const allowed = new Set(selectedContext.recordIds);
    const documentById = new Map(
      documents.map((document) => [document.id, document]),
    );
    return records
      .filter((record) => allowed.has(record.id))
      .map((record) => ({
        record,
        document: documentById.get(record.documentId),
      }));
  }, [documents, records, selectedContext]);

  useEffect(() => {
    if (!contexts.length) {
      setSelectedContextId("");
      return;
    }
    if (!contexts.some((context) => context.id === selectedContextId))
      setSelectedContextId(contexts[0]!.id);
  }, [contexts, selectedContextId]);
  useEffect(() => {
    setSelectedIds(new Set(matching.map((item) => item.record.id)));
  }, [selectedContextId, matching]);
  const selected = matching.filter((item) => selectedIds.has(item.record.id));
  const appointmentDate = visitAppointmentDate(matching);
  const chooserGroups = useMemo(
    () => visitChooserGroups(contexts, selectedContext?.id ?? "", chooserQuery),
    [chooserQuery, contexts, selectedContext?.id],
  );
  const toggle = (recordId: string) =>
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(recordId)) next.delete(recordId);
      else next.add(recordId);
      return next;
    });
  const download = async () => {
    if (!selected.length || !selectedContext || downloading) return;
    setDownloading(true);
    setError("");
    try {
      const zip = new JSZip();
      const names = new Map<string, number>();
      for (const item of selected
        .slice()
        .sort((a, b) => visitDate(b).localeCompare(visitDate(a)))) {
        const { blob } = await api.documents.download(item.record.documentId);
        const date = visitDate(item);
        const folder = date === "Undated" ? "undated" : date;
        const original = safeFileName(
          item.document?.originalName ||
            item.document?.title ||
            humanRecordType(item.record.type),
        );
        const base = `${folder}/${date === "Undated" ? "" : `${date}_`}${original}`;
        const count = names.get(base) ?? 0;
        names.set(base, count + 1);
        zip.file(count ? appendSuffix(base, count + 1) : base, blob);
      }
      const archive = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(archive);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${safeFileStem(member.name)}_${safeFileStem(selectedContext.label)}_Visit-Pack.zip`;
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "The visit pack could not be downloaded.",
      );
    } finally {
      setDownloading(false);
    }
  };
return { member, records, onClose, onViewDocument, documents, setDocuments, selectedContextId, setSelectedContextId, selectedIds, setSelectedIds, loading, setLoading, downloading, setDownloading, error, setError, choosingVisit, setChoosingVisit, chooserQuery, setChooserQuery, contexts, selectedContext, matching, selected, appointmentDate, chooserGroups, toggle, download };
}
