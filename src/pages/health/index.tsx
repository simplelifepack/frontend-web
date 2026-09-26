import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import Card from "@/components/Card";
import { api } from "@/lib/api";
import HealthDialog from "./HealthDialog";
import HealthPageHeader from "./components/HealthPageHeader";
import { useHealthPage } from "./hooks/useHealthPage";
import Overview from "./overview/Overview";
import Trends from "./overview/Trends";
import Timeline from "./timeline/Timeline";
import MedicationSummary from "./medications/MedicationSummary";
import Records from "./records/Records";
import RecordDetailModal from "./records/RecordDetailModal";
import MeasurementSelectionDialog from "./records/MeasurementSelectionDialog";
import DeleteRecordDialog from "./records/DeleteRecordDialog";
import AddRecordDialog from "./records/AddRecordDialog";
import MemberResolutionDialog from "./members/MemberResolutionDialog";
import AddMemberDialog from "./members/AddMemberDialog";
export default function HealthPage() {
  const location = useLocation();
  const {
    healthDialog,
    setHealthDialog,
    members,
    selectedMemberId,
    setSelectedMemberId,
    activeTab,
    setActiveTab,
    overview,
    records,
    timeline,
    measurements,
    selectedRecord,
    setSelectedRecord,
    selectedRecordId,
    isRecordModalOpen,
    setIsRecordModalOpen,
    availableMetrics,
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
    message,
    setMessage,
    selectedMember,
    tracked,
    upcoming,
    refreshMembers,
    refreshHealth,
    createRecord,
    confirmMemberResolution,
    trackMetric,
    trackMetrics,
    applyTrackedMetrics,
    toggleRecordMetric,
    removeRecord,
    viewOriginalDocument,
    openHealthRecord,
    untrackMetric,
    createMember,
  } = useHealthPage();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const memberId = params.get("member");
    const tab = params.get("tab");
    if (memberId && members.some((member) => member.id === memberId)) setSelectedMemberId(memberId);
    if (tab === "Overview" || tab === "Trends" || tab === "Timeline" || tab === "Medications" || tab === "Records") setActiveTab(tab);
  }, [location.search, members, setActiveTab, setSelectedMemberId]);
  return (
    <div className="lp-route lp-health-route">
      <HealthPageHeader
        members={members}
        selectedMemberId={selectedMemberId}
        selectedMember={selectedMember}
        activeTab={activeTab}
        upcoming={upcoming}
        onSelectMember={setSelectedMemberId}
        onAddMember={() => setShowAddMember(true)}
        onPrepareVisit={() => setHealthDialog("visit")}
        onDialog={setHealthDialog}
        onTab={setActiveTab}
      />

      {message && activeTab !== "Overview" ? (
        <div className="lp-health-insight">
          <span>{message}</span>
        </div>
      ) : null}
      {loading ? <Card>Loading health records...</Card> : null}
      {!loading && selectedMember && activeTab === "Overview" ? (
        <Overview
          onReminder={() => setHealthDialog("reminder")}
          onEdit={() => setHealthDialog("profile")}
          overview={overview}
          records={records}
          measurements={measurements}
          onTrack={() => setActiveTab("Trends")}
          onApplyTracked={applyTrackedMetrics}
        />
      ) : null}
      {!loading && selectedMember && activeTab === "Trends" ? (
        <Trends
          tracked={tracked}
          available={availableMetrics}
          search={search}
          onSearch={setSearch}
          onTrack={trackMetric}
          onUntrack={untrackMetric}
        />
      ) : null}
      {!loading && selectedMember && activeTab === "Timeline" ? (
        <Timeline events={timeline} />
      ) : null}
      {!loading && selectedMember && activeTab === "Medications" ? (
        <MedicationSummary
          events={timeline}
          onCreate={async (form) => {
            await api.health.createMedication(selectedMember.id, {
              name: form.name.trim(),
              dose: form.dose.trim(),
              frequency: form.frequency.trim() || null,
              repeats: form.repeats,
              runsOutAt: form.runsOutAt || null,
            });
            await refreshHealth(selectedMember.id);
          }}
        />
      ) : null}
      {!loading && selectedMember && activeTab === "Records" ? (
        <Records
          records={records}
          selectedRecordId={selectedRecordId}
          onAdd={() => setShowAddRecord(true)}
          onSelect={(recordId) => void openHealthRecord(recordId)}
          onDelete={setDeleteRecord}
        />
      ) : null}
      {isRecordModalOpen ? (
        <RecordDetailModal
          record={
            selectedRecord?.id === selectedRecordId ? selectedRecord : null
          }
          tracked={tracked}
          onClose={() => setIsRecordModalOpen(false)}
          onViewOriginal={viewOriginalDocument}
          onToggleMetric={toggleRecordMetric}
        />
      ) : null}
      {healthDialog && selectedMember ? (
        <HealthDialog
          kind={healthDialog}
          member={selectedMember}
          records={records}
          onClose={() => setHealthDialog(null)}
          onSaved={async () => {
            await refreshMembers();
            await refreshHealth(selectedMember.id);
          }}
          onUpload={() => {
            setHealthDialog(null);
            setShowAddRecord(true);
          }}
          onViewDocument={viewOriginalDocument}
        />
      ) : null}
      {showAddRecord ? (
        <AddRecordDialog
          onClose={() => setShowAddRecord(false)}
          onCreate={createRecord}
        />
      ) : null}
      {showAddMember ? (
        <AddMemberDialog
          initial={memberPrefill}
          onClose={() => setShowAddMember(false)}
          onCreate={createMember}
        />
      ) : null}
      {processedRecord ? (
        <MeasurementSelectionDialog
          record={processedRecord}
          tracked={tracked}
          onSkip={async () => {
            setProcessedRecord(null);
            setSelectedRecord(await api.health.record(processedRecord.id));
            setMessage("Health record saved.");
          }}
          onSave={async (metrics) => {
            await trackMetrics(metrics, processedRecord.id);
            setProcessedRecord(null);
            setMessage("Tracking preferences saved.");
          }}
        />
      ) : null}
      {deleteRecord ? (
        <DeleteRecordDialog
          onClose={() => setDeleteRecord(null)}
          onConfirm={() => removeRecord(deleteRecord.id)}
        />
      ) : null}
      {memberResolution ? (
        <MemberResolutionDialog
          resolution={memberResolution}
          members={members}
          onClose={() => setMemberResolution(null)}
          onCreateProfile={() => {
            setMemberPrefill({
              name: memberResolution.patient?.name ?? "",
              dateOfBirth: memberResolution.patient?.dateOfBirth ?? null,
            });
            setShowAddMember(true);
          }}
          onConfirm={confirmMemberResolution}
        />
      ) : null}
    </div>
  );
}
