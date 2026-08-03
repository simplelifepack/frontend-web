import { api, type ReadinessResult } from "@/lib/api";
import { makeSelectPackageReadiness } from "@/readiness/selectors";
import { store } from "@/store";
import { LOCAL_MATCH_THRESHOLD, searchPackageKeywords } from "./searchEngine";
import type { SearchDebugInfo } from "./types";

export type ResolvedReadinessSearch = {
  readiness: ReadinessResult;
  debug: SearchDebugInfo;
};

export class SearchResolutionError extends Error {
  constructor(message: string, readonly debug: SearchDebugInfo) {
    super(message);
    this.name = "SearchResolutionError";
  }
}

export async function resolveReadinessSearch(query: string): Promise<ResolvedReadinessSearch> {
  const startedAt = performance.now();
  const [localMatch] = searchPackageKeywords(query);
  const keywordMatch = Boolean(localMatch && localMatch.confidence >= LOCAL_MATCH_THRESHOLD);
  let aiCalled = !keywordMatch;
  try {
    const predefined = keywordMatch
      ? makeSelectPackageReadiness()(store.getState(), localMatch!.slug)?.result ?? null
      : null;
    aiCalled = !predefined?.matchedPack;
    const readiness = predefined?.matchedPack ? predefined : await api.ai.analyzeIntent(query);
    return {
      readiness,
      debug: {
        keywordMatch,
        aiCalled,
        backendLookup: aiCalled,
        executionTimeMs: Math.round(performance.now() - startedAt),
        reason: aiCalled ? "generated_package" : "keyword_match",
      },
    };
  } catch (error) {
    throw new SearchResolutionError(error instanceof Error ? error.message : "Unable to build readiness package.", {
      keywordMatch,
      aiCalled,
      backendLookup: true,
      executionTimeMs: Math.round(performance.now() - startedAt),
      reason: "request_failed",
    });
  }
}
