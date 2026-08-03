import {
  genericKeywordWeights,
  MIN_MEANINGFUL_KEYWORD_WEIGHT,
  MIN_WEIGHTED_SCORE,
} from "./keywordWeights";
import { fuzzyTokenMatches } from "./fuzzyMatcher";
import type { PackageKeywordEntry } from "./types";

export function weightedKeywordConfidence(entry: PackageKeywordEntry, queryTokens: string[]) {
  let score = 0;
  let meaningfulMatches = 0;
  const significantTokens = [...new Set(queryTokens)].filter(
    (token) => !stopWords.has(token) && (genericKeywordWeights[token] ?? 3) > 2,
  );
  for (const token of new Set(queryTokens)) {
    const directWeight = entry.keywords[token];
    const fuzzyKeyword = directWeight === undefined
      ? Object.keys(entry.keywords).find((keyword) => fuzzyTokenMatches(token, keyword))
      : undefined;
    const weight = directWeight ?? (fuzzyKeyword ? entry.keywords[fuzzyKeyword] * 0.8 : 0);
    score += weight;
    if (weight >= MIN_MEANINGFUL_KEYWORD_WEIGHT) meaningfulMatches += 1;
  }
  const coverage = meaningfulMatches / Math.max(significantTokens.length, 1);
  if (!meaningfulMatches || score < MIN_WEIGHTED_SCORE || coverage < 0.5) return 0;
  const strength = Math.min(1, score / 18);
  const specificity = Math.min(1, meaningfulMatches / 2);
  return 0.58 + strength * 0.25 + specificity * 0.12;
}

const stopWords = new Set([
  "a", "an", "and", "do", "for", "get", "how", "i", "in", "is", "me", "my", "of", "the", "to", "want",
]);
