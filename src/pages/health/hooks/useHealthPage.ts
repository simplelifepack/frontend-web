import { useHealthData } from "./useHealthData";
import { useHealthRecordActions } from "./useHealthRecordActions";
import { useHealthTracking } from "./useHealthTracking";

export function useHealthPage() {
  const data = useHealthData();
  const records = useHealthRecordActions(data);
  const tracking = useHealthTracking(data);
  return { ...data, ...records, ...tracking };
}
