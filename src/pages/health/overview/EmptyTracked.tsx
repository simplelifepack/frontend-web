import { Heading, Text, Button, Card } from "@/design-system";

import { Plus } from "lucide-react";

function EmptyTracked({ onTrack }: { onTrack: () => void }) {
  return (
    <Card>
      <div className="lp-health-empty">
        <Heading level={3} size="sm">No measurements tracked yet.</Heading>
        <Text as="p" size="md">
          Choose measurements from existing lab reports to follow them over
          time.
        </Text>
        <Button variant="secondary" type="button" onClick={onTrack}>
          <Plus aria-hidden="true" focusable="false" size={15} /> Track measurement
        </Button>
      </div>
    </Card>
  );
}

export default EmptyTracked;
