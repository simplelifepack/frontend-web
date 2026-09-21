import { api } from "@/lib/api";
import type { HealthDocumentType } from "../types/health";
import {
  documentTypeLabels,
  healthMemberResolutionMessage,
  isMemberResolution,
} from "../healthUtils";
import type { useHealthData } from "./useHealthData";

export function useHealthRecordActions(data: ReturnType<typeof useHealthData>) {
  const {
    selectedMemberId,
    memberResolution,
    recordOpenRequest,
    setMessage,
    setShowAddRecord,
    setMemberResolution,
    setSelectedMemberId,
    setActiveTab,
    setSelectedRecord,
    setProcessedRecord,
    refreshHealth,
    setDeleteRecord,
    setSelectedRecordId,
    setIsRecordModalOpen,
    setMembers,
    setShowAddMember,
    setOverview,
    setRecords,
    setTimeline,
    setAvailableMetrics,
  } = data;
  const createRecord = async (payload: {
    file: File;
    type: HealthDocumentType;
  }) => {
    setMessage("Processing health record...");
    try {
      const analysis = await api.documents.analyze([payload.file], true);
      const saved = await api.documents.save({
        tempFileIds: analysis.files.map((file) => file.tempFileId),
        originalName: analysis.files[0]?.originalName ?? payload.file.name,
        mimeType: analysis.files[0]?.mimeType ?? payload.file.type,
        size:
          analysis.files.reduce((total, file) => total + file.size, 0) ||
          payload.file.size,
        title: payload.file.name,
        category: "Medical",
        documentType: documentTypeLabels[payload.type] ?? "Medical Report",
        confidence: 90,
        fields: {},
        reviewFields: [],
        rawExtractedText: "",
        warnings: analysis.warnings,
        evidence: [],
        analysisSource: "ai",
        duplicateAction: "keep_both",
        userConfirmedUnknown: true,
      });
      const record = await api.health.createRecord({
        documentId: saved.document.id,
        type: payload.type,
      });
      setShowAddRecord(false);
      if (isMemberResolution(record)) {
        setMemberResolution(record);
        setMessage(healthMemberResolutionMessage(record));
        return;
      }
      setSelectedMemberId(record.memberId);
      await refreshHealth(record.memberId);
      setActiveTab("Records");
      setSelectedRecord(record);
      if (record.measurements.length) {
        setProcessedRecord(record);
        setMessage(
          record.matchedMember
            ? `Report added to ${record.matchedMember.name}`
            : "",
        );
      } else {
        setMessage(
          record.processingStatus === "failed"
            ? "We couldn't process this health record. Try processing it again."
            : "Health record processed.",
        );
      }
    } catch (error) {
      setMessage(
        error instanceof Error && error.message.includes("file type")
          ? "Only images and PDF files are supported."
          : error instanceof Error
            ? error.message
            : "Health record could not be processed.",
      );
      throw error;
    }
  };

  const confirmMemberResolution = async (memberId: string) => {
    if (!memberResolution) return;
    try {
      const record = await api.health.createRecord({
        memberId,
        documentId: memberResolution.documentId,
        type: memberResolution.type,
      });
      if (isMemberResolution(record))
        throw new Error("A health profile still needs to be selected.");
      setMemberResolution(null);
      setSelectedMemberId(memberId);
      await refreshHealth(memberId);
      setSelectedRecord(record);
      if (record.measurements.length) setProcessedRecord(record);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to assign this health record.",
      );
    }
  };

  const removeRecord = async (recordId: string) => {
    if (!selectedMemberId) return;
    try {
      await api.health.deleteRecord(recordId);
      setDeleteRecord(null);
      await refreshHealth(selectedMemberId);
      setMessage("Health record deleted.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Health record could not be deleted.",
      );
    }
  };

  const viewOriginalDocument = async (documentId: string) => {
    try {
      const { blob } = await api.documents.download(documentId);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(url), 1200);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Original document could not be opened.",
      );
    }
  };

  const openHealthRecord = async (recordId: string) => {
    const request = ++recordOpenRequest.current;
    setSelectedRecordId(recordId);
    setIsRecordModalOpen(true);
    try {
      const record = await api.health.record(recordId);
      if (request === recordOpenRequest.current) setSelectedRecord(record);
    } catch (error) {
      if (request === recordOpenRequest.current) {
        setIsRecordModalOpen(false);
        setMessage(
          error instanceof Error
            ? error.message
            : "Health record could not be opened.",
        );
      }
    }
  };

  const createMember = async (payload: {
    name: string;
    relation: string;
    bloodGroup?: string | null;
    dateOfBirth?: string | null;
  }) => {
    const member = await api.health.createMember(payload);
    setMembers((current) => [...current, member]);
    setSelectedMemberId(member.id);
    setShowAddMember(false);
    setOverview(null);
    setRecords([]);
    setTimeline([]);
    setSelectedRecord(null);
    setAvailableMetrics([]);
    await refreshHealth(member.id);
    if (memberResolution) await confirmMemberResolution(member.id);
  };

  return {
    createRecord,
    confirmMemberResolution,
    removeRecord,
    viewOriginalDocument,
    openHealthRecord,
    createMember,
  };
}
