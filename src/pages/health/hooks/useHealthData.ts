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
  const [memberPrefill, setMemberPrefill] = useState<{
    name?: string;
    dateOfBirth?: string | null;
  }>({});
  const [processedRecord, setProcessedRecord] =
    useState<HealthRecordDetail | null>(null);
  const [memberResolution, setMemberResolution] =
    useState<HealthMemberResolution | null>(null);
  const [deleteRecord, setDeleteRecord] = useState<HealthRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const recordOpenRequest = useRef(0);

  const selectedMember =
    members.find((member) => member.id === selectedMemberId) ??
    members[0] ??
    null;
  const tracked = overview?.trackedMetrics ?? [];
  const upcoming = overview?.upcoming ?? [];

  const refreshMembers = async () => {
    setLoading(true);
    try {
      const nextMembers = await api.health.members();
      setMembers(nextMembers);
      setSelectedMemberId((current) => current || nextMembers[0]?.id || "");
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
      setOverview(nextOverview);
      setRecords(nextRecords);
      setTimeline(nextTimeline);
      setAvailableMetrics(nextMetrics);
      setMeasurements(nextMeasurements);
      if (nextRecords[0]) {
        setSelectedRecordId(nextRecords[0].id);
        setSelectedRecord(await api.health.record(nextRecords[0].id));
      } else setSelectedRecord(null);
    } catch (error) {
      toast.error("Health data could not be loaded", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshMembers();
  }, []);
  useEffect(() => {
    if (selectedMemberId) void refreshHealth(selectedMemberId);
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
