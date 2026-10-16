import { Text, Button, Card } from "@/design-system";

import { Check, Pencil, ShieldCheck, X } from "lucide-react";

import type { HealthMember, HealthRecord } from "@/lib/api.types";

function HealthReadiness({
  member,
  records,
  onRecords,
}: {
  member?: HealthMember;
  records: HealthRecord[];
  onRecords: () => void;
}) {
  const prescriptionCount = records.filter(
    (record) => record.type === "prescription",
  ).length;
  const readinessItems = [
    {
      label: "Blood group",
      ready: Boolean(member?.bloodGroup && member.bloodGroup !== "Unknown"),
      value: member?.bloodGroup || "Not added",
    },
    {
      label: "Allergies recorded",
      ready: Boolean(member?.allergies),
      value: member?.allergies || "Not added",
    },
    {
      label: "Emergency contact",
      ready: Boolean(
        member?.emergencyContactName && member?.emergencyContactPhone,
      ),
      value:
        [member?.emergencyContactName, member?.emergencyContactPhone]
          .filter(Boolean)
          .join(" · ") || "Not added",
    },
    {
      label: "Primary doctor",
      ready: Boolean(member?.primaryDoctor),
      value: member?.primaryDoctor || "Not added",
    },
    {
      label: "Insurance on file",
      ready: Boolean(member?.insuranceProvider),
      value: member?.insuranceProvider || "Not added",
    },
    {
      label: "Prescription on file",
      ready: prescriptionCount > 0,
      value: prescriptionCount ? `${prescriptionCount} on file` : "Not added",
    },
  ];
  const completed = readinessItems.filter((item) => item.ready).length;
  const percentage = Math.round((completed / readinessItems.length) * 100);
  return (
    <Card className="lp-health-readiness-card">
      <div className="lp-health-card-title">
        <ShieldCheck aria-hidden="true" focusable="false" size={17} /> Medical readiness{" "}
        <Button size="sm" variant="secondary" type="button" onClick={onRecords}>
          <Pencil aria-hidden="true" focusable="false" size={14} /> Edit
        </Button>
      </div>
      <div className="lp-health-readiness-score">
        <Text as="b" size="md" weight="semibold">{percentage}%</Text>
        <Text size="sm">document completeness, not a health score</Text>
      </div>
      <div
        className="lp-health-readiness-progress"
        aria-label={`${percentage}% medical readiness`}
      >
        <i style={{ width: `${percentage}%` }} />
      </div>
      <div   className="lp-health-readiness-list">
        {readinessItems.map((item) => (
          <div key={item.label} className={item.ready ? "ready" : "missing"}>
            <Text size="md">
              {item.ready ? <Check aria-hidden="true" focusable="false" size={14} /> : <X aria-hidden="true" focusable="false" size={14} />} {item.label}
            </Text>
          </div>
        ))}
      </div>
      <div className="lp-health-profile-details">
        <div>
          <Text size="md">Conditions</Text>
          <Text as="b" size="md" weight="semibold">{member?.conditions || "Not recorded"}</Text>
        </div>
        <div>
          <Text size="md">Allergies</Text>
          <Text as="b" size="md" weight="semibold">{member?.allergies || "Not recorded"}</Text>
        </div>
        <div>
          <Text size="md">Emergency</Text>
          <Text as="b" size="md" weight="semibold">
            {[member?.emergencyContactName, member?.emergencyContactPhone]
              .filter(Boolean)
              .join(" · ") || "Not added"}
          </Text>
        </div>
      </div>
    </Card>
  );
}

export default HealthReadiness;
