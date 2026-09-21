import { Check, Pencil, ShieldCheck, X } from "lucide-react";
import Card from "@/components/Card";
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
        <ShieldCheck size={17} /> Medical readiness{" "}
        <button type="button" onClick={onRecords}>
          <Pencil size={14} /> Edit
        </button>
      </div>
      <div className="lp-health-readiness-score">
        <b>{percentage}%</b>
        <span>document completeness, not a health score</span>
      </div>
      <div
        className="lp-health-readiness-progress"
        aria-label={`${percentage}% medical readiness`}
      >
        <i style={{ width: `${percentage}%` }} />
      </div>
      <div className="lp-health-readiness-list">
        {readinessItems.map((item) => (
          <div key={item.label} className={item.ready ? "ready" : "missing"}>
            <span>
              {item.ready ? <Check size={14} /> : <X size={14} />} {item.label}
            </span>
          </div>
        ))}
      </div>
      <div className="lp-health-profile-details">
        <div>
          <span>Conditions</span>
          <b>{member?.conditions || "Not recorded"}</b>
        </div>
        <div>
          <span>Allergies</span>
          <b>{member?.allergies || "Not recorded"}</b>
        </div>
        <div>
          <span>Emergency</span>
          <b>
            {[member?.emergencyContactName, member?.emergencyContactPhone]
              .filter(Boolean)
              .join(" · ") || "Not added"}
          </b>
        </div>
      </div>
    </Card>
  );
}

export default HealthReadiness;
