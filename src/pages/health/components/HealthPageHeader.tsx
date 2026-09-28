import {
  CalendarClock,
  FileText,
  HeartPulse,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  Users,
} from "lucide-react";
import SectionHead from "@/components/SectionHead";
import { btnGhost } from "@/constants/theme";
import type { HealthMember, HealthOverview } from "@/lib/api.types";
import type { HealthDialogKind } from "../HealthDialog";
import { initials } from "../healthUtils";
import type { HealthTab } from "../types/health";
import HealthAttention from "./HealthAttention";

export default function HealthPageHeader({
  members,
  selectedMemberId,
  selectedMember,
  activeTab,
  upcoming,
  recordCount,
  medicationCount,
  onSelectMember,
  onAddMember,
  onPrepareVisit,
  onDialog,
  onTab,
}: {
  members: HealthMember[];
  selectedMemberId: string;
  selectedMember: HealthMember | null;
  activeTab: HealthTab;
  upcoming: HealthOverview["upcoming"];
  recordCount: number;
  medicationCount: number;
  onSelectMember: (id: string) => void;
  onAddMember: () => void;
  onPrepareVisit: () => void;
  onDialog: (dialog: HealthDialogKind) => void;
  onTab: (tab: HealthTab) => void;
}) {
  return (
    <>
      <SectionHead
        title="Health"
        sub="Keep the whole family visit-ready. ReadiNes organizes and surfaces your records. It never diagnoses."
        action={<HealthAttention reminders={upcoming} />}
      />

      <div className="lp-health-members">
        {members.map((member) => (
          <button
            className={member.id === selectedMemberId ? "active" : ""}
            key={member.id}
            type="button"
            onClick={() => onSelectMember(member.id)}
          >
            <span className="tone-ready">{initials(member.name)}</span>
            <span>
              <b>{member.name.split(" ")[0]}</b>
              <small>{member.relation}</small>
            </span>
          </button>
        ))}
        <button type="button" className="add" onClick={onAddMember}>
          <Users size={16} />
          <b>Add</b>
        </button>
      </div>

      {selectedMember ? (
        <div className="lp-health-profile">
          <span>{initials(selectedMember.name)}</span>
          <div>
            <h2>{selectedMember.name}</h2>
            <p>
              {[
                selectedMember.relation,
                selectedMember.bloodGroup &&
                selectedMember.bloodGroup !== "Unknown"
                  ? selectedMember.bloodGroup
                  : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
          <div className="lp-health-profile-actions">
            <button
              type="button"
              className="lp-health-action lp-health-action-primary"
              style={btnGhost}
              onClick={onPrepareVisit}
            >
              <FileText size={15} /> Prepare for a visit
            </button>
            <button
              type="button"
              className="lp-health-action"
              style={btnGhost}
              onClick={() => onDialog("reading")}
            >
              <Plus size={15} /> Log reading
            </button>
            <button
              type="button"
              className="lp-health-action"
              style={btnGhost}
              onClick={() => onDialog("emergency")}
            >
              <ShieldAlert size={15} /> In an emergency
            </button>
            <button
              type="button"
              className="lp-health-action"
              style={btnGhost}
              onClick={() => onDialog("insurance")}
            >
              <ShieldCheck size={15} /> Insurance card
            </button>
          </div>
        </div>
      ) : null}

      <div className="lp-health-tabs">
        {(
          ["Overview", "Timeline", "Medications", "Records"] as HealthTab[]
        ).map((tab) => (
          <button
            className={tab === activeTab ? "active" : ""}
            key={tab}
            type="button"
            onClick={() => onTab(tab)}
          >
            {tab === "Overview" ? (
              <HeartPulse size={16} />
            ) : tab === "Timeline" ? (
              <CalendarClock size={16} />
            ) : tab === "Medications" ? (
              <Stethoscope size={16} />
            ) : (
              <FileText size={16} />
            )}
            {tab}
            {tab === "Medications" && medicationCount ? (
              <span>{medicationCount}</span>
            ) : null}
            {tab === "Records" && recordCount ? <span>{recordCount}</span> : null}
          </button>
        ))}
      </div>
    </>
  );
}
