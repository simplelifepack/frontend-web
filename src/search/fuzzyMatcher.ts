import { fuzzySimilarity } from "./fuzzySearch";
import { compactSearchText, normalizeSearchText } from "./normalizer";

export function fuzzyPhraseConfidence(query: string, candidate: string) {
  const normalizedQuery = compactSearchText(query);
  const normalizedCandidate = compactSearchText(candidate);
  if (Math.min(normalizedQuery.length, normalizedCandidate.length) < 4) return 0;
  const similarity = fuzzySimilarity(normalizedQuery, normalizedCandidate);
  return similarity >= 0.72 ? Math.min(0.9, similarity * 0.92) : 0;
}

export function fuzzyTokenMatches(queryToken: string, keyword: string) {
  const left = normalizeSearchText(queryToken);
  const right = normalizeSearchText(keyword);
  if (Math.min(left.length, right.length) < 4) return false;
  return fuzzySimilarity(left, right) >= 0.72;
}
