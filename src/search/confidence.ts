export const LOCAL_MATCH_THRESHOLD = 0.74;

export function meetsLocalConfidence(confidence: number) {
  return confidence >= LOCAL_MATCH_THRESHOLD;
}
