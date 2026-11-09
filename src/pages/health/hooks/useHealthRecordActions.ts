import type { AnalyzeDocumentResponse } from "@/lib/api.types";
import type { HealthUploadReview } from "@/lib/health-upload.types";
import { api } from "@/lib/api";
import { toast } from "sonner";
import type { HealthDocumentType } from "../types/health";
import { documentTypeLabels, healthMemberResolutionMessage, isMemberResolution } from "../healthUtils";
import type { useHealthData } from "./useHealthData";

function prescriptionUploadMessage(record: { processingStatus: string; medicationCount: number; processingError?: string | null }) {
  if (record.processingStatus === "partial_medication_extraction") return "Some information in this prescription couldn't be read. Please review the detected medications and add any missing medicines manually.";
  if (record.processingStatus === "handwritten_unreadable") return "Handwritten prescription couldn't be read. We couldn't reliably identify the medicines from this handwriting. You can enter the medications manually.";
  if (record.processingStatus === "ai_processing_disabled") return "AI processing is turned off. Turn on AI processing in Preferences to automatically extract medications from prescriptions, or enter the medications manually.";
  if (record.processingStatus === "no_medications_detected") return record.processingError || "No medications were detected in this prescription. You can enter medications manually.";
  if (record.medicationCount) return "Prescription processed. Review the detected medications and add any missing medicines manually.";
  return "Prescription saved. Add medications manually if needed.";
}

export function useHealthRecordActions(data: ReturnType<typeof useHealthData>) {
  const { selectedMemberId, memberResolution, recordOpenRequest, setMessage, setShowAddRecord, setMemberResolution, setPendingRecords, setSelectedMemberId, setActiveTab, setSelectedRecord, setProcessedRecord, refreshHealth, setDeleteRecord, setSelectedRecordId, setIsRecordModalOpen, setMembers, setShowAddMember, setOverview, setRecords, setTimeline, setAvailableMetrics } = data;
  const createRecord = async (payload: { file: File; type?: HealthDocumentType; analysis?: AnalyzeDocumentResponse; healthReview?: HealthUploadReview }) => {
    setMessage("Processing health record...");
    try {
      const analysis = payload.analysis ?? await api.documents.analyze([payload.file]);
      const aiDisabled = analysis.warnings.some(
        (warning) => warning.code === "AI_PROCESSING_DISABLED",
      );
      const saved = await api.documents.save({
        healthReview: payload.healthReview,
        tempFileIds: analysis.files.map((file) => file.tempFileId),
        originalName: analysis.files[0]?.originalName ?? payload.file.name,
        mimeType: analysis.files[0]?.mimeType ?? payload.file.type,
        size: analysis.files.reduce((total, file) => total + file.size, 0) || payload.file.size,
        title: payload.file.name,
        category: "Medical",
        documentType: payload.type
          ? documentTypeLabels[payload.type]
          : "Medical Report",
        confidence: aiDisabled ? 0 : 90,
        fields: {},
        reviewFields: [],
        rawExtractedText: "",
        warnings: analysis.warnings,
        evidence: [],
        analysisSource: aiDisabled ? "manual" : "ai",
        duplicateAction: "keep_both",
        userConfirmedUnknown: true,
      });
      const record = saved.healthRecord;
      if (!record) throw new Error("The document was saved without a Health record.");
      setShowAddRecord(false);
      if (isMemberResolution(record)) {
        setMemberResolution(record);
        setMessage(healthMemberResolutionMessage(record));
        return;
      }
      setSelectedMemberId(record.memberId);
      await refreshHealth(record.memberId);
      setActiveTab(payload.analysis?.document.healthExtraction ? "Records" : record.type === "prescription" ? "Medicines" : "Records");
      setSelectedRecord(record);
      if (payload.analysis?.document.healthExtraction) return;
      if (record.measurements.length) {
        setProcessedRecord(record);
        setMessage(record.matchedMember ? `Report added to ${record.matchedMember.name}` : "");
      } else {
        setMessage(record.type === "prescription" ? prescriptionUploadMessage(record) : record.processingStatus === "failed" ? "We couldn't process this health record. Try processing it again." : "Health record processed.");
      }
    } catch (error) {
      setMessage(error instanceof Error && error.message.includes("file type") ? "Only images and PDF files are supported." : error instanceof Error ? error.message : "Health record could not be processed.");
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
      if (isMemberResolution(record)) throw new Error("A health profile still needs to be selected.");
      setPendingRecords(current => current.filter(item => item.documentId !== memberResolution.documentId));
      setMemberResolution(null);
      setSelectedMemberId(memberId);
      await refreshHealth(memberId);
      setSelectedRecord(record);
      if (record.measurements.length) setProcessedRecord(record);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to assign this health record.");
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
      setMessage(error instanceof Error ? error.message : "Health record could not be deleted.");
    }
  };

  const viewOriginalDocument = async (documentId: string) => {
    const tab = window.open("about:blank", "_blank");
    if (!tab) {
      toast.error("Allow pop-ups to open the original document.");
      return;
    }
    let url: string | undefined;
    try {
      tab.opener = null;
      tab.document.title = "Original document";
      tab.document.body.textContent = "Loading original document…";
      const { blob } = await api.documents.preview(documentId);
      if (tab.closed) return;
      if (!blob.size || !/^(application\/pdf|image\/(jpeg|png|gif|webp|bmp|avif|tiff|heic|heif))$/i.test(blob.type)) {
        throw new Error("The original could not be loaded as a PDF or image.");
      }
      const objectUrl = URL.createObjectURL(blob);
      url = objectUrl;
      tab.location.replace(objectUrl);
      const cleanup = window.setInterval(() => {
        if (!tab.closed) return;
        window.clearInterval(cleanup);
        URL.revokeObjectURL(objectUrl);
      }, 1000);
    } catch (error) {
      if (url) URL.revokeObjectURL(url);
      tab.close();
      const message = error instanceof Error ? error.message : "";
      toast.error("Could not open the original document.", {
        description: /unauthorized|session|token|expired/i.test(message)
          ? "Sign in again and retry."
          : message || "Try again in a moment.",
      });
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
        setMessage(error instanceof Error ? error.message : "Health record could not be opened.");
      }
    }
  };

  const createMember = async (payload: Parameters<typeof api.health.createMember>[0]) => {
    if (memberResolution) {
      const record = await api.health.createRecord({
        documentId: memberResolution.documentId, type: memberResolution.type, newMember: payload,
      });
      if (isMemberResolution(record)) throw new Error("A health profile still needs to be selected.");
      setPendingRecords(current => current.filter(item => item.documentId !== memberResolution.documentId));
      setMemberResolution(null);
      setShowAddMember(false);
      setMembers(await api.health.members());
      setSelectedMemberId(record.memberId);
      await refreshHealth(record.memberId);
      setSelectedRecord(record);
      return;
    }
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
