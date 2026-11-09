import type { ProfileDraft } from "../members/AddMemberDialog";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type {
  HealthAvailableMetric,
  HealthMeasurement,
  HealthMember,
  HealthMemberResolution,
  HealthOverview,
  HealthRecord,
  HealthRecordDetail,
  HealthTimelineEvent,
} from "@/lib/api.types";
import type { HealthDialogKind } from "../HealthDialog";
import type { HealthTab } from "../types/health";

const lastMemberKey = "readiness.health.lastMember";

export function useHealthData() {
  const [healthDialog, setHealthDialog] = useState<HealthDialogKind | null>(
    null,
  );
  const [members, setMembers] = useState<HealthMember[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [activeTab, setActiveTab] = useState<HealthTab>("Overview");
  const [overview, setOverview] = useState<HealthOverview | null>(null);
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [timeline, setTimeline] = useState<HealthTimelineEvent[]>([]);
  const [measurements, setMeasurements] = useState<HealthMeasurement[]>([]);
  const [selectedRecord, setSelectedRecord] =
    useState<HealthRecordDetail | null>(null);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [availableMetrics, setAvailableMetrics] = useState<
    HealthAvailableMetric[]
  >([]);
  const [search, setSearch] = useState("");
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberPrefill, setMemberPrefill] = useState<ProfileDraft>({});
  const [processedRecord, setProcessedRecord] =
    useState<HealthRecordDetail | null>(null);
  const [pendingRecords, setPendingRecords] = useState<HealthMemberResolution[]>([]);
  const [memberResolution, setMemberResolution] =
    useState<HealthMemberResolution | null>(null);
  const [deleteRecord, setDeleteRecord] = useState<HealthRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const recordOpenRequest = useRef(0);
  const memberLoadRequest = useRef(0);

  const selectedMember =
    members.find((member) => member.id === selectedMemberId) ??
    members.find((member) => member.relation === "Myself" || member.relation === "Self") ??
    members[0] ??
    null;
  const tracked = overview?.trackedMetrics ?? [];
  const upcoming = overview?.upcoming ?? [];

  const refreshMembers = async () => {
    setLoading(true);
    try {
      const nextMembers = await api.health.members();
      setMembers(nextMembers);
      let lastMemberId: string | null = null;
      try {
        lastMemberId = window.localStorage.getItem(lastMemberKey);
      } catch {
        // Health remains usable when browser storage is unavailable.
      }
      const restoredMember = nextMembers.find((member) => member.id === lastMemberId);
      const defaultMember = nextMembers.find((member) => member.relation === "Myself" || member.relation === "Self") ?? nextMembers[0];
      setSelectedMemberId((current) =>
        nextMembers.some((member) => member.id === current)
          ? current
          : current
            ? defaultMember?.id ?? ""
            : restoredMember?.id ?? defaultMember?.id ?? "",
      );
      setMessage("");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Health members could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  };

  const refreshHealth = async (memberId: string) => {
    if (!memberId) return;
    const request = ++memberLoadRequest.current;
    setLoading(true);
    setOverview(null);
    setRecords([]);
    setTimeline([]);
    setMeasurements([]);
    setSelectedRecord(null);
    setSelectedRecordId(null);
    setIsRecordModalOpen(false);
    setMessage("");
    try {
      const [nextOverview, nextRecords, nextTimeline, nextMetrics, nextMeasurements] =
        await Promise.all([
          api.health.overview(memberId),
          api.health.records(memberId),
          api.health.timeline(memberId),
          api.health.availableMetrics(memberId, search),
          api.health.measurements(memberId),
        ]);
      if (request !== memberLoadRequest.current) return;
      setOverview(nextOverview);
      setRecords(nextRecords);
      setTimeline(nextTimeline);
      setAvailableMetrics(nextMetrics);
      setMeasurements(nextMeasurements);
      if (nextRecords[0]) {
        setSelectedRecordId(nextRecords[0].id);
        const firstRecord = await api.health.record(nextRecords[0].id);
        if (request === memberLoadRequest.current) setSelectedRecord(firstRecord);
      } else setSelectedRecord(null);
    } catch (error) {
      if (request !== memberLoadRequest.current) return;
      toast.error("Health data could not be loaded", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      if (request === memberLoadRequest.current) setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const loadPending = () => {
      void api.health.pendingRecords().then(records => {
        if (active) setPendingRecords(records);
      }).catch(() => undefined);
    };
    const refresh = () => { void refreshMembers(); loadPending(); };
    refresh();
    window.addEventListener("readiness:health-updated", refresh);
    return () => { active = false; window.removeEventListener("readiness:health-updated", refresh); };
  }, []);
  useEffect(() => {
    if (!selectedMemberId) return;
    try {
      window.localStorage.setItem(lastMemberKey, selectedMemberId);
    } catch {
      // Remembering the last profile is optional.
    }
    void refreshHealth(selectedMemberId);
    const refreshSavedProfile = (event: Event) => {
      const detail = (event as CustomEvent<{ memberId?: string; createdMember?: unknown }>).detail;
      if (!detail?.createdMember && detail?.memberId === selectedMemberId) void refreshHealth(selectedMemberId);
    };
    window.addEventListener("readiness:health-updated", refreshSavedProfile);
    return () => window.removeEventListener("readiness:health-updated", refreshSavedProfile);
    // Refresh is intentionally keyed to the selected profile, not each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMemberId]);
  useEffect(() => {
    if (!selectedMemberId) return;
    const handle = window.setTimeout(() => {
      void api.health
        .availableMetrics(selectedMemberId, search)
        .then(setAvailableMetrics)
        .catch(() => undefined);
    }, 180);
    return () => window.clearTimeout(handle);
  }, [search, selectedMemberId]);

  return {
    healthDialog,
    setHealthDialog,
    members,
    setMembers,
    selectedMemberId,
    setSelectedMemberId,
    activeTab,
    setActiveTab,
    overview,
    setOverview,
    records,
    setRecords,
    timeline,
    setTimeline,
    measurements,
    setMeasurements,
    selectedRecord,
    setSelectedRecord,
    selectedRecordId,
    setSelectedRecordId,
    isRecordModalOpen,
    setIsRecordModalOpen,
    availableMetrics,
    setAvailableMetrics,
    search,
    setSearch,
    showAddRecord,
    setShowAddRecord,
    showAddMember,
    setShowAddMember,
    memberPrefill,
    setMemberPrefill,
    processedRecord,
    setProcessedRecord,
    pendingRecords,
    setPendingRecords,
    memberResolution,
    setMemberResolution,
    deleteRecord,
    setDeleteRecord,
    loading,
    setLoading,
    message,
    setMessage,
    recordOpenRequest,
    selectedMember,
    tracked,
    upcoming,
    refreshMembers,
    refreshHealth,
  };
}
