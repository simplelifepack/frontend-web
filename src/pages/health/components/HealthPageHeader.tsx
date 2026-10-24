import {
  Text,
  Heading,
  ChoiceGroup,
  Choice,
  Button,
  Row,
  Stack,
  IconBadge,
  Card,
  Grid,
} from "@/design-system";

import {
  Activity,
  CalendarClock,
  FileText,
  HeartPulse,
  Plus,
  Pencil,
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
        sub="Keep the whole family visit-ready. Readines organizes and surfaces your records. It never diagnoses."
        action={<HealthAttention reminders={upcoming} />}
      />
      <Stack $gap="s16" $spaceAfter="s24">
        <ChoiceGroup aria-label="Health profiles">
          {members.map((member) => (
            <Choice
              appearance="profile"
              aria-pressed={member.id === selectedMemberId}
              key={member.id}
              type="button"
              onClick={() => onSelectMember(member.id)}
            >
              <IconBadge>{initials(member.name)}</IconBadge>
              <Stack $gap="s4">
                <Text weight="medium" tone="heading">
                  {member.name}
                </Text>
                <Text size="sm" tone="muted">
                  {member.relation}
                </Text>
              </Stack>
            </Choice>
          ))}
          <Button variant="secondary" type="button" onClick={onAddMember}>
            <Users aria-hidden="true" />
            Add
          </Button>
        </ChoiceGroup>
        {selectedMember ? (
          <Card>
            <Stack $gap="s16">
              <Row $justify="space-between">
                <Row $wrap={false}>
                  <IconBadge>{initials(selectedMember.name)}</IconBadge>
                  <Stack $gap="s4">
                    <Heading level={2} size="sm">
                      {selectedMember.name}
                    </Heading>
                    <Text size="sm" tone="muted">
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
                  </Stack>
                </Row>
                <Button
                  variant="tertiary"
                  size="sm"
                  type="button"
                  onClick={() => onDialog("profile")}
                >
                  <Pencil aria-hidden="true" />
                  Edit profile
                </Button>
              </Row>
              <Grid $columns={4}>
                <Button
                  variant="primary"
                  type="button"
                  onClick={onPrepareVisit}
                >
                  <FileText aria-hidden="true" />
                  Prepare for a visit
                </Button>
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => onDialog("reading")}
                >
                  <Plus aria-hidden="true" />
                  Log reading
                </Button>
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => onDialog("emergency")}
                >
                  <ShieldAlert aria-hidden="true" />
                  In an emergency
                </Button>
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => onDialog("insurance")}
                >
                  <ShieldCheck aria-hidden="true" />
                  Insurance card
                </Button>
              </Grid>
            </Stack>
          </Card>
        ) : null}
        <ChoiceGroup aria-label="Health views">
          {(
            [
              "Overview",
              "Trends",
              "Timeline",
              "Medications",
              "Records",
            ] as HealthTab[]
          ).map((tab) => (
            <Choice
              appearance="filter"
              aria-pressed={tab === activeTab}
              key={tab}
              type="button"
              onClick={() => onTab(tab)}
              count={
                tab === "Medications" && medicationCount
                  ? medicationCount
                  : tab === "Records" && recordCount
                    ? recordCount
                    : undefined
              }
            >
              {tab === "Overview" ? (
                <HeartPulse aria-hidden="true" />
              ) : tab === "Trends" ? (
                <Activity aria-hidden="true" />
              ) : tab === "Timeline" ? (
                <CalendarClock aria-hidden="true" />
              ) : tab === "Medications" ? (
                <Stethoscope aria-hidden="true" />
              ) : (
                <FileText aria-hidden="true" />
              )}
              {tab}
            </Choice>
          ))}
        </ChoiceGroup>
      </Stack>
    </>
  );
}
