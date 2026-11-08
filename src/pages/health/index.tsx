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
    toggleRecordMetric,
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

      {newProfileName ? (
        <Card>
          <Text as="p" role="status">New health profile created for {newProfileName}.</Text>
          <Button variant="tertiary" type="button" onClick={() => navigate(location.pathname + location.search, { replace: true, state: { newHealthProfileId: newProfileId } })}>Dismiss</Button>
        </Card>
      ) : null}
      {pendingRecords.length > 0 && !memberResolution ? (
        <Card>
          <Text as="p">{pendingRecords.length === 1 ? "One health report needs a profile." : `${pendingRecords.length} health reports need a profile.`}</Text>
          <Button variant="tertiary" type="button" onClick={() => setMemberResolution(pendingRecords[0]!)}>
            Review assignment
          </Button>
        </Card>
      ) : null}
      {message && activeTab !== "Overview" ? (
        <div className="lp-health-insight">
          <Text size="md">{message}</Text>
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
          onApplyTracked={applyTrackedMetrics}
        />
      ) : null}
      {!loading && selectedMember && activeTab === "Timeline" ? (
        <Timeline events={timeline} />
      ) : null}
      {!loading && selectedMember && activeTab === "Medications" ? (
        <HealthMedicationsTab
          selectedMember={selectedMember}
          timeline={timeline}
          refreshHealth={refreshHealth}
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
          member={selectedMember}
          onClose={() => setIsRecordModalOpen(false)}
          onViewOriginal={viewOriginalDocument}
          onReanalyze={aiProcessingEnabled ? async record => setSelectedRecord(await api.health.reanalyzeRecord(record.id)) : undefined}
          onCorrectDetails={(record) => {
            setIsRecordModalOpen(false);
            setProcessedRecord(record);
          }}
        />
      ) : null}
      {healthDialog && selectedMember ? (
        <HealthDialog
          kind={healthDialog}
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
          onSave={async (metrics, documentType) => {
            if (documentType !== processedRecord.type) {
              const updated = await api.health.updateRecord(processedRecord.id, { type: documentType });
              setSelectedRecord(updated);
              await refreshHealth(updated.memberId);
            }
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
