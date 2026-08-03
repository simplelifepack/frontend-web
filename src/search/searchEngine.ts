import { fuzzyPhraseConfidence } from "./fuzzyMatcher";
import { packageKeywordIndex } from "./packageKeywords";
import { compactSearchText, normalizeSearchText } from "./normalizer";
import { weightedKeywordConfidence } from "./ranking";
import { tokenize } from "./tokenizer";
import type { LocalSearchMatch, PackageKeywordEntry } from "./types";

export { LOCAL_MATCH_THRESHOLD } from "./confidence";

export function searchPackageKeywords(
  input: string,
  index: PackageKeywordEntry[] = packageKeywordIndex,
): LocalSearchMatch[] {
  const query = normalizeSearchText(input);
  if (!query) return [];

  return index
    .map((item) => scoreEntry(item, query))
    .filter((match): match is LocalSearchMatch => match !== null)
    .sort((left, right) => right.confidence - left.confidence || left.title.localeCompare(right.title));
}

function scoreEntry(item: PackageKeywordEntry, query: string): LocalSearchMatch | null {
  const title = normalizeSearchText(item.title);
  if (query === title || compactSearchText(query) === compactSearchText(title)) {
    return match(item, 1, "exact");
  }
  const exactAlias = item.aliases.find((alias) => {
    const normalized = normalizeSearchText(alias);
    return query === normalized || compactSearchText(query) === compactSearchText(normalized);
  });
  if (exactAlias) return match(item, 0.96, "contains");

  const weightedConfidence = weightedKeywordConfidence(item, tokenize(query));
  const fuzzyConfidence = Math.max(
    fuzzyPhraseConfidence(query, item.title),
    ...item.aliases.map((alias) => fuzzyPhraseConfidence(query, alias)),
  );
  const confidence = Math.max(weightedConfidence, fuzzyConfidence);
  return confidence > 0 ? match(item, confidence, weightedConfidence >= fuzzyConfidence ? "tokens" : "fuzzy") : null;
}

function match(item: PackageKeywordEntry, confidence: number, matchedBy: LocalSearchMatch["matchedBy"]) {
  return { slug: item.slug, title: item.title, confidence: Math.min(confidence, 1), matchedBy };
}
