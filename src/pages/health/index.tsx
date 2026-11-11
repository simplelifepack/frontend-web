import HealthProfileNotices from "./components/HealthProfileNotices";
import ManualReadings from "./records/ManualReadings";
import type { HealthMember } from "@/lib/api.types";
import { Text, Card, Button } from "@/design-system";

import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { api } from "@/lib/api";
import HealthPageHeader from "./components/HealthPageHeader";
import HealthDialog from "./HealthDialog";
import { useHealthPage } from "./hooks/useHealthPage";
import HealthMedicationsTab from "./medications/HealthMedicationsTab";
import AddMemberDialog from "./members/AddMemberDialog";
import MemberResolutionDialog from "./members/MemberResolutionDialog";
import Overview from "./overview/Overview";
import Timeline from "./timeline/Timeline";
import Trends from "./overview/Trends";
import AddRecordDialog from "./records/AddRecordDialog";
import DeleteRecordDialog from "./records/DeleteRecordDialog";
import MeasurementSelectionDialog from "./records/MeasurementSelectionDialog";
import RecordDetailModal from "./records/RecordDetailModal";
import Records from "./records/Records";

export default function HealthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [profileToDelete, setProfileToDelete] = useState<HealthMember | null>(null);
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
    pendingRecords,
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
    removeRecord,
    viewOriginalDocument,
    openHealthRecord,
    untrackMetric,
    createMember,
    aiProcessingEnabled,
    newProfileId,
    newProfileName,
  } = useHealthPage(location);
  return (
    <div   className="lp-route lp-health-route">
      <HealthPageHeader
        members={members}
        selectedMemberId={selectedMemberId}
        selectedMember={selectedMember}
        activeTab={activeTab}
        upcoming={upcoming}
        recordCount={records.length}
        medicationCount={records.reduce((sum, record) => sum + record.medicationCount, 0)}
        onSelectMember={setSelectedMemberId}
        onAddMember={() => setShowAddMember(true)}
        onDeleteMember={setProfileToDelete}
        onPrepareVisit={() => setHealthDialog("visit")}
        onDialog={setHealthDialog}
        onTab={setActiveTab}
      />

      <HealthProfileNotices newProfileName={newProfileName} pendingCount={memberResolution ? 0 : pendingRecords.length}
        onDismiss={() => navigate(location.pathname + location.search, { replace: true, state: { newHealthProfileId: newProfileId } })}
        onReview={() => setMemberResolution(pendingRecords[0]!)} />
      {message && activeTab !== "Overview" ? (
        <div className="lp-health-insight">
          <Text size="md">{message}</Text>
        </div>
      ) : null}
      {loading ? <Card>Loading health records...</Card> : null}
      {!loading && selectedMember && activeTab === "Overview" ? (
        <Overview
          onReminder={() => setHealthDialog("reminder")}
          timeline={timeline}
          onReminderSaved={() => refreshHealth(selectedMember.id)}
          onEdit={() => setHealthDialog("profile")}
          onAddRecord={() => setShowAddRecord(true)}
          onInsurance={() => setHealthDialog("insurance")}
          overview={overview}
          records={records}
          measurements={measurements}
          onTrack={() => setActiveTab("Readings")}
          onApplyTracked={applyTrackedMetrics}
        />
      ) : null}
      {!loading && selectedMember && activeTab === "Readings" ? (
        <>
          <Button type="button" variant="tertiary" onClick={() => setActiveTab("Timeline")}>
            View timeline
          </Button>
          <Trends
            tracked={tracked}
            available={availableMetrics}
            search={search}
            onSearch={setSearch}
            onTrack={trackMetric}
            onUntrack={untrackMetric}
            onApplyTracked={applyTrackedMetrics}
          />
        </>
      ) : null}
      {!loading && selectedMember && activeTab === "Timeline" ? (
        <Timeline events={timeline} />
      ) : null}
      {!loading && selectedMember && activeTab === "Medicines" ? (
        <HealthMedicationsTab records={records} onViewOriginal={viewOriginalDocument} addRequested={false} onAddClosed={() => undefined}
          selectedMember={selectedMember}
          timeline={timeline}
          refreshHealth={refreshHealth}
        />
      ) : null}
      {!loading && selectedMember && activeTab === "Records" ? (
        <Records
          records={records}
          measurements={measurements}
          aiProcessingEnabled={aiProcessingEnabled}
          selectedRecordId={selectedRecordId}
          onAdd={() => setShowAddRecord(true)}
          onSelect={(recordId) => void openHealthRecord(recordId)}
          onViewOriginal={viewOriginalDocument}
          onDelete={setDeleteRecord}
        />
      ) : null}
      {!loading && selectedMember && activeTab === "Records" && <ManualReadings key={selectedMember.id} member={selectedMember}
        measurements={measurements} onSaved={() => refreshHealth(selectedMember.id)} />}
      {isRecordModalOpen ? (
        <RecordDetailModal
          record={
            selectedRecord?.id === selectedRecordId ? selectedRecord : null
          }
          member={selectedMember}
          onClose={() => setIsRecordModalOpen(false)}
          onViewOriginal={viewOriginalDocument}
          onReanalyze={aiProcessingEnabled ? async record => setSelectedRecord(await api.health.reanalyzeRecord(record.id)) : undefined}
        />
      ) : null}
      {healthDialog && selectedMember ? (
        <HealthDialog
          kind={healthDialog}
          tracked={tracked}
          timeline={timeline}
          member={selectedMember}
          records={records}
          measurements={measurements}
          onClose={() => setHealthDialog(null)}
          onSaved={async () => {
            await refreshMembers();
            await refreshHealth(selectedMember.id);
          }}
          onViewDocument={viewOriginalDocument}
        />
      ) : null}
      {showAddRecord ? (
        <AddRecordDialog
          aiProcessingEnabled={aiProcessingEnabled}
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
      {profileToDelete ? (
        <DeleteRecordDialog
          profileName={profileToDelete.name}
          onClose={() => setProfileToDelete(null)}
          onConfirm={async () => {
            await api.health.deleteMember(profileToDelete.id);
            setProfileToDelete(null);
            await refreshMembers();
          }}
        />
      ) : null}
      {deleteRecord ? (
        <DeleteRecordDialog onClose={() => setDeleteRecord(null)} onConfirm={() => removeRecord(deleteRecord.id)} />
      ) : null}
      {memberResolution ? (
        <MemberResolutionDialog
          resolution={memberResolution}
          members={members}
          onClose={() => setMemberResolution(null)}
          onCreateProfile={() => {
            setMemberPrefill({ ...memberResolution.patient, name: memberResolution.patient?.name ?? "" });
            setShowAddMember(true);
          }}
          onConfirm={confirmMemberResolution}
        />
      ) : null}
    </div>
  );
}
