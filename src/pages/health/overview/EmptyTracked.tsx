import { Plus } from "lucide-react";
import Card from "@/components/Card";
import { btnGhost } from "@/constants/theme";

function EmptyTracked({ onTrack }: { onTrack: () => void }) {
  return (
    <Card>
      <div className="lp-health-empty">
        <h3>No measurements tracked yet.</h3>
        <p>
          Choose measurements from existing lab reports to follow them over
          time.
        </p>
        <button type="button" style={btnGhost} onClick={onTrack}>
          <Plus size={15} /> Track measurement
        </button>
      </div>
    </Card>
  );
}

export default EmptyTracked;
