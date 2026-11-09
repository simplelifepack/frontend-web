import { Button, Card, Heading, Stack } from "@/design-system";
import type { HealthMember, HealthRecord } from "@/lib/api.types";

export default function HealthReadiness({
  member,
  records,
  onEdit,
  onAddRecord,
  onInsurance,
}: {
  member: HealthMember;
  records: HealthRecord[];
  onEdit: () => void;
  onAddRecord: () => void;
  onInsurance: () => void;
}) {
  const missing = [
    { label: "Blood group", present: member.bloodGroup && member.bloodGroup !== "Unknown", action: onEdit },
    { label: "Primary doctor", present: member.primaryDoctor, action: onEdit },
    { label: "Emergency contact", present: member.emergencyContactName && member.emergencyContactPhone, action: onEdit },
    { label: "Health insurance card", present: member.insuranceProvider, action: onInsurance },
    { label: "Prescription", present: records.some((record) => record.type === "prescription"), action: onAddRecord },
  ].filter((item) => !item.present);

  if (!missing.length) return null;

  return (
    <Card>
      <Stack $gap="s8">
        <Heading level={2} size="sm">Still needed</Heading>
        {missing.map(({ label, action }) => (
          <Button key={label} type="button" variant="tertiary" onClick={action}>
            Add {label.toLowerCase()}
          </Button>
        ))}
      </Stack>
    </Card>
  );
}
