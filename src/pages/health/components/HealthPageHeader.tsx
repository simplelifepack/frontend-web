import { Text, Heading, ChoiceGroup, Choice, Button } from "@/design-system";

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
          <Users aria-hidden="true" focusable="false" size="var(--icon-small)" />
          <b>Add</b>
        </button>
      </div>

      {selectedMember ? (
        <div className="lp-health-profile">
          <Text size="md">{initials(selectedMember.name)}</Text>
          <div>
            <Heading level={2} size="sm">{selectedMember.name}</Heading>
            <Text as="p" size="sm">
              {[
                selectedMember.relation,
                selectedMember.bloodGroup &&
                selectedMember.bloodGroup !== "Unknown"
                  ? selectedMember.bloodGroup
                  : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </Text>
          </div>
          <div className="lp-health-profile-actions">
            <Button variant="primary"
              type="button"

              onClick={onPrepareVisit}
            >
              <FileText aria-hidden="true" focusable="false" size={15} /> Prepare for a visit
            </Button>
            <Button variant="secondary"
              type="button"

              onClick={() => onDialog("reading")}
            >
              <Plus aria-hidden="true" focusable="false" size={15} /> Log reading
            </Button>
            <Button variant="secondary"
              type="button"

              onClick={() => onDialog("emergency")}
            >
              <ShieldAlert aria-hidden="true" focusable="false" size={15} /> In an emergency
            </Button>
            <Button variant="secondary"
              type="button"

              onClick={() => onDialog("insurance")}
            >
              <ShieldCheck aria-hidden="true" focusable="false" size={15} /> Insurance card
            </Button>
          </div>
        </div>
      ) : null}

      <ChoiceGroup >
        {(
          ["Overview", "Timeline", "Medications", "Records"] as HealthTab[]
        ).map((tab) => (
          <Choice
            aria-pressed={tab === activeTab}
            key={tab}
            type="button"
            onClick={() => onTab(tab)}
          >
            {tab === "Overview" ? (
              <HeartPulse aria-hidden="true" focusable="false" size="var(--icon-small)" />
            ) : tab === "Timeline" ? (
              <CalendarClock aria-hidden="true" focusable="false" size="var(--icon-small)" />
            ) : tab === "Medications" ? (
              <Stethoscope aria-hidden="true" focusable="false" size="var(--icon-small)" />
            ) : (
              <FileText aria-hidden="true" focusable="false" size="var(--icon-small)" />
            )}
            {tab}
            {tab === "Medications" && medicationCount ? (
              <span>{medicationCount}</span>
            ) : null}
            {tab === "Records" && recordCount ? <span>{recordCount}</span> : null}
          </Choice>
        ))}
      </ChoiceGroup>
    </>
  );
}
