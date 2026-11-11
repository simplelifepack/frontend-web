import { Button, Card, Text } from "@/design-system";

export default function HealthProfileNotices({ newProfileName, pendingCount, onDismiss, onReview }: {
  newProfileName?: string;
  pendingCount: number;
  onDismiss: () => void;
  onReview: () => void;
}) {
  return <>
    {newProfileName && <Card>
      <Text as="p" role="status">New health profile created for {newProfileName}.</Text>
      <Button variant="tertiary" type="button" onClick={onDismiss}>Dismiss</Button>
    </Card>}
    {pendingCount > 0 && <Card>
      <Text as="p">{pendingCount === 1 ? "One health report needs a profile." : pendingCount + " health reports need a profile."}</Text>
      <Button variant="tertiary" type="button" onClick={onReview}>Review assignment</Button>
    </Card>}
  </>;
}
